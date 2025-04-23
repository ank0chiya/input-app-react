// components/DetailTable.tsx
'use client';
import React, { useMemo, useCallback, JSX, Fragment } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { TableRowType, ParamType, Pattern1Type, Pattern2Type, PatternDataType } from '../types';
import { PatternProvider } from '../contexts/PatternContext';
import {
    ReadOnlyCell,
    EditableCell,
    NumberInputCell,
    CheckboxCell,
    ItemTypeSelectCell,
    PatternActionButtons,
    ParentInfoCells,
    PatternFields,
} from './DetailTableCells';

interface DetailTableProps {
    tableData: TableRowType[];
    onDataChange: (updatedRow: TableRowType, originalIndex: number) => void;
    patternDataList: PatternDataType[];
    onPatternDataChange: (updatedPatternData: PatternDataType[]) => void;
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
    patternDataList,
    onPatternDataChange,
}: DetailTableProps): JSX.Element => {
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

    // 親行のフィールド変更ハンドラ (online)
    const handleParentFieldChange = useCallback(
        (
            filteredParamIndex: number, // selectedParams 配列内でのインデックス
            field: keyof Pick<TableRowType, 'online'>,
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

    // --- JSX ---
    if (selectedParams.length === 0) {
        return (
            <Typography sx={{ p: 3 }}>
                表示するパラメータが選択されていません。基本情報タブで選択してください。
            </Typography>
        );
    }

    return (
        <PatternProvider initialData={patternDataList} onPatternDataChange={onPatternDataChange}>
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
                            <TableCell>パターン値</TableCell>
                            <TableCell>パターン説明</TableCell>
                            <TableCell>パターン備考</TableCell>
                            <TableCell>最小値</TableCell>
                            <TableCell>最大値</TableCell>
                            <TableCell>間隔</TableCell>
                            <TableCell>online</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedParams.map((paramInfo, filteredIndex) => {
                            const { parentRow } = paramInfo;
                            const patterns = paramInfo.itemType === 'pattern1'
                                ? [{ pattern1Value: '', pattern1JP: '', pattern1Desc: '' } as Pattern1Type]
                                : [{ pattern2Min: 0, pattern2Max: 100, pattern2Increment: 1 } as Pattern2Type];

                            const rowSpanCount = patterns.length;

                            return (
                                <Fragment key={`${paramInfo.originalRowIndex}-${paramInfo.originalParamIndex}`}>
                                    {patterns.map((pattern, patternIndex) => {
                                        const pattern1Data = paramInfo.itemType === 'pattern1'
                                            ? (pattern as Pattern1Type)
                                            : { pattern1Value: '', pattern1JP: '', pattern1Desc: '' };
                                        const pattern2Data = paramInfo.itemType === 'pattern2'
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

                                                <PatternFields
                                                    pattern1Data={pattern1Data}
                                                    pattern2Data={pattern2Data}
                                                    cfgType={parentRow.cfgType}
                                                    param={paramInfo.param}
                                                    patternIndex={patternIndex}
                                                    itemType={paramInfo.itemType}
                                                />

                                                {patternIndex === 0 && (
                                                    <CheckboxCell
                                                        checked={parentRow.online}
                                                        onChange={(checked) =>
                                                            handleParentFieldChange(filteredIndex, 'online', checked)
                                                        }
                                                        rowSpan={rowSpanCount}
                                                    />
                                                )}

                                                <PatternActionButtons
                                                    cfgType={parentRow.cfgType}
                                                    param={paramInfo.param}
                                                    itemType={paramInfo.itemType}
                                                    patternIndex={patternIndex}
                                                    isFirst={patternIndex === 0}
                                                    isLast={patternIndex === patterns.length - 1}
                                                    canDelete={patterns.length > 1}
                                                />
                                            </TableRow>
                                        );
                                    })}
                                </Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </PatternProvider>
    );
};

export default DetailTable;
