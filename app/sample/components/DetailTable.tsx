// components/DetailTable.tsx
'use client';
import React, { useMemo, useCallback, JSX, useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { TableRowType, ParamType, Pattern1Type, Pattern2Type, PatternDataType } from '../types';
import { patternData } from '../data/initialData';
import {
    ReadOnlyCell,
    EditableCell,
    NumberInputCell,
    CheckboxCell,
    ItemTypeSelectCell,
    PatternActionButtons,
    ParentInfoCells,
    Pattern1Fields,
    Pattern2Fields,
} from './DetailTableCells';

interface DetailTableProps {
    tableData: TableRowType[];
    onDataChange: (updatedRow: TableRowType, originalIndex: number) => void;
    patternDataList?: PatternDataType[];
    onPatternDataChange?: (updatedPatternData: PatternDataType[]) => void;
}

// 型ガード (TableRowType のキーかチェック)
function isTableRowKey(key: string | number | symbol, obj: TableRowType): key is keyof TableRowType {
    return key in obj;
}

// 型ガード (ParamType のキーかチェック)
function isParamKey(key: string | number | symbol, obj: ParamType): key is keyof ParamType {
    return key in obj;
}

// DetailTable コンポーネント
const DetailTable = ({
    tableData,
    onDataChange,
    patternDataList = patternData,
    onPatternDataChange = () => {},
}: DetailTableProps): JSX.Element => {
    // パターンデータの状態管理
    const [localPatternData, setLocalPatternData] = useState<PatternDataType[]>(patternDataList);

    // patternDataList が変更されたら localPatternData を更新
    useEffect(() => {
        setLocalPatternData(patternDataList);
    }, [patternDataList]);

    // パターンデータの変更を親コンポーネントに通知
    const handlePatternDataUpdate = useCallback(
        (updatedData: PatternDataType[]) => {
            setLocalPatternData(updatedData);
            onPatternDataChange(updatedData);
        },
        [onPatternDataChange]
    );

    // 表示対象のパラメータを抽出（親行の情報も保持）
    const selectedParams = useMemo(() => {
        const paramsWithOptions: (ParamType & {
            parentRow: TableRowType;
            originalRowIndex: number;
            originalParamIndex: number;
        })[] = [];
        tableData.forEach((row, rowIndex) => {
            row.params.forEach((param, paramIndex) => {
                if (param.selected) {
                    paramsWithOptions.push({
                        ...param,
                        parentRow: row,
                        originalRowIndex: rowIndex,
                        originalParamIndex: paramIndex,
                    });
                }
            });
        });
        return paramsWithOptions;
    }, [tableData]);

    // --- データ変更ハンドラ ---
    // 親の行データを更新するためのヘルパー
    const handleParentRowUpdate = useCallback(
        (updatedRowData: TableRowType, originalRowIndex: number) => {
            onDataChange(updatedRowData, originalRowIndex);
        },
        [onDataChange]
    );

    // パラメータ自身のフィールド変更ハンドラ
    const handleParamFieldChange = useCallback(
        (
            filteredParamIndex: number, // selectedParams 配列内でのインデックス
            field: keyof ParamType,
            value: string | boolean | number
        ) => {
            const targetParamInfo = selectedParams[filteredParamIndex];
            if (!targetParamInfo) return;

            const { parentRow, originalRowIndex, originalParamIndex } = targetParamInfo;

            // 親行の params 配列を更新
            const updatedParams = parentRow.params.map((param, pIndex) =>
                pIndex === originalParamIndex ? { ...param, [field]: value } : param
            );
            // 更新された行データを作成
            const updatedRow = { ...parentRow, params: updatedParams };
            // 親に通知
            handleParentRowUpdate(updatedRow, originalRowIndex);
        },
        [selectedParams, handleParentRowUpdate]
    );

    // 親行のフィールド変更ハンドラ (itemType, online)
    const handleParentFieldChange = useCallback(
        (
            filteredParamIndex: number, // selectedParams 配列内でのインデックス
            field: keyof Pick<TableRowType, 'itemType' | 'online'>, // 対象フィールドを限定
            value: any
        ) => {
            const targetParamInfo = selectedParams[filteredParamIndex];
            if (!targetParamInfo) return;

            const { parentRow, originalRowIndex } = targetParamInfo;
            const updatedRow = { ...parentRow, [field]: value };

            handleParentRowUpdate(updatedRow, originalRowIndex);
        },
        [selectedParams, handleParentRowUpdate]
    );

    // パラメータごとのパターンデータを取得
    const getPatternDataForParam = useCallback(
        (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2') => {
            return localPatternData.find(
                (pd) => pd.cfgType === cfgType && pd.param === param && pd.itemType === itemType
            );
        },
        [localPatternData]
    );

    // パターンデータの変更ハンドラ
    const handlePatternDataChange = useCallback(
        (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2', updatedData: any[]) => {
            const existingPatternDataIndex = localPatternData.findIndex(
                (pd) => pd.cfgType === cfgType && pd.param === param && pd.itemType === itemType
            );

            let updatedPatternDataList: PatternDataType[];

            if (existingPatternDataIndex >= 0) {
                // 既存のパターンデータを更新
                updatedPatternDataList = localPatternData.map((pd, index) =>
                    index === existingPatternDataIndex ? { ...pd, data: updatedData } : pd
                );
            } else {
                // 新しいパターンデータを追加
                updatedPatternDataList = [...localPatternData, { cfgType, param, itemType, data: updatedData }];
            }

            handlePatternDataUpdate(updatedPatternDataList);
        },
        [localPatternData, handlePatternDataUpdate]
    );

    // Pattern1 の変更ハンドラ
    const handlePattern1Change = useCallback(
        (cfgType: string, param: string, patternIndex: number, field: keyof Pattern1Type, value: string) => {
            const patternDataItem = getPatternDataForParam(cfgType, param, 'pattern1');
            const currentData = (patternDataItem?.data as Pattern1Type[]) || [];

            const updatedData = currentData.map((item, index) =>
                index === patternIndex ? { ...item, [field]: value } : item
            );

            handlePatternDataChange(cfgType, param, 'pattern1', updatedData);
        },
        [getPatternDataForParam, handlePatternDataChange]
    );

    // Pattern2 の変更ハンドラ
    const handlePattern2Change = useCallback(
        (cfgType: string, param: string, patternIndex: number, field: keyof Pattern2Type, value: number) => {
            const patternDataItem = getPatternDataForParam(cfgType, param, 'pattern2');
            const currentData = (patternDataItem?.data as Pattern2Type[]) || [];

            const updatedData = currentData.map((item, index) =>
                index === patternIndex ? { ...item, [field]: value } : item
            );

            handlePatternDataChange(cfgType, param, 'pattern2', updatedData);
        },
        [getPatternDataForParam, handlePatternDataChange]
    );

    // パターンの追加ハンドラ
    const handleAddPattern = useCallback(
        (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2') => {
            const patternDataItem = getPatternDataForParam(cfgType, param, itemType);
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

            handlePatternDataChange(cfgType, param, itemType, updatedData);
        },
        [getPatternDataForParam, handlePatternDataChange]
    );

    // パターンの削除ハンドラ
    const handleDeletePattern = useCallback(
        (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2', patternIndex: number) => {
            const patternDataItem = getPatternDataForParam(cfgType, param, itemType);
            if (!patternDataItem) return;

            const currentData = patternDataItem.data;
            if (currentData.length <= 1) return; // 最後の1つは削除しない

            const updatedData = currentData.filter((_, index) => index !== patternIndex);
            handlePatternDataChange(cfgType, param, itemType, updatedData);
        },
        [getPatternDataForParam, handlePatternDataChange]
    );

    // パターンの移動ハンドラ（上へ）
    const handleMovePatternUp = useCallback(
        (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2', patternIndex: number) => {
            if (patternIndex <= 0) return; // 最初のパターンは上に移動できない

            const patternDataItem = getPatternDataForParam(cfgType, param, itemType);
            if (!patternDataItem) return;

            const currentData = [...patternDataItem.data];
            const temp = currentData[patternIndex];
            currentData[patternIndex] = currentData[patternIndex - 1];
            currentData[patternIndex - 1] = temp;

            handlePatternDataChange(cfgType, param, itemType, currentData);
        },
        [getPatternDataForParam, handlePatternDataChange]
    );

    // パターンの移動ハンドラ（下へ）
    const handleMovePatternDown = useCallback(
        (cfgType: string, param: string, itemType: 'pattern1' | 'pattern2', patternIndex: number) => {
            const patternDataItem = getPatternDataForParam(cfgType, param, itemType);
            if (!patternDataItem) return;

            if (patternIndex >= patternDataItem.data.length - 1) return; // 最後のパターンは下に移動できない

            const currentData = [...patternDataItem.data];
            const temp = currentData[patternIndex];
            currentData[patternIndex] = currentData[patternIndex + 1];
            currentData[patternIndex + 1] = temp;

            handlePatternDataChange(cfgType, param, itemType, currentData);
        },
        [getPatternDataForParam, handlePatternDataChange]
    );

    // --- JSX ---
    if (selectedParams.length === 0) {
        return (
            <Typography sx={{ p: 3 }}>
                表示するパラメータが選択されていません。基本情報タブで選択してください。
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 900 }} aria-label="editable detail parameter table">
                <TableHead
                    sx={{
                        backgroundColor: 'grey.100',
                        '& th': { fontWeight: 'bold', border: '1px solid rgba(224, 224, 224, 1)' },
                    }}
                >
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>タイプ</TableCell>
                        <TableCell>設定タイプ</TableCell>
                        <TableCell>パラメータ</TableCell>
                        <TableCell>日本語名</TableCell>
                        <TableCell>アイテムタイプ</TableCell>
                        <TableCell>パターン値/最小値</TableCell>
                        <TableCell>パターン説明/最大値</TableCell>
                        <TableCell>パターン備考/間隔</TableCell>
                        <TableCell>online</TableCell>
                        <TableCell>操作</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {selectedParams.map((paramInfo, filteredIndex) => {
                        const { parentRow } = paramInfo; // 親行データ
                        const isPattern1 = parentRow.itemType === 'pattern1';
                        const isPattern2 = parentRow.itemType === 'pattern2';

                        // パターンデータを取得
                        const patternDataItem = getPatternDataForParam(
                            parentRow.cfgType,
                            paramInfo.param,
                            parentRow.itemType
                        );

                        // パターンデータがない場合は空の配列を使用
                        let patterns: (Pattern1Type | Pattern2Type)[] = patternDataItem?.data || [];

                        // パターンがない場合は1つ追加（表示用）
                        if (patterns.length === 0) {
                            if (isPattern1) {
                                patterns = [{ pattern1Value: '', pattern1JP: '', pattern1Desc: '' } as Pattern1Type];
                            } else if (isPattern2) {
                                patterns = [{ pattern2Min: 0, pattern2Max: 100, pattern2Increment: 1 } as Pattern2Type];
                            }
                        }

                        // 行数を計算（パターン数）
                        const rowSpanCount = patterns.length;

                        return (
                            <>
                                {patterns.map((pattern, patternIndex) => {
                                    // Pattern1 または Pattern2 のデータとして扱う
                                    const pattern1Data = isPattern1
                                        ? (pattern as Pattern1Type)
                                        : { pattern1Value: '', pattern1JP: '', pattern1Desc: '' };
                                    const pattern2Data = isPattern2
                                        ? (pattern as Pattern2Type)
                                        : { pattern2Min: 0, pattern2Max: 100, pattern2Increment: 1 };

                                    return (
                                        <TableRow
                                            key={`${paramInfo.originalRowIndex}-${paramInfo.originalParamIndex}-${patternIndex}`}
                                            sx={{
                                                '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                                                '& > td': {
                                                    border: '1px solid rgba(224, 224, 224, 1)',
                                                    verticalAlign: 'middle',
                                                    p: 0.5,
                                                },
                                            }}
                                        >
                                            {/* 親情報は最初のパターン行でのみ表示 */}
                                            {patternIndex === 0 && (
                                                <ParentInfoCells
                                                    parentRow={parentRow}
                                                    paramInfo={paramInfo}
                                                    filteredIndex={filteredIndex}
                                                    rowSpanCount={rowSpanCount}
                                                    onParamFieldChange={handleParamFieldChange}
                                                    onParentFieldChange={handleParentFieldChange}
                                                />
                                            )}

                                            {/* パターン1のフィールド */}
                                            {isPattern1 && (
                                                <Pattern1Fields
                                                    pattern={pattern1Data}
                                                    cfgType={parentRow.cfgType}
                                                    param={paramInfo.param}
                                                    patternIndex={patternIndex}
                                                    onChange={handlePattern1Change}
                                                />
                                            )}

                                            {/* パターン2のフィールド */}
                                            {isPattern2 && (
                                                <Pattern2Fields
                                                    pattern={pattern2Data}
                                                    cfgType={parentRow.cfgType}
                                                    param={paramInfo.param}
                                                    patternIndex={patternIndex}
                                                    onChange={handlePattern2Change}
                                                />
                                            )}

                                            {/* online チェックボックスは最初のパターン行でのみ表示 */}
                                            {patternIndex === 0 && (
                                                <CheckboxCell
                                                    checked={parentRow.online}
                                                    onChange={(checked) =>
                                                        handleParentFieldChange(filteredIndex, 'online', checked)
                                                    }
                                                    rowSpan={rowSpanCount}
                                                />
                                            )}

                                            {/* パターン操作ボタン */}
                                            <PatternActionButtons
                                                onMoveUp={() =>
                                                    handleMovePatternUp(
                                                        parentRow.cfgType,
                                                        paramInfo.param,
                                                        parentRow.itemType,
                                                        patternIndex
                                                    )
                                                }
                                                onMoveDown={() =>
                                                    handleMovePatternDown(
                                                        parentRow.cfgType,
                                                        paramInfo.param,
                                                        parentRow.itemType,
                                                        patternIndex
                                                    )
                                                }
                                                onDelete={() =>
                                                    handleDeletePattern(
                                                        parentRow.cfgType,
                                                        paramInfo.param,
                                                        parentRow.itemType,
                                                        patternIndex
                                                    )
                                                }
                                                onAdd={
                                                    patternIndex === patterns.length - 1
                                                        ? () =>
                                                              handleAddPattern(
                                                                  parentRow.cfgType,
                                                                  paramInfo.param,
                                                                  parentRow.itemType
                                                              )
                                                        : undefined
                                                }
                                                isFirst={patternIndex === 0}
                                                isLast={patternIndex === patterns.length - 1}
                                                canDelete={patterns.length > 1}
                                            />
                                        </TableRow>
                                    );
                                })}
                            </>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DetailTable;
