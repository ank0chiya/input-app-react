import {
    Attribute,
    Params,
    Product,
    ParamType1,
    ParamType2,
    ParamType3,
    ChangeStatus,
    ParamDetail,
} from '@/app/types';
import React, { createContext, useContext, useCallback, useMemo } from 'react';

// 仮ID生成用カウンター (Contextファイルスコープ)
let tempParamIdCounterDetailCtx = -1;

interface DetailTableContextType {
    tableData: Product[];
    paramsMap: Map<string, Params>;
    // 変更追跡と保存用
    isParamsDirtyForAttribute: (productId: number, attributeId: number) => boolean;

    // ParamItem操作ハンドラ (ローカルでの変更と_status設定)
    handleTestContext: (num1: number, num2: number) => void;
    handleAttributeChange: (
        productId: number,
        attributeId: number,
        field: keyof Attribute,
        value: any,
    ) => void;
    handleParamChange: (
        productId: number,
        attributeId: number,
        paramId: number,
        field: keyof ParamDetail,
        value: any,
    ) => void;
    handleAddParam: (
        productId: number,
        attributeId: number,
        afterParamId?: number, // どの Param の後に追加するか (undefined なら先頭 or 末尾)
    ) => void;
    handleDeleteParam: (productId: number, attributeId: number, paramId: number) => void;
    handleMoveParamUp: (productId: number, attributeId: number, paramId: number) => void;
    handleMoveParamDown: (productId: number, attributeId: number, paramId: number) => void;
}

const DetailTableContext = createContext<DetailTableContextType | undefined>(undefined);

interface DetailTableProviderProps {
    children: React.ReactNode;
    baseTableData: Product[];
    detailTableData: Params[];
    setProductData: React.Dispatch<React.SetStateAction<Product[]>>;
    setParamsData: React.Dispatch<React.SetStateAction<Params[]>>;
}

export function DetailTableProvider({
    children,
    baseTableData,
    detailTableData,
    setProductData,
    setParamsData,
}: DetailTableProviderProps) {
    const handleTestContext = useCallback((num1: number, num2: number) => {
        console.log('test context', num1, num2);
        console.log('test context sum', num1 + num2);
    }, []);

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

    // --- 変更追跡とParams操作のためのヘルパー ---
    const getActiveParamsEntry = useCallback(
        (productId: number, attributeId: number) => paramsMap.get(`${productId}-${attributeId}`),
        [paramsMap],
    );

    const isParamsDirtyForAttribute = useCallback(
        (productId: number, attributeId: number): boolean => {
            const entry = getActiveParamsEntry(productId, attributeId);
            return !!entry?.param.some((item) => item._status && item._status !== 'synced');
        },
        [getActiveParamsEntry],
    );

    const getAttributeContract = useCallback(
        (productId: number, attributeId: number) =>
            baseTableData
                .find((p) => p.productId === productId)
                ?.attributes.find((a) => a.attributeId === attributeId)?.contract,
        [baseTableData],
    );

    const getExpectedParamType = useCallback(
        (contract?: string): 'type1' | 'type2' | 'type3' =>
            contract === 'type1' ? 'type1' : contract === 'type2' ? 'type2' : 'type3',
        [],
    );

    // 新しいParamItemオブジェクトを作成する内部関数 (ユーザー提供のparamsDataTypeをベースに)
    const createNewParamItemInternal = useCallback(
        (paramId: number, contract: string | undefined, sortOrder: number): ParamDetail => {
            const type = getExpectedParamType(contract);
            switch (type) {
                case 'type1':
                    return { paramId, type, code: '', dispName: '', sortOrder, _status: 'new' };
                case 'type2':
                    return { paramId, type, min: 0, increment: 0, sortOrder, _status: 'new' };
                case 'type3':
                default:
                    return { paramId, type, code: '', dispName: '', sortOrder, _status: 'new' };
            }
        },
        [getExpectedParamType],
    );

    const handleAddParam = useCallback(
        (productId: number, attributeId: number, afterParamId?: number) => {
            const newParamId = tempParamIdCounterDetailCtx--;
            const contract = getAttributeContract(productId, attributeId);
            
            setParamsData((prevList) =>
                prevList.map((pl) => {
                    console.log(baseTableData)
                    if (pl.productId === productId && pl.attributeId === attributeId) {
                        const currentParamArray = pl.param || [];
                        let insertIndex = currentParamArray.length;
                        if (afterParamId !== undefined) {
                            const targetIdx = currentParamArray.findIndex(
                                (p) => p.paramId === afterParamId,
                            );
                            if (targetIdx !== -1) insertIndex = targetIdx + 1;
                        }
                        const tempSortOrder =
                            insertIndex > 0 && currentParamArray[insertIndex - 1]
                                ? currentParamArray[insertIndex - 1].sortOrder + 0.5
                                : (currentParamArray[0]?.sortOrder || 0) - 0.5;
                        const newParam = createNewParamItemInternal(
                            newParamId,
                            contract,
                            tempSortOrder,
                        );
                        let newParamList = [
                            ...currentParamArray.slice(0, insertIndex),
                            newParam,
                            ...currentParamArray.slice(insertIndex),
                        ];
                        newParamList
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .forEach((item, idx) => (item.sortOrder = idx));
                        return {
                            ...pl,
                            param: newParamList as ParamType1[] | ParamType2[] | ParamType3[],
                        };
                    }
                    console.log('contract', contract)
                    return pl;
                }),
            );
        },
        [setParamsData, getAttributeContract, createNewParamItemInternal],
    );

    const handleDeleteParam = useCallback(
        (productId: number, attributeId: number, paramId: number) => {
            setParamsData((prevList) =>
                prevList.map((pl) => {
                    if (pl.productId === productId && pl.attributeId === attributeId) {
                        const paramToDelete = (pl.param || []).find((p) => p.paramId === paramId);
                        if (!paramToDelete) return pl;
                        let newParamList;
                        if (paramToDelete._status === 'new') {
                            newParamList = pl.param.filter((p) => p.paramId !== paramId);
                        } else {
                            newParamList = pl.param.map((p) =>
                                p.paramId === paramId
                                    ? { ...p, _status: 'deleted' as ChangeStatus }
                                    : p,
                            );
                        }
                        const activeItems = newParamList.filter((p) => p._status !== 'deleted');
                        activeItems
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .forEach((p, idx) => (p.sortOrder = idx));
                        const finalParamList = newParamList
                            .map((originalParam) =>
                                originalParam.paramId === paramToDelete.paramId &&
                                paramToDelete._status !== 'new'
                                    ? { ...originalParam, _status: 'deleted' as ChangeStatus }
                                    : activeItems.find(
                                          (a) => a.paramId === originalParam.paramId,
                                      ) || originalParam,
                            )
                            .filter(
                                (p) =>
                                    !(
                                        p.paramId === paramToDelete.paramId &&
                                        paramToDelete._status === 'new'
                                    ),
                            );
                        return {
                            ...pl,
                            param: finalParamList as ParamType1[] | ParamType2[] | ParamType3[],
                        };
                    }
                    return pl;
                }),
            );
        },
        [setParamsData],
    );

    const handleParamChange = useCallback(
        (
            productId: number,
            attributeId: number,
            paramId: number,
            field: keyof ParamDetail,
            value: any,
        ) => {
            setParamsData((prevList) =>
                prevList.map((pl) => {
                    if (pl.productId === productId && pl.attributeId === attributeId) {
                        return {
                            ...pl,
                            param: (pl.param || []).map((p) =>
                                p.paramId === paramId
                                    ? {
                                          ...p,
                                          [field]: value,
                                          _status:
                                              p._status === 'new'
                                                  ? 'new'
                                                  : ('updated' as ChangeStatus),
                                      }
                                    : p,
                            ) as ParamType1[] | ParamType2[] | ParamType3[],
                        };
                    }
                    return pl;
                }),
            );
        },
        [setParamsData],
    );

    const moveParam = useCallback(
        (productId: number, attributeId: number, paramId: number, direction: 'up' | 'down') => {
            setParamsData((prevList) =>
                prevList.map((pl) => {
                    if (pl.productId === productId && pl.attributeId === attributeId) {
                        const params = [...(pl.param || [])];
                        const currentIndex = params.findIndex((p) => p.paramId === paramId);
                        if (currentIndex === -1) return pl;
                        const targetIndex =
                            direction === 'up' ? currentIndex - 1 : currentIndex + 1;
                        if (targetIndex < 0 || targetIndex >= params.length) return pl;
                        [params[currentIndex], params[targetIndex]] = [
                            params[targetIndex],
                            params[currentIndex],
                        ];
                        const newParamList = params.map((p, index) => {
                            const isMoved =
                                p.paramId === paramId ||
                                p.paramId ===
                                    (direction === 'up'
                                        ? params[currentIndex]?.paramId
                                        : params[currentIndex]?.paramId);
                            return {
                                ...p,
                                sortOrder: index,
                                _status:
                                    isMoved && p._status !== 'new'
                                        ? ('updated' as ChangeStatus)
                                        : p._status,
                            };
                        });
                        return {
                            ...pl,
                            param: newParamList as ParamType1[] | ParamType2[] | ParamType3[],
                        };
                    }
                    return pl;
                }),
            );
        },
        [setParamsData],
    );

    const paramsDataType = (
        newParamId: number,
        contract: string | undefined,
    ): ParamType1 | ParamType2 | ParamType3 => {
        if (contract === 'type1') {
            return {
                paramId: newParamId,
                type: 'type1' as const,
                code: '',
                dispName: '',
                sortOrder: -1, // 仮のソート順
            };
        } else if (contract === 'type2') {
            return {
                paramId: newParamId,
                type: 'type2' as const,
                min: 0,
                increment: 0,
                sortOrder: -1, // 仮のソート順
            };
        } else {
            return {
                paramId: newParamId,
                type: 'type3' as const,
                code: '',
                dispName: '',
                sortOrder: -1, // 仮のソート順
            };
        }
    };

    const handleMoveParamUp = useCallback(
        (pId, aId, paramId) => moveParam(pId, aId, paramId, 'up'),
        [moveParam],
    );
    const handleMoveParamDown = useCallback(
        (pId, aId, paramId) => moveParam(pId, aId, paramId, 'down'),
        [moveParam],
    );

    const getContractValue = (
        products: Product[],
        targetProductId: number,
        targetAttributeId: number,
    ): string | undefined => {
        const product = products.find((p) => p.productId === targetProductId);

        if (product) {
            const attribute = product.attributes.find(
                (attr) => attr.attributeId === targetAttributeId,
            );
            if (attribute) {
                return attribute.contract;
            }
        }
        return undefined;
    };

    const value = {
        tableData: baseTableData,
        paramsMap,
        isParamsDirtyForAttribute,
        handleParamChange,
        handleAddParam,
        handleDeleteParam,
        handleMoveParamUp,
        handleMoveParamDown,
        handleTestContext,
        handleAttributeChange,
    };

    return <DetailTableContext.Provider value={value}>{children}</DetailTableContext.Provider>;
}

export function usePattern() {
    const context = useContext(DetailTableContext);
    if (context === undefined) {
        throw new Error('usePattern must be used within a DetailTableProvider');
    }
    return context;
}
