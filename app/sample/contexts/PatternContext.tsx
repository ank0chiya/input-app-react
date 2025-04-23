'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { Pattern1Type, Pattern2Type, PatternDataType } from '../types';
import { patternData as initialPatternData } from '../data/initialData';

interface PatternContextType {
    patternData: PatternDataType[];
    updatePatternDataAction: (updatedData: PatternDataType[]) => void;
    addPatternAction: (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2') => void;
    deletePatternAction: (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2', patternIndex: number) => void;
    movePatternUpAction: (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2', patternIndex: number) => void;
    movePatternDownAction: (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2', patternIndex: number) => void;
    updatePattern1Action: (cfgType: string, param: string, patternIndex: number, field: keyof Pattern1Type, value: string) => void;
    updatePattern2Action: (cfgType: string, param: string, patternIndex: number, field: keyof Pattern2Type, value: number) => void;
}

const PatternContext = createContext<PatternContextType | undefined>(undefined);

interface PatternProviderProps {
    children: ReactNode;
    initialData?: PatternDataType[];
    onPatternDataChange?: (updatedData: PatternDataType[]) => void;
}

export function PatternProvider({ 
    children, 
    initialData = initialPatternData,
    onPatternDataChange = () => {}
}: PatternProviderProps) {
    // パターンデータの取得ヘルパー
    const getPatternDataForParam = useCallback(
        (patternData: PatternDataType[], cfgType: string, param: string, itemType: 'pattern1' | 'pattern2') => {
            return patternData.find(
                (pd) => pd.cfgType === cfgType && pd.param === param && pd.itemType === itemType
            );
        },
        []
    );

    // パターンデータの更新アクション
    const updatePatternDataAction = useCallback(
        (updatedData: PatternDataType[]) => {
            onPatternDataChange(updatedData);
        },
        [onPatternDataChange]
    );

    // パターンデータの変更ヘルパー
    const handlePatternDataChange = useCallback(
        (patternData: PatternDataType[], cfgType: string, param: string, itemType: 'pattern1' | 'pattern2', updatedData: any[]) => {
            const existingPatternDataIndex = patternData.findIndex(
                (pd) => pd.cfgType === cfgType && pd.param === param && pd.itemType === itemType
            );

            let updatedPatternDataList: PatternDataType[];

            if (existingPatternDataIndex >= 0) {
                updatedPatternDataList = patternData.map((pd, index) =>
                    index === existingPatternDataIndex ? { ...pd, data: updatedData } : pd
                );
            } else {
                updatedPatternDataList = [...patternData, { cfgType, param, itemType, data: updatedData }];
            }

            return updatedPatternDataList;
        },
        []
    );

    // パターン追加アクション
    const addPatternAction = useCallback(
        (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2') => {
            const patternDataItem = getPatternDataForParam(initialData, cfgType, param, itemType);
            let currentData = patternDataItem?.data || [];
            let updatedData;

            if (itemType === 'pattern1') {
                updatedData = [
                    ...(currentData as Pattern1Type[]),
                    { pattern1Value: '', pattern1JP: '', pattern1Desc: '' },
                ];
            } else {
                updatedData = [
                    ...(currentData as Pattern2Type[]),
                    { pattern2Min: 0, pattern2Max: 100, pattern2Increment: 1 },
                ];
            }

            const updatedPatternData = handlePatternDataChange(initialData, cfgType, param, itemType, updatedData);
            updatePatternDataAction(updatedPatternData);
        },
        [initialData, getPatternDataForParam, handlePatternDataChange, updatePatternDataAction]
    );

    // パターン削除アクション
    const deletePatternAction = useCallback(
        (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2', patternIndex: number) => {
            const patternDataItem = getPatternDataForParam(initialData, cfgType, param, itemType);
            if (!patternDataItem) return;

            const currentData = patternDataItem.data;
            if (currentData.length <= 1) return; // 最後の1つは削除しない

            const updatedData = currentData.filter((_, index) => index !== patternIndex);
            const updatedPatternData = handlePatternDataChange(initialData, cfgType, param, itemType, updatedData);
            updatePatternDataAction(updatedPatternData);
        },
        [initialData, getPatternDataForParam, handlePatternDataChange, updatePatternDataAction]
    );

    // パターンを上に移動するアクション
    const movePatternUpAction = useCallback(
        (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2', patternIndex: number) => {
            if (patternIndex <= 0) return;

            const patternDataItem = getPatternDataForParam(initialData, cfgType, param, itemType);
            if (!patternDataItem) return;

            const currentData = [...patternDataItem.data];
            const temp = currentData[patternIndex];
            currentData[patternIndex] = currentData[patternIndex - 1];
            currentData[patternIndex - 1] = temp;

            const updatedPatternData = handlePatternDataChange(initialData, cfgType, param, itemType, currentData);
            updatePatternDataAction(updatedPatternData);
        },
        [initialData, getPatternDataForParam, handlePatternDataChange, updatePatternDataAction]
    );

    // パターンを下に移動するアクション
    const movePatternDownAction = useCallback(
        (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2', patternIndex: number) => {
            const patternDataItem = getPatternDataForParam(initialData, cfgType, param, itemType);
            if (!patternDataItem) return;

            if (patternIndex >= patternDataItem.data.length - 1) return;

            const currentData = [...patternDataItem.data];
            const temp = currentData[patternIndex];
            currentData[patternIndex] = currentData[patternIndex + 1];
            currentData[patternIndex + 1] = temp;

            const updatedPatternData = handlePatternDataChange(initialData, cfgType, param, itemType, currentData);
            updatePatternDataAction(updatedPatternData);
        },
        [initialData, getPatternDataForParam, handlePatternDataChange, updatePatternDataAction]
    );

    // Pattern1の更新アクション
    const updatePattern1Action = useCallback(
        (cfgType: string, param: string, patternIndex: number, field: keyof Pattern1Type, value: string) => {
            const patternDataItem = getPatternDataForParam(initialData, cfgType, param, 'pattern1');
            const currentData = (patternDataItem?.data as Pattern1Type[]) || [];

            const updatedData = currentData.map((item, index) =>
                index === patternIndex ? { ...item, [field]: value } : item
            );

            const updatedPatternData = handlePatternDataChange(initialData, cfgType, param, 'pattern1', updatedData);
            updatePatternDataAction(updatedPatternData);
        },
        [initialData, getPatternDataForParam, handlePatternDataChange, updatePatternDataAction]
    );

    // Pattern2の更新アクション
    const updatePattern2Action = useCallback(
        (cfgType: string, param: string, patternIndex: number, field: keyof Pattern2Type, value: number) => {
            const patternDataItem = getPatternDataForParam(initialData, cfgType, param, 'pattern2');
            const currentData = (patternDataItem?.data as Pattern2Type[]) || [];

            const updatedData = currentData.map((item, index) =>
                index === patternIndex ? { ...item, [field]: value } : item
            );

            const updatedPatternData = handlePatternDataChange(initialData, cfgType, param, 'pattern2', updatedData);
            updatePatternDataAction(updatedPatternData);
        },
        [initialData, getPatternDataForParam, handlePatternDataChange, updatePatternDataAction]
    );

    const value = {
        patternData: initialData,
        updatePatternDataAction,
        addPatternAction,
        deletePatternAction,
        movePatternUpAction,
        movePatternDownAction,
        updatePattern1Action,
        updatePattern2Action,
    };

    return (
        <PatternContext.Provider value={value}>
            {children}
        </PatternContext.Provider>
    );
}

export function usePattern() {
    const context = useContext(PatternContext);
    if (context === undefined) {
        throw new Error('usePattern must be used within a PatternProvider');
    }
    return context;
}
