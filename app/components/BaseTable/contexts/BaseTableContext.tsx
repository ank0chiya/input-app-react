import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Attribute, Param, Params, Product, ChangeStatus } from '@/app/types';

// --- 仮ID生成用カウンター ---
// これらはTabbedDataManagerでリセットされることを想定するか、
// リセット用の関数をContextが提供しTabbedDataManagerが呼び出す
let tempProductIdCounterCtx = -1;
let tempAttributeIdCounterCtx = -1;

interface BaseTableContextType {
    tableData: Product[];
    isDirty: boolean;
    handleAddRow: (rowIndex: number) => void;
    handleDeleteRow: (rowIndex: number) => void;
    handleProductCellChange: (
        rowIndex: number,
        columnId: keyof Pick<Product, 'prefix' | 'type' | 'cfgType'>,
        value: string,
    ) => void;
    handleAddAttribute: (rowIndex: number, attributeIndex?: number) => void;
    handleDeleteAttribute: (rowIndex: number, attributeIndex: number) => void;
    handleMoveAttributeUp: (rowIndex: number, attributeIndex: number) => void;
    handleMoveAttributeDown: (rowIndex: number, attributeIndex: number) => void;
    handleAttributeCellChange: (
        productIndex: number,
        attributeIndex: number,
        columnId: keyof Omit<
            Attribute,
            'attributeId' | 'params' | 'paramHas' | '_status' | '_original' | 'sortOrder'
        >, // 編集可能なフィールド
        value: string | boolean | number,
    ) => void;
    handleAttributeParamHasChange: (
        productIndex: number,
        attributeIndex: number,
        newValue: boolean,
    ) => void;
}

const BaseTableContext = createContext<BaseTableContextType | undefined>(undefined);

interface BaseTableProviderProps {
    children: React.ReactNode;
    baseTableData: Product[];
    detailTableData: Params[];
    setProductData: React.Dispatch<React.SetStateAction<Product[]>>;
    setParamsData: React.Dispatch<React.SetStateAction<Params[]>>;
    onAddParamsDataRow: (targetRow: Product, updatedAttributes: Attribute) => void;
}

export function BaseTableProvider({
    children,
    baseTableData,
    detailTableData,
    setProductData,
    setParamsData,
    onAddParamsDataRow,
}: BaseTableProviderProps) {
    // isDirty: baseTableData 内に 'new', 'updated', 'deleted' ステータスのアイテムがあるか
    const isDirty = useMemo(() => {
        return baseTableData.some(
            (p) =>
                (p._status && p._status !== 'synced') ||
                (p.attributes || []).some((a) => a._status && a._status !== 'synced'),
        );
    }, [baseTableData]);

    const markProductAsModified = useCallback(
        (productIndex: number) => {
            setProductData((prev) =>
                prev.map((p, idx) =>
                    idx === productIndex && p._status !== 'new' ? { ...p, _status: 'updated' } : p,
                ),
            );
        },
        [setProductData],
    );

    // --- Product 操作ハンドラ (ローカルステートと _status の更新のみ) ---
    const createNewProductData = (productId: number, sortOrder: number): Product => ({
        productId: productId,
        prefix: `NEW_P${Math.abs(productId)}`,
        type: '',
        cfgType: '',
        attributes: [],
        sortOrder: sortOrder,
        _status: 'new',
    });

    // 行追加ボタンが押された時のハンドラ (親コンポーネントの関数を呼び出す)
    // --- Product 操作ハンドラ (ローカルステートと _status の更新) ---
    const handleAddRow = useCallback(
        (rowIndex: number) => {
            const newProductId = tempProductIdCounterCtx--;
            setProductData((prevData) => {
                const newRow = createNewProductData(
                    newProductId,
                    // 新しい行のsortOrder: 指定された行の次。もし末尾なら現在の最大+1
                    prevData[rowIndex]
                        ? prevData[rowIndex].sortOrder + 0.5
                        : prevData.length > 0
                          ? Math.max(...prevData.map((p) => p.sortOrder)) + 1
                          : 0,
                );
                const newData = [
                    ...prevData.slice(0, rowIndex + 1),
                    newRow,
                    ...prevData.slice(rowIndex + 1),
                ];
                // sortOrderを正規化
                return newData
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((p, index) => ({ ...p, sortOrder: index }));
            });
        },
        [setProductData, createNewProductData], // createNewProductDataを追加
    );

    // Attributeリストを更新し、Productのステータスも更新するヘルパー
    const updateAttributesInProduct = useCallback(
        (productIndex: number, newAttributes: Attribute[], markProductAsUpdated = true) => {
            setProductData((prev) => {
                return prev.map((p, idx) => {
                    if (idx === productIndex) {
                        return {
                            ...p,
                            attributes: newAttributes,
                            _status:
                                markProductAsUpdated && p._status !== 'new' ? 'updated' : p._status,
                        };
                    }
                    return p;
                });
            });
        },
        [setProductData],
    );

    // 行削除ボタンが押された時のハンドラ (親コンポーネントの関数を呼び出す)
    const handleDeleteRow = useCallback(
        (productIndex: number) => {
            const productToDelete = baseTableData[productIndex];
            if (!productToDelete) return;

            if (productToDelete._status === 'new') {
                setProductData((prev) =>
                    prev
                        .filter((_, i) => i !== productIndex)
                        .map((p, i) => ({ ...p, sortOrder: i })),
                );
            } else {
                setProductData((prev) =>
                    prev.map((p, i) => (i === productIndex ? { ...p, _status: 'deleted' } : p)),
                );
            }
            // 関連するParamsエントリの削除はonAddParamsDataRow経由で行う (paramHas: false として呼び出す)
            // もしProduct自体が削除されたら、そのProductに紐づく全AttributeのparamHasをfalseとして通知する必要がある
            if (productToDelete.attributes) {
                productToDelete.attributes.forEach((attr) => {
                    onAddParamsDataRow(productToDelete, { ...attr, paramHas: false });
                });
            }
        },
        [baseTableData, setProductData, onAddParamsDataRow], // onAddParamsDataRow を追加
    );

    // Productのセル (ID, タイプ, 設定タイプ) の値が変更された時のハンドラ
    // 修正不可にすること TODO
    const handleProductCellChange = useCallback(
        (
            productIndex: number,
            columnId: keyof Pick<Product, 'prefix' | 'type' | 'cfgType'>,
            value: string,
        ) => {
            setProductData((prevData) =>
                prevData.map((product, pIndex) =>
                    pIndex === productIndex
                        ? {
                              ...product,
                              [columnId]: value,
                              _status:
                                  product._status === 'new' ? 'new' : ('updated' as ChangeStatus),
                          }
                        : product,
                ),
            );
        },
        [setProductData],
    );

    // 属性を指定位置の後に追加するハンドラ
    const handleAddAttribute = useCallback(
        (productIndex: number, insertAfterAttributeIndex?: number) => {
            const product = baseTableData[productIndex];
            if (!product) return;

            const newAttributeId = tempAttributeIdCounterCtx--;
            const attributes = product.attributes || [];
            let newSortOrder = 0;
            if (
                insertAfterAttributeIndex !== undefined &&
                insertAfterAttributeIndex >= 0 &&
                attributes[insertAfterAttributeIndex]
            ) {
                newSortOrder = attributes[insertAfterAttributeIndex].sortOrder + 0.5; // 一時的な値
            } else if (attributes.length > 0) {
                newSortOrder = Math.max(0, ...attributes.map((a) => a.sortOrder)) + 1;
            }

            const newAttribute: Attribute = {
                attributeId: newAttributeId,
                attribute: `New Attr ${Math.abs(newAttributeId)}`,
                attributeType: 'string',
                attributeJP: '',
                attributeUnit: '',
                paramHas: false,
                contract: '',
                public: false,
                masking: false,
                online: false,
                sortOrder: newSortOrder,
                _status: 'new',
            };

            let newAttributesList: Attribute[];
            if (
                insertAfterAttributeIndex === undefined ||
                insertAfterAttributeIndex < 0 ||
                attributes.length === 0
            ) {
                newAttributesList = [newAttribute, ...attributes];
            } else {
                newAttributesList = [
                    ...attributes.slice(0, insertAfterAttributeIndex + 1),
                    newAttribute,
                    ...attributes.slice(insertAfterAttributeIndex + 1),
                ];
            }
            // sortOrderを正規化
            newAttributesList
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .forEach((attr, idx) => (attr.sortOrder = idx));

            markProductAsModified(productIndex); // Productに変更があったことをマーク
            setProductData((prev) =>
                prev.map((p, idx) =>
                    idx === productIndex ? { ...p, attributes: newAttributesList } : p,
                ),
            );
        },
        [baseTableData, setProductData, markProductAsModified],
    );

    // 属性を削除するハンドラ
    const handleDeleteAttribute = useCallback(
        (productIndex: number, attributeIndex: number) => {
            const product = baseTableData[productIndex];
            console.log('delete!!!!!!');
            if (!product || !product.attributes || !product.attributes[attributeIndex]) return;

            const attributeToToggle = product.attributes[attributeIndex];
            let newStatus: ChangeStatus;
            let finalAttributes: Attribute[];
            let attributeForParamsCallback: Attribute;

            if (attributeToToggle._status === 'new') {
                // 新規追加された属性を削除する場合は、リストから完全に物理除去
                finalAttributes = product.attributes.filter((_, idx) => idx !== attributeIndex);
                // この場合、attributeForParamsCallback は不要（Paramsエントリも作られていないか、作られていても無効になる）
                // ただし、万が一 paramHas が true になって onAddParamsDataRow が呼ばれていた場合に備え、
                // paramHas: false として通知する
                attributeForParamsCallback = {
                    ...attributeToToggle,
                    paramHas: false,
                    _status: 'deleted',
                }; // ステータスは便宜上deleted
            } else if (attributeToToggle._status === 'deleted') {
                // 既に 'deleted' 状態なら、'updated' に戻す (削除取り消し)
                newStatus = 'updated'; // 変更あり状態に戻す
                finalAttributes = product.attributes.map((attr, idx) =>
                    idx === attributeIndex ? { ...attr, _status: newStatus } : attr,
                );
                // paramHas は attributeToToggle の（削除マーク前の）値を復元するイメージだが、
                // onAddParamsDataRow は現在の paramHas を見て判断するので、
                // attributeToToggle の paramHas をそのまま使う
                attributeForParamsCallback = { ...attributeToToggle, _status: newStatus };
            } else {
                // 'synced' または 'updated' 状態のものを初回削除マーク付け
                newStatus = 'deleted';
                finalAttributes = product.attributes.map((attr, idx) =>
                    idx === attributeIndex ? { ...attr, _status: newStatus } : attr,
                );
                // 削除マーク時は Params エントリを削除依頼 (paramHas: false として通知)
                attributeForParamsCallback = {
                    ...attributeToToggle,
                    _status: newStatus,
                    paramHas: false,
                };
            }

            // 削除マークが付いていないアクティブな属性でソート順を正規化
            // (物理削除された'new'のアイテムは finalAttributes には既にない)
            const activeAttributes = finalAttributes.filter((attr) => attr._status !== 'deleted');
            activeAttributes
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .forEach((attr, idx) => (attr.sortOrder = idx));

            // resultAttributes は、activeAttributes に基づいてソート順を更新しつつ、
            // finalAttributes (削除マークがついたものも含む) から再構成する。
            const resultAttributes = finalAttributes.map((attr) => {
                if (attr._status === 'deleted') {
                    // 'new'で削除されたものはfinalAttributesにないので、これは既存の削除マーク
                    return attr;
                }
                const activeVersion = activeAttributes.find(
                    (a) => a.attributeId === attr.attributeId,
                );
                return activeVersion || attr; // 通常 activeVersion が見つかるはず (もしなければバグ)
            });

            markProductAsModified(productIndex); // 親Productに変更マーク
            setProductData((prev) =>
                prev.map((p, idx) =>
                    idx === productIndex ? { ...p, attributes: resultAttributes } : p,
                ),
            );

            // TabbedDataManagerにParamsエントリの更新を依頼
            onAddParamsDataRow(product, attributeForParamsCallback);
        },
        [baseTableData, setProductData, markProductAsModified, onAddParamsDataRow],
    );

    const handleAttributeCellChange = useCallback(
        (
            productIndex: number,
            attributeIndex: number,
            columnId: keyof Omit<
                Attribute,
                'attributeId' | 'params' | 'paramHas' | '_status' | '_original' | 'sortOrder'
            >,
            value: string | boolean | number,
        ) => {
            markProductAsModified(productIndex);
            setProductData((prev) =>
                prev.map((p, idx) => {
                    if (idx === productIndex) {
                        return {
                            ...p,
                            attributes: (p.attributes || []).map((attr, attrIdx) =>
                                attrIdx === attributeIndex
                                    ? {
                                          ...attr,
                                          [columnId]: value,
                                          _status:
                                              attr._status === 'new'
                                                  ? 'new'
                                                  : ('updated' as ChangeStatus),
                                      }
                                    : attr,
                            ),
                        };
                    }
                    return p;
                }),
            );
        },
        [setProductData, markProductAsModified],
    );

    // paramHas変更専用ハンドラ
    const handleAttributeParamHasChange = useCallback(
        (productIndex: number, attributeIndex: number, newValue: boolean) => {
            const product = baseTableData[productIndex]; // 更新前のProductの状態を取得
            const attribute = product?.attributes?.[attributeIndex];
            if (!product || !attribute) return;

            // 削除マークがついている属性のparamHasは変更できないようにする (UI側でも制御推奨)
            if (attribute._status === 'deleted' && newValue === true) {
                alert(
                    '削除予定の属性のパラメータは有効にできません。まず削除を取り消してください。',
                );
                // setProductDataでparamHasの値を強制的にfalseに戻すか、何もしない
                // ここでは何もしない（UI側でCheckboxをdisabledにするのが望ましい）
                return;
            }

            markProductAsModified(productIndex);
            let attributeWithNewParamHas: Attribute | undefined;

            setProductData((prev) =>
                prev.map((p, pIdx) => {
                    if (pIdx === productIndex) {
                        return {
                            ...p,
                            attributes: (p.attributes || []).map((attr, attrIdx) => {
                                if (attrIdx === attributeIndex) {
                                    attributeWithNewParamHas = {
                                        ...attr,
                                        paramHas: newValue,
                                        _status:
                                            attr._status === 'new'
                                                ? 'new'
                                                : ('updated' as ChangeStatus),
                                    };
                                    onAddParamsDataRow(product, attributeWithNewParamHas);
                                    return attributeWithNewParamHas;
                                }
                                return attr;
                            }),
                        };
                    }
                    return p;
                }),
            );
        },
        [baseTableData, setProductData, markProductAsModified, onAddParamsDataRow],
    );

    // 属性の順番を上に移動するハンドラ
    const handleMoveAttributeUp = useCallback(
        (productIndex: number, attributeIndex: number) => {
            const product = baseTableData[productIndex];
            if (
                !product ||
                attributeIndex === 0 ||
                !product.attributes ||
                product.attributes.length <= 1
            )
                return;

            const newAttributes = [...product.attributes];
            [newAttributes[attributeIndex - 1], newAttributes[attributeIndex]] = [
                newAttributes[attributeIndex],
                newAttributes[attributeIndex - 1],
            ];

            newAttributes.forEach((attr, idx) => {
                attr.sortOrder = idx; // sortOrderを再割り当て
                // 移動したアイテムとその隣のアイテムのステータスを 'updated' にする (新規でなければ)
                if (
                    (attr.attributeId === newAttributes[attributeIndex - 1].attributeId ||
                        attr.attributeId === newAttributes[attributeIndex].attributeId) &&
                    attr._status !== 'new'
                ) {
                    attr._status = 'updated';
                }
            });
            markProductAsModified(productIndex);
            updateAttributesInProduct(productIndex, newAttributes, false); // markProductAsModifiedは既に呼んだのでfalse
        },
        [baseTableData, updateAttributesInProduct, markProductAsModified], // updateAttributesInProductを依存配列に追加
    );

    // 属性の順番を下に移動するハンドラ
    const handleMoveAttributeDown = useCallback(
        (productIndex: number, attributeIndex: number) => {
            const product = baseTableData[productIndex];
            if (!product || !product.attributes || attributeIndex >= product.attributes.length - 1)
                return;

            const newAttributes = [...product.attributes];
            [newAttributes[attributeIndex + 1], newAttributes[attributeIndex]] = [
                newAttributes[attributeIndex],
                newAttributes[attributeIndex + 1],
            ];

            newAttributes.forEach((attr, idx) => {
                attr.sortOrder = idx; // sortOrderを再割り当て
                if (
                    (attr.attributeId === newAttributes[attributeIndex + 1].attributeId ||
                        attr.attributeId === newAttributes[attributeIndex].attributeId) &&
                    attr._status !== 'new'
                ) {
                    attr._status = 'updated';
                }
            });
            markProductAsModified(productIndex);
            updateAttributesInProduct(productIndex, newAttributes, false);
        },
        [baseTableData, updateAttributesInProduct, markProductAsModified], // updateAttributesInProductを依存配列に追加
    );

    const value = {
        tableData: baseTableData,
        isDirty,
        handleAddRow,
        handleDeleteRow,
        handleProductCellChange,
        handleAddAttribute,
        handleDeleteAttribute,
        handleMoveAttributeUp,
        handleMoveAttributeDown,
        handleAttributeCellChange,
        handleAttributeParamHasChange,
    };

    return <BaseTableContext.Provider value={value}>{children}</BaseTableContext.Provider>;
}

export function usePattern() {
    const context = useContext(BaseTableContext);
    if (context === undefined) {
        throw new Error('usePattern must be used within a BaseTableProvider');
    }
    return context;
}
