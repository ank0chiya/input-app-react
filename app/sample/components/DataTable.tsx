// components/DataTable.tsx
'use client';
import React, { useCallback, memo, JSX } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    TextField,
    Button,         // Button は params 追加で使用
    IconButton,
    // Box,         // Box は現在不使用
    Select,
    MenuItem,
    FormControl,
    Stack,          // Stack はアクション列で使用
    Tooltip,
    Typography,     // Typography は rowSpan でない部分で使用検討したが TextField に変更
    // Grid,        // Grid は params 内のレイアウトで使用していたが TextField 直置きに変更可
    InputLabel,     // Select と共に使用 (variant="standard"の場合)
    FormControlLabel, // params 内の Checkbox で使用していたが Checkbox単独に変更可
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // パラメータ追加アイコン
// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';    // パラメータ削除アイコンは省略中
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';      // 行追加アイコン
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';   // 行削除アイコン
import { TableRowType, Column, ParamType } from '../types';          // 型定義
import { firstTabTableColumns } from '../config/tableColumn'; // カラム定義

import DataTableHeader from './DataTableHeader'; // ヘッダーコンポーネントをインポート
// --- ★ 新しい行コンポーネントの Props 定義 ---
interface DataTableRowProps {
    row: TableRowType;
    rowIndex: number;
    tableDataLength: number; // 行削除ボタンの disabled 判定用に渡す
    // ★ 必要なコールバック関数を絞って渡す
    onTopLevelCellChange: (rowIndex: number, columnId: keyof Pick<TableRowType, 'prefix' | 'type' | 'cfgType'>, value: string) => void;
    onParamFieldChange: (rowIndex: number, paramIndex: number, field: keyof ParamType, value: string | boolean | number) => void;
    onAddParam: (rowIndex: number) => void;
    onAddRow: (rowIndex: number) => void;
    onDeleteRow: (rowIndex: number) => void;
}

// --- ★ 行コンポーネントの作成とメモ化 ---
const DataTableRow = memo(({
    row,
    rowIndex,
    tableDataLength,
    onTopLevelCellChange,
    onParamFieldChange,
    onAddParam,
    onAddRow,
    onDeleteRow,
}: DataTableRowProps) => {

    console.log(`Rendering DataTableRow for row index: ${rowIndex}`); // 再レンダリング確認用ログ
    const rowSpanCount = row.params.length || 1;


    if (row.params.length === 0) {
        return (
            <TableRow key={`${row.prefix || rowIndex}-empty`} sx={{ '& > td': { border: '1px solid rgba(224, 224, 224, 1)', verticalAlign: 'middle', p: 0.5 } }}>
                <TableCell rowSpan={1}> <TextField variant="standard" size="small" fullWidth value={row.prefix} onChange={(e) => onTopLevelCellChange(rowIndex, 'prefix', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} /> </TableCell>
                <TableCell rowSpan={1}> <TextField variant="standard" size="small" fullWidth value={row.type} onChange={(e) => onTopLevelCellChange(rowIndex, 'type', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} /> </TableCell>
                <TableCell rowSpan={1}> <TextField variant="standard" size="small" fullWidth value={row.cfgType} onChange={(e) => onTopLevelCellChange(rowIndex, 'cfgType', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} /> </TableCell>
                <TableCell colSpan={6} align="center" sx={{ color: 'text.disabled', fontSize: '0.8rem' }}> パラメータがありません </TableCell> {/* paramColumnIds.length を 6 に修正 */}
                <TableCell rowSpan={1} align="center">
                    <Stack direction="column" spacing={0.5} alignItems="center">
                        <Tooltip title="この下に行を追加"><IconButton onClick={() => onAddRow(rowIndex)} size="small" color="primary"><PlaylistAddIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="パラメータを追加"><IconButton onClick={() => onAddParam(rowIndex)} size="small" color="success"><AddCircleOutlineIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="この行を削除"><IconButton onClick={() => onDeleteRow(rowIndex)} size="small" color="error" disabled={tableDataLength <= 1}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                    </Stack>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <> {/* 複数の TableRow を返すために Fragment を使用 */}
            {row.params.map((param, paramIndex) => (
                <TableRow key={`${row.prefix || rowIndex}-${paramIndex}`} sx={{ '&:nth-of-type(even)': { backgroundColor: 'action.hover' }, '& > td': { border: '1px solid rgba(224, 224, 224, 1)', verticalAlign: 'middle', p: 0.5 } }}>
                    {paramIndex === 0 && (
                        <>
                            <TableCell rowSpan={rowSpanCount}> <TextField variant="standard" size="small" fullWidth value={row.prefix} onChange={(e) => onTopLevelCellChange(rowIndex, 'prefix', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} /> </TableCell>
                            <TableCell rowSpan={rowSpanCount}> <TextField variant="standard" size="small" fullWidth value={row.type} onChange={(e) => onTopLevelCellChange(rowIndex, 'type', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} /> </TableCell>
                            <TableCell rowSpan={rowSpanCount}> <TextField variant="standard" size="small" fullWidth value={row.cfgType} onChange={(e) => onTopLevelCellChange(rowIndex, 'cfgType', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} /> </TableCell>
                        </>
                    )}
                    <TableCell> <TextField variant="standard" size="small" fullWidth value={param.param} onChange={(e) => onParamFieldChange(rowIndex, paramIndex, 'param', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} /> </TableCell>
                    <TableCell> <FormControl variant="standard" size="small" fullWidth> <Select value={param.paramType} onChange={(e) => onParamFieldChange(rowIndex, paramIndex, 'paramType', e.target.value as ParamType['paramType'])} sx={{ fontSize: '0.875rem' }}> <MenuItem value="string">string</MenuItem> <MenuItem value="number">number</MenuItem> <MenuItem value="boolean">boolean</MenuItem> </Select> </FormControl> </TableCell>
                    <TableCell> <TextField variant="standard" size="small" fullWidth value={param.paramJP} onChange={(e) => onParamFieldChange(rowIndex, paramIndex, 'paramJP', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} /> </TableCell>
                    <TableCell align="center"> <Checkbox size="small" checked={param.selected} onChange={(e) => onParamFieldChange(rowIndex, paramIndex, 'selected', e.target.checked)} /> </TableCell>
                    <TableCell align="center"> <Checkbox size="small" checked={param.public} onChange={(e) => onParamFieldChange(rowIndex, paramIndex, 'public', e.target.checked)} /> </TableCell>
                    <TableCell align="center"> <Checkbox size="small" checked={param.security} onChange={(e) => onParamFieldChange(rowIndex, paramIndex, 'security', e.target.checked)} /> </TableCell>
                    {paramIndex === 0 && (
                        <TableCell rowSpan={rowSpanCount} align="center">
                            <Stack direction="column" spacing={0.5} alignItems="center">
                                <Tooltip title="この下に行を追加"><IconButton onClick={() => onAddRow(rowIndex)} size="small" color="primary"><PlaylistAddIcon fontSize="small" /></IconButton></Tooltip>
                                <Tooltip title="パラメータを追加"><IconButton onClick={() => onAddParam(rowIndex)} size="small" color="success"><AddCircleOutlineIcon fontSize="small" /></IconButton></Tooltip>
                                <Tooltip title="この行を削除"><IconButton onClick={() => onDeleteRow(rowIndex)} size="small" color="error" disabled={tableDataLength <= 1}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                            </Stack>
                        </TableCell>
                    )}
                </TableRow>
            ))}
        </>
    );
});
DataTableRow.displayName = 'DataTableRow'; // DevTools での表示名

// Props のインターフェース定義
interface DataTableProps {
    tableData: TableRowType[];
    onDataChange: (updatedRow: TableRowType, rowIndex: number) => void; // 親へのデータ変更通知
    onAddRow: (rowIndex: number) => void;                               // 親への行追加通知
    onDeleteRow: (rowIndex: number) => void;                           // 親への行削除通知
}

// DataTable コンポーネント本体
const DataTable = ({ tableData, onDataChange, onAddRow, onDeleteRow }: DataTableProps): JSX.Element => {

    // 使用するカラム定義 (アクション列は別途追加)
    const columns: Column[] = firstTabTableColumns;
    // アクション列を追加したカラムリスト
    const columnsWithActions: Column[] = [
        ...columns,
        { id: 'actions', label: 'アクション', type: 'actions' }
    ];
    // パラメータ情報のカラムIDリスト (TableCell生成用)
    const paramColumnIds: (keyof ParamType | 'selected' | 'public' | 'security')[] = ['param', 'paramType', 'paramJP', 'selected', 'public', 'security'];

    // --- データ変更関連のコールバック関数 ---

    // 行データ全体の更新を親コンポーネントに通知する関数
    const handleRowUpdate = useCallback((updatedRow: TableRowType, rowIndex: number) => {
        onDataChange(updatedRow, rowIndex);
    }, [onDataChange]);

    // トップレベルのセル (ID, タイプ, 設定タイプ) の値が変更された時のハンドラ
    const handleTopLevelCellChange = useCallback((rowIndex: number, columnId: keyof Pick<TableRowType, 'prefix' | 'type' | 'cfgType'>, value: string) => {
        const targetRow = tableData[rowIndex];
        const updatedRow = { ...targetRow, [columnId]: value };
        handleRowUpdate(updatedRow, rowIndex);
    }, [tableData, handleRowUpdate]);

    // パラメータ配列内の特定のフィールドの値が変更された時のハンドラ
    const handleParamFieldChange = useCallback((rowIndex: number, paramIndex: number, field: keyof ParamType, value: string | boolean | number) => {
        const targetRow = tableData[rowIndex];
        if (!targetRow) { console.error(`Row not found at index ${rowIndex}`); return; }
        const updatedParams = targetRow.params.map((param, pIndex) =>
            pIndex === paramIndex ? { ...param, [field]: value } : param
        );
        const updatedRow = { ...targetRow, params: updatedParams };
        handleRowUpdate(updatedRow, rowIndex);
    }, [tableData, handleRowUpdate]);

    // パラメータを現在の行に追加するハンドラ (アクション列のボタンから使用)
    const handleAddParam = useCallback((rowIndex: number) => {
        const targetRow = tableData[rowIndex];
        if (!targetRow) return;
        const newParam: ParamType = { param: '', paramType: 'string', paramJP: '', selected: false, public: false, security: false };
        const updatedRow = { ...targetRow, params: [...targetRow.params, newParam] };
        handleRowUpdate(updatedRow, rowIndex);
    }, [tableData, handleRowUpdate]);

    // 行追加ボタンが押された時のハンドラ (親コンポーネントの関数を呼び出す)
    const handleAddRow = useCallback((rowIndex: number) => onAddRow(rowIndex), [onAddRow]);

    // 行削除ボタンが押された時のハンドラ (親コンポーネントの関数を呼び出す)
    const handleDeleteRow = useCallback((rowIndex: number) => onDeleteRow(rowIndex), [onDeleteRow]);
    
    // --- レンダリング ---
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 900 }} aria-label="data table with parameters expanded">
                {/* テーブルヘッダー */}
                <DataTableHeader />
                {/* テーブルボディ */}
                <TableBody>
                    {/* 各行データを処理 */}
                    {tableData.map((row, rowIndex) => {
                        // パラメータの数に応じて rowSpan を計算 (最低1)
                        const rowSpanCount = row.params.length || 1;

                        // params 配列が空の場合の表示
                        if (row.params.length === 0) {
                            return (
                                <TableRow key={`${row.prefix || rowIndex}-empty`} sx={{ '& > td': { border: '1px solid rgba(224, 224, 224, 1)', verticalAlign: 'middle', p: 0.5 } }}>
                                    {/* rowSpan 対象カラム (TextField で編集可能) */}
                                    <TableCell rowSpan={1}>
                                        <TextField variant="standard" size="small" fullWidth value={row.prefix} onChange={(e) => handleTopLevelCellChange(rowIndex, 'prefix', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                    </TableCell>
                                    <TableCell rowSpan={1}>
                                        <TextField variant="standard" size="small" fullWidth value={row.type} onChange={(e) => handleTopLevelCellChange(rowIndex, 'type', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                    </TableCell>
                                    <TableCell rowSpan={1}>
                                        <TextField variant="standard" size="small" fullWidth value={row.cfgType} onChange={(e) => handleTopLevelCellChange(rowIndex, 'cfgType', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                    </TableCell>
                                    {/* パラメータカラム (空) */}
                                    <TableCell colSpan={paramColumnIds.length} align="center" sx={{ color: 'text.disabled', fontSize: '0.8rem' }}>
                                        パラメータがありません
                                    </TableCell>
                                    {/* アクションカラム */}
                                    <TableCell rowSpan={1} align="center">
                                        <Stack direction="column" spacing={0.5} alignItems="center">
                                            <Tooltip title="この下に行を追加">
                                                <IconButton onClick={() => handleAddRow(rowIndex)} size="small" color="primary">
                                                    <PlaylistAddIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="パラメータを追加">
                                                <IconButton onClick={() => handleAddParam(rowIndex)} size="small" color="success">
                                                    <AddCircleOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="この行を削除">
                                                <IconButton onClick={() => handleDeleteRow(rowIndex)} size="small" color="error" disabled={tableData.length <= 1}>
                                                    <DeleteForeverIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        }

                        // params 配列が存在する場合、各パラメータを行として展開
                        return row.params.map((param, paramIndex) => (
                            <TableRow key={`${row.prefix || rowIndex}-${paramIndex}`} sx={{ '&:nth-of-type(even)': { backgroundColor: 'action.hover' }, '& > td': { border: '1px solid rgba(224, 224, 224, 1)', verticalAlign: 'middle', p: 0.5 } }}>
                                {/* 最初のパラメータ行 (paramIndex === 0) のみ、rowSpan 対象カラムを描画 */}
                                {paramIndex === 0 && (
                                    <>
                                        <TableCell rowSpan={rowSpanCount}>
                                            <TextField variant="standard" size="small" fullWidth value={row.prefix} onChange={(e) => handleTopLevelCellChange(rowIndex, 'prefix', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                        </TableCell>
                                        <TableCell rowSpan={rowSpanCount}>
                                            <TextField variant="standard" size="small" fullWidth value={row.type} onChange={(e) => handleTopLevelCellChange(rowIndex, 'type', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                        </TableCell>
                                        <TableCell rowSpan={rowSpanCount}>
                                            <TextField variant="standard" size="small" fullWidth value={row.cfgType} onChange={(e) => handleTopLevelCellChange(rowIndex, 'cfgType', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                        </TableCell>
                                    </>
                                )}
                                {/* 全てのパラメータ行で、パラメータ情報のセルを描画 */}
                                <TableCell>
                                    <TextField variant="standard" size="small" fullWidth value={param.param} onChange={(e) => handleParamFieldChange(rowIndex, paramIndex, 'param', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                </TableCell>
                                <TableCell>
                                    <FormControl variant="standard" size="small" fullWidth>
                                        {/* InputLabel は variant="standard" では Select の前に置く */}
                                        {/* <InputLabel id={`paramType-label-${rowIndex}-${paramIndex}`}>データ型</InputLabel> */}
                                        <Select
                                            // labelId={`paramType-label-${rowIndex}-${paramIndex}`}
                                            // label="データ型" // standard では label は表示に影響しない
                                            value={param.paramType}
                                            onChange={(e) => handleParamFieldChange(rowIndex, paramIndex, 'paramType', e.target.value as ParamType['paramType'])}
                                            sx={{ fontSize: '0.875rem' }}
                                        // displayEmpty // placeholder を表示したい場合
                                        >
                                            <MenuItem value="string">string</MenuItem>
                                            <MenuItem value="number">number</MenuItem>
                                            <MenuItem value="boolean">boolean</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <TextField variant="standard" size="small" fullWidth value={param.paramJP} onChange={(e) => handleParamFieldChange(rowIndex, paramIndex, 'paramJP', e.target.value)} InputProps={{ sx: { fontSize: '0.875rem' } }} />
                                </TableCell>
                                <TableCell align="center">
                                    <Checkbox size="small" checked={param.selected} onChange={(e) => handleParamFieldChange(rowIndex, paramIndex, 'selected', e.target.checked)} />
                                </TableCell>
                                <TableCell align="center">
                                    <Checkbox size="small" checked={param.public} onChange={(e) => handleParamFieldChange(rowIndex, paramIndex, 'public', e.target.checked)} />
                                </TableCell>
                                <TableCell align="center">
                                    <Checkbox size="small" checked={param.security} onChange={(e) => handleParamFieldChange(rowIndex, paramIndex, 'security', e.target.checked)} />
                                </TableCell>

                                {/* 最初のパラメータ行 (paramIndex === 0) のみ、アクションカラムを描画 */}
                                {paramIndex === 0 && (
                                    <TableCell rowSpan={rowSpanCount} align="center">
                                        <Stack direction="column" spacing={0.5} alignItems="center">
                                            <Tooltip title="この下に行を追加">
                                                <IconButton onClick={() => handleAddRow(rowIndex)} size="small" color="primary">
                                                    <PlaylistAddIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="パラメータを追加">
                                                <IconButton onClick={() => handleAddParam(rowIndex)} size="small" color="success">
                                                    <AddCircleOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="この行を削除">
                                                <IconButton onClick={() => handleDeleteRow(rowIndex)} size="small" color="error" disabled={tableData.length <= 1}>
                                                    <DeleteForeverIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                )}
                            </TableRow>
                        ));
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DataTable;