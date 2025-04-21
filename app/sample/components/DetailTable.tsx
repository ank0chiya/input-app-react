// components/DetailTable.tsx
'use client';
import React, { useMemo, useCallback, JSX } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Checkbox, TextField, Button, IconButton, Box, Select, MenuItem, FormControl,
    Stack, Tooltip, Typography, InputLabel, Grid, // Grid を追加
} from '@mui/material';
// Pattern1Editor, Pattern2Editor をインポートまたは定義 (後述)
// import { Pattern1Editor, Pattern2Editor } from './PatternEditors';
import { TableRowType, Column, ParamType, Pattern1Type, Pattern2Type } from '../types';
// secondTabTableColumns はヘッダー構造が複雑なため、直接JSXで記述


// ★ Pattern1Editor と Pattern2Editor の実装例（DetailTable 内または別ファイル）
const Pattern1Editor = ({ pattern1Data, onChange, disabled = false }: { pattern1Data: Pattern1Type, onChange: (field: keyof Pattern1Type, value: string) => void, disabled?: boolean }) => {
    return (
        <Stack spacing={1}>
            <TextField label="パターン1 値" size="small" value={pattern1Data.pattern1Value} onChange={e => onChange('pattern1Value', e.target.value)} disabled={disabled} variant="standard" />
            <TextField label="パターン1 説明" size="small" value={pattern1Data.pattern1JP} onChange={e => onChange('pattern1JP', e.target.value)} disabled={disabled} variant="standard" />
            <TextField label="パターン1 備考" size="small" value={pattern1Data.pattern1Desc} onChange={e => onChange('pattern1Desc', e.target.value)} disabled={disabled} variant="standard" />
        </Stack>
    );
};

const Pattern2Editor = ({ pattern2Data, onChange, disabled = false }: { pattern2Data: Pattern2Type, onChange: (field: keyof Pattern2Type, value: number) => void, disabled?: boolean }) => {
    const handleNumberChange = (field: keyof Pattern2Type, value: string) => {
        const num = parseInt(value, 10);
        if (!isNaN(num)) { onChange(field, num); }
        // else if (value === '') { onChange(field, 0); } // 空の場合の扱い
    };
    return (
        <Stack spacing={1}>
            <TextField label="パターン2 最小値" type="number" size="small" value={pattern2Data.pattern2Min} onChange={e => handleNumberChange('pattern2Min', e.target.value)} disabled={disabled} variant="standard" />
            <TextField label="パターン2 最大値" type="number" size="small" value={pattern2Data.pattern2Max} onChange={e => handleNumberChange('pattern2Max', e.target.value)} disabled={disabled} variant="standard" />
            <TextField label="パターン2 間隔" type="number" size="small" value={pattern2Data.pattern2Increment} onChange={e => handleNumberChange('pattern2Increment', e.target.value)} disabled={disabled} variant="standard" />
        </Stack>
    );
};

interface DetailTableProps {
    tableData: TableRowType[];
    onDataChange: (updatedRow: TableRowType, originalIndex: number) => void;
}


// 型ガード (TableRowType のキーかチェック)
function isTableRowKey(key: string | number | symbol, obj: TableRowType): key is keyof TableRowType {
    return key in obj;
}

// 型ガード (ParamType のキーかチェック)
function isParamKey(key: string | number | symbol, obj: ParamType): key is keyof ParamType {
    return key in obj;
}
// ★ DetailTable を再作成
const DetailTable = ({ tableData, onDataChange }: DetailTableProps): JSX.Element => {

    // 表示対象のパラメータを抽出（親行の情報も保持）
    const selectedParams = useMemo(() => {
        const paramsWithOptions: (ParamType & { parentRow: TableRowType; originalRowIndex: number; originalParamIndex: number })[] = [];
        tableData.forEach((row, rowIndex) => {
            row.params.forEach((param, paramIndex) => {
                if (param.selected) {
                    paramsWithOptions.push({ ...param, parentRow: row, originalRowIndex: rowIndex, originalParamIndex: paramIndex });
                }
            });
        });
        return paramsWithOptions;
    }, [tableData]);


    // --- データ変更ハンドラ ---
    // 親の行データを更新するためのヘルパー
    const handleParentRowUpdate = useCallback((updatedRowData: TableRowType, originalRowIndex: number) => {
        onDataChange(updatedRowData, originalRowIndex);
    }, [onDataChange]);

    // パラメータ自身のフィールド変更ハンドラ
    const handleParamFieldChange = useCallback((
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

    }, [selectedParams, handleParentRowUpdate]);

    // 親行のフィールド変更ハンドラ (itemType, online, pattern1, pattern2)
    const handleParentFieldChange = useCallback((
        filteredParamIndex: number, // selectedParams 配列内でのインデックス
        field: keyof Pick<TableRowType, 'itemType' | 'online' | 'pattern1' | 'pattern2'>, // 対象フィールドを限定
        value: any
    ) => {
        const targetParamInfo = selectedParams[filteredParamIndex];
        if (!targetParamInfo) return;

        const { parentRow, originalRowIndex } = targetParamInfo;
        const updatedRow = { ...parentRow, [field]: value };

        // itemType が変更された場合のクリア処理 (任意)
        if (field === 'itemType') {
            if (value === 'pattern1') {
                updatedRow.pattern2 = [];
                if (!updatedRow.pattern1 || updatedRow.pattern1.length === 0) {
                    updatedRow.pattern1 = [{ pattern1Value: '', pattern1JP: '', pattern1Desc: '' }];
                }
            } else if (value === 'pattern2') {
                updatedRow.pattern1 = [];
                if (!updatedRow.pattern2 || updatedRow.pattern2.length === 0) {
                    updatedRow.pattern2 = [{ pattern2Min: 0, pattern2Max: 100, pattern2Increment: 1 }];
                }
            }
        }

        handleParentRowUpdate(updatedRow, originalRowIndex);

    }, [selectedParams, handleParentRowUpdate]);

    // useCallback でメモ化
    // DetailTable 内の表示上のインデックス (filteredIndex) と元のインデックス (originalIndex) を使う
    const handleDetailRowUpdate = useCallback((updatedRow: TableRowType, originalIndex: number) => {
        // originalIndex を使って親に通知
        onDataChange(updatedRow, originalIndex);
    }, [onDataChange]);


    // Pattern1 (親行) の変更ハンドラ
    const handlePattern1Change = useCallback((filteredParamIndex: number, field: keyof Pattern1Type, value: string) => {
        const targetParamInfo = selectedParams[filteredParamIndex];
        if (!targetParamInfo) return;
        const currentPattern1 = targetParamInfo.parentRow.pattern1?.[0] ?? { pattern1Value: '', pattern1JP: '', pattern1Desc: '' };
        const updatedPattern1: Pattern1Type[] = [{ ...currentPattern1, [field]: value }];
        handleParentFieldChange(filteredParamIndex, 'pattern1', updatedPattern1);
    }, [selectedParams, handleParentFieldChange]);

    // Pattern2 (親行) の変更ハンドラ
    const handlePattern2Change = useCallback((filteredParamIndex: number, field: keyof Pattern2Type, value: number) => {
        const targetParamInfo = selectedParams[filteredParamIndex];
        if (!targetParamInfo) return;
        const currentPattern2 = targetParamInfo.parentRow.pattern2?.[0] ?? { pattern2Min: 0, pattern2Max: 100, pattern2Increment: 1 };
        const updatedPattern2: Pattern2Type[] = [{ ...currentPattern2, [field]: value }];
        handleParentFieldChange(filteredParamIndex, 'pattern2', updatedPattern2);
    }, [selectedParams, handleParentFieldChange]);

    // --- JSX ---
    if (selectedParams.length === 0) {
        return <Typography sx={{ p: 3 }}>表示するパラメータが選択されていません。基本情報タブで選択してください。</Typography>;
    }
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 900 }} aria-label="editable detail parameter table">
                <TableHead sx={{ backgroundColor: 'grey.100', '& th': { fontWeight: 'bold', border: '1px solid rgba(224, 224, 224, 1)' } }}>
                    <TableRow>
                        <TableCell rowSpan={2}>ID</TableCell>
                        <TableCell rowSpan={2}>タイプ</TableCell>
                        <TableCell rowSpan={2}>設定タイプ</TableCell>
                        <TableCell rowSpan={2}>パラメータ</TableCell>
                        <TableCell rowSpan={2}>日本語名</TableCell>
                        <TableCell rowSpan={2}>アイテムタイプ</TableCell>
                        <TableCell colSpan={3} align="center">パターン1</TableCell>
                        <TableCell colSpan={3} align="center">パターン2</TableCell>
                        <TableCell rowSpan={2}>online</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="left" sx={{ fontSize: '0.75rem', py: 0.5 }}>パターン1 値</TableCell>
                        <TableCell align="left" sx={{ fontSize: '0.75rem', py: 0.5 }}>パターン1 型</TableCell>
                        <TableCell align="left" sx={{ fontSize: '0.75rem', py: 0.5 }}>パターン1 備考</TableCell>
                        <TableCell align="left" sx={{ fontSize: '0.75rem', py: 0.5 }}>パターン2 最小値</TableCell>
                        <TableCell align="left" sx={{ fontSize: '0.75rem', py: 0.5 }}>パターン2 最大値</TableCell>
                        <TableCell align="left" sx={{ fontSize: '0.75rem', py: 0.5 }}>パターン2 間隔</TableCell>
                    </TableRow>
                </TableHead>
                {/* ★★★ TableBody: 選択されたパラメータを行として表示 ★★★ */}
                <TableBody>
                    {selectedParams.map((paramInfo, filteredIndex) => {
                        const { parentRow } = paramInfo; // 親行データ
                        const isPattern1 = parentRow.itemType === 'pattern1';
                        const isPattern2 = parentRow.itemType === 'pattern2';
                        // パターンデータ取得 (空の場合の初期値も考慮)
                        const pattern1Data = parentRow.pattern1?.[0] ?? { pattern1Value: '', pattern1JP: '', pattern1Desc: '' };
                        const pattern2Data = parentRow.pattern2?.[0] ?? { pattern2Min: 0, pattern2Max: 100, pattern2Increment: 1 };

                        return (
                            <TableRow key={`${paramInfo.originalRowIndex}-${paramInfo.originalParamIndex}`} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }, '& > td': { border: '1px solid rgba(224, 224, 224, 1)', verticalAlign: 'middle', p: 0.5 } }}> {/* パディング調整 */}
                                <TableCell><Typography variant="body2" sx={{ color: 'text.secondary' }}>{parentRow.prefix}</Typography></TableCell>
                                <TableCell><Typography variant="body2" sx={{ color: 'text.secondary' }}>{parentRow.type}</Typography></TableCell>
                                <TableCell><Typography variant="body2" sx={{ color: 'text.secondary' }}>{parentRow.cfgType}</Typography></TableCell>
                                {/* パラメータ (編集可能) */}
                                <TableCell>
                                    <TextField variant="standard" size="small" fullWidth value={paramInfo.param} onChange={(e) => handleParamFieldChange(filteredIndex, 'param', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                </TableCell>
                                {/* 日本語名 (編集可能) */}
                                <TableCell>
                                    <TextField variant="standard" size="small" fullWidth value={paramInfo.paramJP} onChange={(e) => handleParamFieldChange(filteredIndex, 'paramJP', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                </TableCell>
                                {/* アイテムタイプ (親行・編集可能) */}
                                <TableCell>
                                    <FormControl variant="standard" size="small" fullWidth>
                                        <Select value={parentRow.itemType} onChange={(e) => handleParentFieldChange(filteredIndex, 'itemType', e.target.value as 'pattern1' | 'pattern2')} sx={{ fontSize: '0.875rem' }}>
                                            <MenuItem value="pattern1">pattern1</MenuItem>
                                            <MenuItem value="pattern2">pattern2</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                {/* パターン1 (親行・編集可能・条件付き) */}
                                <TableCell>
                                    <TextField variant="standard" size="small" fullWidth value={pattern1Data.pattern1Value} onChange={(e) => handlePattern1Change(filteredIndex, 'pattern1Value', e.target.value)} disabled={!isPattern1} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                </TableCell>
                                <TableCell> {/* 画像の「パターン1 型」列 - データは pattern1JP (説明) を表示 */}
                                    <TextField variant="standard" size="small" fullWidth value={pattern1Data.pattern1JP} onChange={(e) => handlePattern1Change(filteredIndex, 'pattern1JP', e.target.value)} disabled={!isPattern1} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                </TableCell>
                                <TableCell>
                                    <TextField variant="standard" size="small" fullWidth value={pattern1Data.pattern1Desc} onChange={(e) => handlePattern1Change(filteredIndex, 'pattern1Desc', e.target.value)} disabled={!isPattern1} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                </TableCell>
                                {/* パターン2 (親行・編集可能・条件付き) */}
                                <TableCell>
                                    <TextField type="number" variant="standard" size="small" fullWidth value={pattern2Data.pattern2Min} onChange={(e) => handlePattern2Change(filteredIndex, 'pattern2Min', parseInt(e.target.value, 10) || 0)} disabled={!isPattern2} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                </TableCell>
                                <TableCell>
                                    <TextField type="number" variant="standard" size="small" fullWidth value={pattern2Data.pattern2Max} onChange={(e) => handlePattern2Change(filteredIndex, 'pattern2Max', parseInt(e.target.value, 10) || 0)} disabled={!isPattern2} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                </TableCell>
                                <TableCell>
                                    <TextField type="number" variant="standard" size="small" fullWidth value={pattern2Data.pattern2Increment} onChange={(e) => handlePattern2Change(filteredIndex, 'pattern2Increment', parseInt(e.target.value, 10) || 0)} disabled={!isPattern2} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                </TableCell>
                                {/* online (親行・編集可能) */}
                                <TableCell align="center">
                                    <Checkbox size="small" checked={parentRow.online} onChange={(e) => handleParentFieldChange(filteredIndex, 'online', e.target.checked)} />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};


export default DetailTable;

