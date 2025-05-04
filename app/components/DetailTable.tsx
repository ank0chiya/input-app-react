// src/components/RowSpanEditableTable.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Table, TableContainer, Paper } from '@mui/material';
import TableHeader from './DetailTable/Header';
import TableBodyComponent from './DetailTable/Body';
import { sample_products, sample_params } from '../data/data';
import type {
    Product,
    Attribute,
    Params,
    ParamDetail,
    ParamType1,
    ParamType2,
    ParamType3,
} from '@/app/types'; // 必要な型をインポート

interface BaseTableProps {
    baseTableData: Product[];
    setProductData: React.Dispatch<React.SetStateAction<Product[]>>;
    detailTableData: Params[];
    setParamsData: React.Dispatch<React.SetStateAction<Params[]>>;
}

const RowSpanEditableTable: React.FC<BaseTableProps> = ({
    baseTableData,
    detailTableData,
    setProductData,
    setParamsData,
}) => {

    // paramsList を検索しやすい Map に変換
    const paramsMap = useMemo(() => {
        const map = new Map<string, Params>();
        detailTableData.forEach((p) => {
            map.set(`${p.productId}-${p.attributeId}`, p);
        });
        return map;
    }, [detailTableData]);

    const handleAttributeChange = useCallback(
        (productId: number, attributeId: number, field: keyof Attribute, value: any) => {
            setProductData((prev) =>
                prev.map((p) =>
                    p.productId === productId
                        ? {
                              ...p,
                              attributes: p.attributes.map((a) =>
                                  a.attributeId === attributeId ? { ...a, [field]: value } : a,
                              ),
                          }
                        : p,
                ),
            );
        },
        [],
    );

    const handleParamChange = useCallback(
        (
            productId: number,
            attributeId: number,
            paramId: number,
            field: keyof ParamType1 | keyof ParamType2 | keyof ParamType3, // ← 型を更新
            value: any,
        ) => {
            setParamsData((prev): Params[] => {
                // set 関数が Params[] を受け取ることを明示
                return prev.map((pl): Params => {
                    // map の結果が Params であることを明示
                    // 更新対象でない場合はそのまま返す
                    if (!(pl.productId === productId && pl.attributeId === attributeId)) {
                        return pl;
                    }

                    // --- 更新対象の Params オブジェクト (pl) ---

                    // 1. 元の param 配列 (pl.param) がどの具体的な型か特定する
                    //    空配列でない限り、最初の要素の型で代表できる（混在しない前提のため）
                    let originalParamArrayType: 'type1' | 'type2' | 'type3' | 'empty' = 'empty';
                    if (pl.param.length > 0) {
                        // 最初の要素の型を取得 (Type Guard を使うとより安全)
                        const firstParamType = pl.param[0].type;
                        if (
                            firstParamType === 'type1' ||
                            firstParamType === 'type2' ||
                            firstParamType === 'type3'
                        ) {
                            originalParamArrayType = firstParamType;
                        } else {
                            // 予期しない型の場合 (エラーハンドリングが必要な場合あり)
                            console.error('Unknown param type detected in array:', pl.param[0]);
                            // この場合は更新せずに元の pl を返すなど、エラー処理が必要
                            return pl;
                        }
                    }

                    // 2. param 配列を map で更新する
                    //    この時点では updatedParamArray の型はまだ ParamDetail[] と推論される
                    const updatedParamArray = pl.param.map((pd) => {
                        if (pd.paramId === paramId) {
                            const updatedPd = { ...pd };
                            // any キャストを用いてフィールドを更新
                            // field の型チェックは呼び出し元と引数の型定義で行われている前提
                            (updatedPd as any)[field] = value;
                            return updatedPd;
                        }
                        return pd;
                    });

                    // 3. 更新後の配列を、特定した元の型に型アサーションする
                    let typedUpdatedParamArray: ParamType1[] | ParamType2[] | ParamType3[];

                    switch (originalParamArrayType) {
                        case 'type1':
                            // この配列は ParamType1 の要素のみで構成されているはず、と TypeScript に伝える
                            typedUpdatedParamArray = updatedParamArray as ParamType1[];
                            break;
                        case 'type2':
                            typedUpdatedParamArray = updatedParamArray as ParamType2[];
                            break;
                        case 'type3':
                            typedUpdatedParamArray = updatedParamArray as ParamType3[];
                            break;
                        case 'empty':
                        default:
                            // 元が空配列だった場合、更新後も空配列のはず
                            // (もし要素を追加するロジックなら別途考慮が必要)
                            // 空配列はどの型にも割り当て可能なので、ここでは空配列を返す
                            typedUpdatedParamArray = [];
                            break;
                    }

                    // 4. 型アサーション済みの配列を使って Params オブジェクトを返す
                    //    これで { ...pl, param: typedUpdatedParamArray } の型が Params と一致する
                    return { ...pl, param: typedUpdatedParamArray };
                });
            });
        },
        [],
    ); // 依存配列は空 (setXXX のコールバック内では常に最新の prevXXX が参照される)

    const handleAddParam = useCallback(
        (
            productId: number,
            attributeId: number,
            afterParamId?: number, // どの Param の後に追加するか (undefined なら先頭 or 末尾)
        ) => {
            const newParamId = Date.now(); // 仮のユニークID

            setParamsData((prev) => {
                let foundAndUpdated = false;
                const updatedList = prev.map((pl) => {
                    if (pl.productId === productId && pl.attributeId === attributeId) {
                        foundAndUpdated = true;
                        const currentParams = pl.param;
                        let insertIndex = 0; // デフォルトは先頭

                        if (afterParamId !== undefined) {
                            const targetIndex = currentParams.findIndex(
                                (p) => p.paramId === afterParamId,
                            );
                            insertIndex =
                                targetIndex !== -1 ? targetIndex + 1 : currentParams.length;
                        } else {
                            // afterParamId がなく、既に要素がある場合は末尾に追加 (あるいは要件に応じて先頭 insertIndex=0 のまま)
                            insertIndex = currentParams.length; // ここでは末尾に追加する仕様とする
                        }

                        // 新しいParamオブジェクト (sortOrderは後で再割り当てするので仮の値)
                        const newParam: ParamType1 = {
                            // Type1を例とする
                            paramId: newParamId,
                            type: 'type1',
                            code: '',
                            dispName: '',
                            sortOrder: -1, // 仮のソート順
                        };

                        // 新しい配列を作成し、計算した位置に挿入
                        let updatedParamArray = [
                            ...currentParams.slice(0, insertIndex),
                            newParam,
                            ...currentParams.slice(insertIndex),
                        ];

                        updatedParamArray = updatedParamArray.map((p, index) => ({
                            ...p,
                            sortOrder: index * 10,
                        })); // sortOrder 再割り当て
                        return { ...pl, param: updatedParamArray as ParamType1[] }; // 型アサーションが必要な場合あり
                    }
                    return pl;
                });

                // 対象の productId-attributeId の組み合わせが prevParamsList になかった場合 (最初のパラメータ追加)
                if (!foundAndUpdated) {
                    console.log(`Adding first parameter for ${productId}-${attributeId}`); // Debug log
                    updatedList.push({
                        productId,
                        attributeId,
                        param: [
                            {
                                // sortOrder: 0 で追加
                                paramId: newParamId,
                                type: 'type1',
                                code: '',
                                dispName: '',
                                sortOrder: 0,
                            },
                        ],
                    });
                }

                return updatedList;
            });
            // paramHas を true にする処理 (前回の回答と同様)
            const targetProduct = baseTableData.find((p) => p.productId === productId);
            const targetAttribute = targetProduct?.attributes.find(
                (a) => a.attributeId === attributeId,
            );
            if (targetAttribute && !targetAttribute.paramHas) {
                handleAttributeChange(productId, attributeId, 'paramHas', true);
            }
        },
        [baseTableData, handleAttributeChange],
    );

    // --- Param削除ハンドラ ---
    const handleDeleteParam = useCallback(
        (productId: number, attributeId: number, paramId: number) => {
            setParamsData((prev) => {
                const nextList = prev.map((pl) => {
                    if (pl.productId === productId && pl.attributeId === attributeId) {
                        const updatedParam = pl.param
                            .filter((pd) => pd.paramId !== paramId)
                            .map((p, index) => ({ ...p, sortOrder: index * 10 })); // 削除後も sortOrder 再計算
                        return { ...pl, param: updatedParam };
                    }
                    return pl;
                });

                // 削除の結果 param が空になったら paramHas を false にする
                const targetParams = nextList.find(
                    (p) => p.productId === productId && p.attributeId === attributeId,
                );
                if (targetParams && targetParams.param.length === 0) {
                    handleAttributeChange(productId, attributeId, 'paramHas', false);
                }
                return nextList as Params[];
            });
        },
        [paramsMap, handleAttributeChange],
    ); // paramsMapとhandleAttributeChangeに依存

    // / --- パラメータ移動ハンドラ ---
    const moveParam = useCallback((
        productId: number,
        attributeId: number,
        paramId: number,
        direction: 'up' | 'down'
    ) => {
        setParamsData((prev) => {
            return prev.map(pl => {
                if (pl.productId === productId && pl.attributeId === attributeId) {
                    const params = pl.param;
                    const currentIndex = params.findIndex(p => p.paramId === paramId);
                    if (currentIndex === -1) return pl;

                    let newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
                    if (newIndex < 0 || newIndex >= params.length) return pl; // 範囲外なら何もしない

                    const newParams = [...params]; // 配列をコピー
                    // 要素を入れ替え
                    [newParams[currentIndex], newParams[newIndex]] = [newParams[newIndex], newParams[currentIndex]];

                    // sortOrder をインデックスに基づいて再割り当て
                    const sortedParams = newParams.map((p, index) => ({
                        ...p,
                        sortOrder: index * 10,
                    }));

                    // 型アサーション（必要であれば）
                    const paramType = sortedParams[0]?.type;
                    let typedSortedParams: ParamType1[] | ParamType2[] | ParamType3[] = [];
                     if (paramType === 'type1') typedSortedParams = sortedParams as ParamType1[];
                     else if (paramType === 'type2') typedSortedParams = sortedParams as ParamType2[];
                     else if (paramType === 'type3') typedSortedParams = sortedParams as ParamType3[];
                     else typedSortedParams = []; // 空の場合

                    return { ...pl, param: typedSortedParams };
                }
                return pl;
            });
        });
    }, []); // 依存配列は空でOK

    const handleMoveParamUp = useCallback((productId: number, attributeId: number, paramId: number) => {
        moveParam(productId, attributeId, paramId, 'up');
    }, [moveParam]);

    const handleMoveParamDown = useCallback((productId: number, attributeId: number, paramId: number) => {
        moveParam(productId, attributeId, paramId, 'down');
    }, [moveParam]);

    return (
        <TableContainer component={Paper}>
            {' '}
            {/* 外側に余白 */}
            <Table sx={{ minWidth: 900 }} size="small" aria-label="spanning editable table">
                <TableHeader />
                <TableBodyComponent
                    products={baseTableData}
                    paramsMap={paramsMap}
                    handleAttributeChange={handleAttributeChange}
                    handleParamChange={handleParamChange}
                    handleAddParam={handleAddParam}
                    handleDeleteParam={handleDeleteParam}
                    handleMoveParamUp={handleMoveParamUp}   // 移動ハンドラを渡す
                    handleMoveParamDown={handleMoveParamDown} // 移動ハンドラを渡す
                />
            </Table>
        </TableContainer>
    );
};

export default RowSpanEditableTable;
