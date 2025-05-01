// src/components/RowSpanEditableTable.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Table, TableContainer, Paper } from '@mui/material';
import TableHeader from './Header';
import TableBodyComponent from './Body';
import { sample_products, sample_params } from '../../data/data';
import type {
    Product,
    Attribute,
    Params,
    ParamDetail,
    ParamType1,
    ParamType2,
    ParamType3,
} from '@/app/types'; // 必要な型をインポート

const RowSpanEditableTable: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(sample_products);
    const [paramsList, setParamsList] = useState<Params[]>(sample_params);

    // paramsList を検索しやすい Map に変換
    const paramsMap = useMemo(() => {
        const map = new Map<string, Params>();
        paramsList.forEach((p) => {
            map.set(`${p.productId}-${p.attributeId}`, p);
        });
        return map;
    }, [paramsList]);

    // --- データ変更ハンドラ ---
    const handleProductChange = useCallback(
        (productId: number, field: keyof Product, value: any) => {
            setProducts((prev) =>
                prev.map((p) => (p.productId === productId ? { ...p, [field]: value } : p)),
            );
        },
        [],
    );

    const handleAttributeChange = useCallback(
        (productId: number, attributeId: number, field: keyof Attribute, value: any) => {
            setProducts((prev) =>
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
            setParamsList((prev) =>
                prev.map((pl) =>
                    pl.productId === productId && pl.attributeId === attributeId
                        ? {
                              ...pl,
                              param: pl.param.map((pd) => {
                                  if (pd.paramId === paramId) {
                                      // 更新対象のオブジェクトをコピーし、指定されたフィールドを更新
                                      // field の型が広くなったため、TypeScript はどのサブタイプか
                                      // 特定できない。anyキャストを使うか、より詳細な型ガードが必要。
                                      // ここでは any キャストで対応する例:
                                      const updatedPd = { ...pd };
                                      (updatedPd as any)[field] = value;
                                      return updatedPd;
                                      // もしくは、より単純だが型エラーの可能性がある書き方:
                                      // return { ...pd, [field]: value };
                                  }
                                  return pd;
                              }),
                          }
                        : pl,
                ),
            );
        },
        [],
    ); // 依存配列は空

    const handleAddParam = useCallback(
        (
            productId: number,
            attributeId: number,
            afterParamId?: number, // どの Param の後に追加するか (undefined なら先頭 or 末尾)
        ) => {
            const newParamId = Date.now(); // 仮のユニークID

            setParamsList((prevParamsList) => {
                let foundAndUpdated = false;
                const updatedList = prevParamsList.map((pl) => {
                    if (pl.productId === productId && pl.attributeId === attributeId) {
                        foundAndUpdated = true;
                        const currentParams = pl.param;
                        let insertIndex = 0; // デフォルトは先頭

                        if (afterParamId !== undefined) {
                            const targetIndex = currentParams.findIndex(
                                (p) => p.paramId === afterParamId,
                            );
                            if (targetIndex !== -1) {
                                insertIndex = targetIndex + 1; // 見つかった要素の次
                            } else {
                                // afterParamId が指定されたが見つからない場合 (エラーケースだが、念のため末尾に追加)
                                console.warn(
                                    `afterParamId ${afterParamId} not found. Appending to the end.`,
                                );
                                insertIndex = currentParams.length;
                            }
                        } else if (currentParams.length > 0) {
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

                        // 挿入後に sortOrder を 0 から始まる連番 (例: 10刻み) に振り直す
                        updatedParamArray = updatedParamArray.map((p, index) => ({
                            ...p,
                            sortOrder: index * 10,
                        }));

                        console.log(
                            `Inserting new param at index ${insertIndex}. New array:`,
                            updatedParamArray,
                        ); // Debug log

                        return { ...pl, param: updatedParamArray };
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
            const targetProduct = products.find((p) => p.productId === productId);
            const targetAttribute = targetProduct?.attributes.find(
                (a) => a.attributeId === attributeId,
            );
            if (targetAttribute && !targetAttribute.paramHas) {
                handleAttributeChange(productId, attributeId, 'paramHas', true);
            }
        },
        [products, handleAttributeChange],
    );

    // --- Param削除ハンドラ ---
    const handleDeleteParam = useCallback(
        (productId: number, attributeId: number, paramId: number) => {
            setParamsList((prev) => {
                const nextList = prev.map((pl) => {
                    if (pl.productId === productId && pl.attributeId === attributeId) {
                        return {
                            ...pl,
                            param: pl.param.filter((pd) => pd.paramId !== paramId),
                        };
                    }
                    return pl;
                });

                // Paramが空になったら、そのParamsオブジェクト自体をリストから削除するかどうか
                // return nextList.filter(pl => !(pl.productId === productId && pl.attributeId === attributeId && pl.param.length === 0));
                // もしくは、空のparam配列を持つParamsオブジェクトを残す
                return nextList;
            });

            // paramが0になったらparamHasをfalseにするかどうかのロジック
            const remainingParams = paramsMap
                .get(`${productId}-${attributeId}`)
                ?.param.filter((pd) => pd.paramId !== paramId);
            if (remainingParams?.length === 0) {
                handleAttributeChange(productId, attributeId, 'paramHas', false);
            }
        },
        [paramsMap, handleAttributeChange],
    ); // paramsMapとhandleAttributeChangeに依存

    return (
        <TableContainer component={Paper} sx={{ margin: 2 }}>
            {' '}
            {/* 外側に余白 */}
            <Table sx={{ minWidth: 900 }} size="small" aria-label="spanning editable table">
                <TableHeader />
                <TableBodyComponent
                    products={products}
                    paramsMap={paramsMap}
                    handleProductChange={handleProductChange}
                    handleAttributeChange={handleAttributeChange}
                    handleParamChange={handleParamChange}
                    handleAddParam={handleAddParam}
                    handleDeleteParam={handleDeleteParam}
                />
            </Table>
        </TableContainer>
    );
};

export default RowSpanEditableTable;
