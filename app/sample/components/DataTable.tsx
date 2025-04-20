'use client';
// components/DataTable.tsx
import React, { useState, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Checkbox, TextField, Button, IconButton, Box, Select, MenuItem, FormControl,
    Stack, Tooltip, Radio, // ★ Radio をインポート (もし使う場合)
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';    // 行追加用アイコン例
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // 行削除用アイコン例
import { TableRowType, Column, ParamType } from '../types';
import { firstTabTableColumns } from '../config/tableColumn';

interface DataTableProps {
    tableData: TableRowType[];
    onDataChange: (updatedRow: TableRowType, rowIndex: number) => void;
    onAddRow: (rowIndex: number) => void;
    onDeleteRow: (rowIndex: number) => void;
}

const DataTable = ({
    tableData,
    onDataChange,
    onAddRow, // props から受け取る
    onDeleteRow // props から受け取る
}: DataTableProps): JSX.Element => {


    // ★ カラム定義を props から受け取る代わりにここで定義（またはインポート）
    const columns: Column[] = firstTabTableColumns; // インポートした定義を使用

    // アクションカラムを追加したカラム定義
    const columnsWithActions: Column[] = [
        ...columns,
        { id: 'actions', label: 'アクション', type: 'actions' }
    ];

    // --- データ変更ハンドラ ---
    // useCallback でメモ化 (親からの再レンダリングで不必要に再生成されるのを防ぐ)
    const handleRowUpdate = useCallback((updatedRow: TableRowType, rowIndex: number) => {
        onDataChange(updatedRow, rowIndex);
    }, [onDataChange]);


    const handleCellChange = useCallback((rowIndex: number, columnId: keyof TableRowType, value: string | boolean | number) => {
        const targetRow = tableData[rowIndex];
        // ★ 単一選択ロジックを削除。単純に更新を通知する
        const updatedRow = { ...targetRow, [columnId]: value };
        handleRowUpdate(updatedRow, rowIndex);
    }, [tableData, handleRowUpdate]);

    const handleParamChange = useCallback((rowIndex: number, paramIndex: number, field: keyof ParamType, value: string | number | boolean) => {
        const targetRow = tableData[rowIndex];
        const updatedParams = targetRow.params.map((param, pIndex) =>
            pIndex === paramIndex ? { ...param, [field]: value } : param
        );
        const updatedRow = { ...targetRow, params: updatedParams };
        handleRowUpdate(updatedRow, rowIndex);
    }, [tableData, handleRowUpdate]);


    const handleAddParam = useCallback((rowIndex: number) => {
        const targetRow = tableData[rowIndex];
        const newParam: ParamType = { param: '', paramType: 'string', paramJP: '' };
        const updatedRow = { ...targetRow, params: [...targetRow.params, newParam] };
        handleRowUpdate(updatedRow, rowIndex);
    }, [tableData, handleRowUpdate]);

    const handleDeleteParam = useCallback((rowIndex: number, paramIndex: number) => {
        const targetRow = tableData[rowIndex];
        const updatedParams = targetRow.params.filter((_, pIndex) => pIndex !== paramIndex);
        const updatedRow = { ...targetRow, params: updatedParams };
        handleRowUpdate(updatedRow, rowIndex);
    }, [tableData, handleRowUpdate]);

    // --- 行の追加・削除ハンドラ ---
    // 親から渡されたコールバックを呼び出す
    const handleAddRow = useCallback((rowIndex: number) => {
        onAddRow(rowIndex);
    }, [onAddRow]);

    const handleDeleteRow = useCallback((rowIndex: number) => {
        onDeleteRow(rowIndex);
    }, [onDeleteRow]);

    // --- セルレンダリング関数 ---
    // useCallback でラップして不要な再計算を防ぐ
    const renderCellContent = useCallback((row: TableRowType, rowIndex: number, column: Column) => {
        const columnId = column.id as keyof TableRowType;
        const value = row[columnId];

        if (column.type === 'actions') {
            // アクションボタン (変更なし、ただしハンドラは要修正)
            return (<Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center"> <Tooltip title="この下に行を追加"> <IconButton onClick={() => handleAddRow(rowIndex)} size="small" color="primary"> <PlaylistAddIcon fontSize="small" /> </IconButton> </Tooltip> <Tooltip title="この行を削除"> <IconButton onClick={() => handleDeleteRow(rowIndex)} size="small" color="error" disabled={tableData.length <= 1}> <DeleteForeverIcon fontSize="small" /> </IconButton> </Tooltip> </Stack>);
        }

        switch (column.type) {
            // text, checkbox, nested のレンダリングはほぼ同じだが、
            // onChange で handleCellChange, handleParamChange を呼び出す
            case 'text':
                return (<TextField variant="standard" size="small" fullWidth value={typeof value === 'string' || typeof value === 'number' ? value : ''} onChange={(e) => handleCellChange(rowIndex, columnId, e.target.value)} sx={{ padding: 0, '.MuiInputBase-input': { fontSize: '0.875rem' } }} />);
            case 'checkbox':
                return (<Checkbox checked={typeof value === 'boolean' ? value : false} onChange={(e) => handleCellChange(rowIndex, columnId, e.target.checked)} size="small" />);
            case 'nested':
                if (column.id === 'params') {
                    if (value && Array.isArray(value)) {
                        const params = value as ParamType[];
                        return (
                            <Stack spacing={1} sx={{ width: '100%', py: 1 }}>
                                {params.map((param, paramIndex) => (
                                    <Stack direction="row" spacing={1} key={paramIndex} alignItems="center">
                                        <TextField label="パラメータ" variant="outlined" size="small" value={param.param} onChange={(e) => handleParamChange(rowIndex, paramIndex, 'param', e.target.value)} sx={{ flexGrow: 1 }} />
                                        <FormControl size="small" sx={{ minWidth: 100 }}>
                                            <Select value={param.paramType} onChange={(e) => handleParamChange(rowIndex, paramIndex, 'paramType', e.target.value as ParamType['paramType'])} displayEmpty inputProps={{ 'aria-label': 'データ型' }}>
                                                <MenuItem value="string">string</MenuItem><MenuItem value="number">number</MenuItem><MenuItem value="boolean">boolean</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField label="日本語名" variant="outlined" size="small" value={param.paramJP} onChange={(e) => handleParamChange(rowIndex, paramIndex, 'paramJP', e.target.value)} sx={{ flexGrow: 1 }} />
                                        <IconButton onClick={() => handleDeleteParam(rowIndex, paramIndex)} color="error" size="small"><DeleteOutlineIcon fontSize="small" /></IconButton>
                                    </Stack>
                                ))}
                                <Button startIcon={<AddCircleOutlineIcon />} onClick={() => handleAddParam(rowIndex)} size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }}>パラメータを追加</Button>
                            </Stack>
                        );
                    } else {
                        console.warn(`Expected 'params' for row ${rowIndex} to be an array, but received:`, value);
                        return <Box sx={{ color: 'error.main', fontSize: '0.8rem' }}>Invalid params data</Box>;
                    }
                }
                return '-';
            default: return '-';
        }

        // --- 既存のレンダリングロジック (変更なし) ---
        // params の場合はネストされたパラメータを表示
    }, [tableData, handleCellChange, handleParamChange, handleAddParam, handleDeleteParam, handleAddRow, handleDeleteRow]); // 依存配列に注意

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 750 }} aria-label="editable basic info table">
                <TableHead sx={{ backgroundColor: 'grey.200' }}>
                    <TableRow>
                        {/* selected カラムの align を修正 */}
                        {columnsWithActions.map((column) => (<TableCell key={column.id} align={column.id === 'actions' ? 'center' : column.id === 'selected' ? 'center' : 'left'} sx={{ fontWeight: 'bold', padding: '8px', width: column.id === 'actions' ? '100px' : column.id === 'selected' ? '60px' : undefined, }}> {column.label} </TableCell>))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableData.map((row, rowIndex) => (
                        <TableRow key={row.prefix || `row-${rowIndex}`} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }, '& > td': { verticalAlign: 'top' } }}>
                            {/* selected カラムの align を修正 */}
                            {columnsWithActions.map((column) => (<TableCell key={`${row.prefix || rowIndex}-${column.id}`} align={column.id === 'actions' ? 'center' : column.id === 'selected' ? 'center' : 'left'} component="td" scope="row" sx={column.id === 'params' ? { padding: '0px 8px' } : column.id === 'actions' ? { padding: '4px 0px' } : { padding: '4px 8px' }}> {renderCellContent(row, rowIndex, column)} </TableCell>))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DataTable;