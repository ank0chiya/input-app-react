// components/DetailTable.tsx
'use client';
// ★ useState, useEffect, useCallback 等をインポート
import React, { useMemo, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Checkbox, TextField, Button, IconButton, Box, Select, MenuItem, FormControl,
    Stack, Tooltip, Typography, InputLabel, // InputLabel を追加
} from '@mui/material';
// ★ アイコンは params 以外では不要かも
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { TableRowType, Column, ParamType, Pattern1Type, Pattern2Type } from '../types';
// ★ secondTabTableColumns をインポート
import { secondTabTableColumns } from '../config/tableColumn'; // 適切なパスに変更

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
    tableData: TableRowType[]; // 全データを受け取る
    // 親コンポーネントにデータ変更を通知するコールバック
    onDataChange: (updatedRow: TableRowType, originalIndex: number) => void;
}

const DetailTable = ({ tableData, onDataChange }: DetailTableProps): JSX.Element => {
    // ★ カラム定義を使用
    const columns: Column[] = secondTabTableColumns;

    // ★ 表示対象のデータ（selected === true の行）をフィルタリング
    // useMemo を使って不要な再計算を防ぐ
    // 元のインデックスも保持しておく
    const selectedRows = useMemo(() => {
        return tableData
            .map((row, index) => ({ ...row, originalIndex: index })) // 元のインデックスを付与
            .filter(row => row.selected);
    }, [tableData]);


    // --- データ変更ハンドラ ---
    // useCallback でメモ化
    // DetailTable 内の表示上のインデックス (filteredIndex) と元のインデックス (originalIndex) を使う
    const handleDetailRowUpdate = useCallback((updatedRow: TableRowType, originalIndex: number) => {
        // originalIndex を使って親に通知
        onDataChange(updatedRow, originalIndex);
    }, [onDataChange]);

    // セル変更ハンドラ (DataTable のものを流用・調整)
    const handleCellChange = useCallback((filteredIndex: number, columnId: keyof TableRowType, value: string | boolean | number) => {
        const targetRow = selectedRows[filteredIndex];
        const updatedRow = { ...targetRow, [columnId]: value };
        // itemType が変更された場合の処理
        if (columnId === 'itemType') {
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
        // originalIndex を使って通知
        handleDetailRowUpdate(updatedRow, targetRow.originalIndex);
    }, [selectedRows, handleDetailRowUpdate]);


    // Pattern1 変更ハンドラ
    const handlePattern1Change = useCallback((filteredIndex: number, field: keyof Pattern1Type, value: string) => {
        const targetRow = selectedRows[filteredIndex];
        const updatedPattern1: Pattern1Type[] = [{
            ...(targetRow.pattern1?.[0] || { pattern1Value: '', pattern1JP: '', pattern1Desc: '' }),
            [field]: value
        }];
        const updatedRow = { ...targetRow, pattern1: updatedPattern1 };
        handleDetailRowUpdate(updatedRow, targetRow.originalIndex);
    }, [selectedRows, handleDetailRowUpdate]);

    // Pattern2 変更ハンドラ
    const handlePattern2Change = useCallback((filteredIndex: number, field: keyof Pattern2Type, value: number) => {
        const targetRow = selectedRows[filteredIndex];
        const updatedPattern2: Pattern2Type[] = [{
            ...(targetRow.pattern2?.[0] || { pattern2Min: 0, pattern2Max: 100, pattern2Increment: 1 }),
            [field]: value
        }];
        const updatedRow = { ...targetRow, pattern2: updatedPattern2 };
        handleDetailRowUpdate(updatedRow, targetRow.originalIndex);
    }, [selectedRows, handleDetailRowUpdate]);

    // --- セルレンダリング関数 ---
    const renderDetailCellContent = useCallback((row: TableRowType & { originalIndex: number }, filteredIndex: number, column: Column) => {
        const columnId = column.id as keyof TableRowType;
        const value = row[columnId];
        const isPattern1 = row.itemType === 'pattern1';
        const isPattern2 = row.itemType === 'pattern2';

        switch (column.type) {
            case 'text':
                // ID は編集不可にする
                const isDisabled = column.id === 'prefix';
                return (<TextField variant="standard" size="small" fullWidth disabled={isDisabled} value={typeof value === 'string' || typeof value === 'number' ? value : ''} onChange={(e) => handleCellChange(filteredIndex, columnId, e.target.value)} sx={{ padding: 0, '.MuiInputBase-input': { fontSize: '0.875rem' } }} />);
            case 'checkbox': // online 用
                return (<Checkbox checked={typeof value === 'boolean' ? value : false} onChange={(e) => handleCellChange(filteredIndex, columnId, e.target.checked)} size="small" />);
            case 'dropdown': // itemType 用
                if (column.id === 'itemType') {
                    return (
                        <FormControl size="small" fullWidth>
                            {/* <InputLabel>アイテムタイプ</InputLabel> */} {/* variant="standard" などを使う場合 */}
                            <Select
                                // label="アイテムタイプ"
                                value={value as 'pattern1' | 'pattern2'}
                                onChange={(e) => handleCellChange(filteredIndex, columnId, e.target.value as 'pattern1' | 'pattern2')}
                                variant="standard" // テーブルセル内なので standard が良いかも
                                sx={{ fontSize: '0.875rem' }}
                            >
                                <MenuItem value="pattern1">pattern1</MenuItem>
                                <MenuItem value="pattern2">pattern2</MenuItem>
                            </Select>
                        </FormControl>
                    );
                }
                return '-';
            case 'nested':
                if (column.id === 'pattern1') {
                    // pattern1 のデータを取得 (存在しない場合は初期値)
                    const pattern1Data = row.pattern1?.[0] ?? { pattern1Value: '', pattern1JP: '', pattern1Desc: '' };
                    return (
                        <Pattern1Editor
                            pattern1Data={pattern1Data}
                            onChange={(field, val) => handlePattern1Change(filteredIndex, field, val)}
                            disabled={!isPattern1} // itemType が pattern1 でない場合は無効化
                        />
                    );
                } else if (column.id === 'pattern2') {
                    // pattern2 のデータを取得 (存在しない場合は初期値)
                    const pattern2Data = row.pattern2?.[0] ?? { pattern2Min: 0, pattern2Max: 100, pattern2Increment: 1 };
                    return (
                        <Pattern2Editor
                            pattern2Data={pattern2Data}
                            onChange={(field, val) => handlePattern2Change(filteredIndex, field, val)}
                            disabled={!isPattern2} // itemType が pattern2 でない場合は無効化
                        />
                    );
                }
                return '-';
            default: return '-';
        }
    }, [selectedRows, handleCellChange, handlePattern1Change, handlePattern2Change]); // 依存配列

    // --- JSX ---
    if (selectedRows.length === 0) {
        return <Typography>表示する行が選択されていません。基本情報タブで選択してください。</Typography>;
    }

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="editable detail table">
                <TableHead sx={{ backgroundColor: 'grey.200' }}>
                    <TableRow>
                        {/* 詳細情報カラムのヘッダー */}
                        {columns.map((column) => (<TableCell key={column.id} align="left" sx={{ fontWeight: 'bold', padding: '8px' }}> {column.label} </TableCell>))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* 選択された行のみをレンダリング */}
                    {selectedRows.map((row, filteredIndex) => (
                        <TableRow key={row.originalIndex} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }, '& > td': { verticalAlign: 'top' } }}>
                            {columns.map((column) => (<TableCell key={`${row.originalIndex}-${column.id}`} align="left" component="td" scope="row" sx={column.type === 'nested' ? { padding: '8px' } : { padding: '4px 8px' }}> {renderDetailCellContent(row, filteredIndex, column)} </TableCell>))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DetailTable;

