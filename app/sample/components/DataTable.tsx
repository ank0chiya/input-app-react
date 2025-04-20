'use client';
// components/DataTable.tsx
import React, { useState } from 'react';
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
    Button,
    IconButton,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress, // ローディング表示用にインポート (任意)
    Stack,
    Tooltip, // Tooltip をインポート
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download'; // ダウンロードアイコンをインポート
import SaveIcon from '@mui/icons-material/Save';       // 保存・登録用アイコンをインポート
// import AddIcon from '@mui/icons-material/Add'; // 行追加用アイコン (任意)
// import RemoveIcon from '@mui/icons-material/Remove'; // 行削除用アイコン (任意)
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';    // 行追加用アイコン例
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // 行削除用アイコン例
import { TableRowType, Column, ParamType } from '../types';

interface DataTableProps {
    initialData: TableRowType[];
    columns: Column[]; // 元のカラム定義
}

// 新しい行のデフォルトデータを作成する関数
const createNewRowData = (): TableRowType => {
    // prefix は本来ユニークであるべきだが、ここでは一時的な値を設定
    // UUIDなどを利用するか、保存時にサーバー側で採番するのが望ましい
    const uniquePrefix = `NEW_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
        prefix: uniquePrefix, // 新しい行には一時的なIDを付与
        type: '',
        cfgType: '',
        params: [],
        selected: false,
        public: false,
        security: false,
        itemType: 'pattern1', // デフォルトの itemType (必要に応じて変更)
        pattern1: [],
        pattern2: [],
        online: false,
    };
};


const DataTable = ({ initialData, columns: initialColumns }: DataTableProps): JSX.Element => {
    const [tableData, setTableData] = useState<TableRowType[]>(initialData);
    const [isRegistering, setIsRegistering] = useState(false); // 登録処理中の状態 (任意)

    // アクションカラムを追加したカラム定義
    const columnsWithActions: Column[] = [
        ...initialColumns,
        { id: 'actions', label: 'アクション', type: 'actions' } // アクションカラム定義を追加
    ];

    // --- 既存のハンドラ (変更なし) ---
    const handleCellChange = (rowIndex: number, columnId: keyof TableRowType, value: string | boolean | number) => {
        const newData = tableData.map((row, rIndex) => {
            if (rIndex === rowIndex) {
                return { ...row, [columnId]: value };
            }
            return row;
        });
        setTableData(newData);
    };

    const handleParamChange = (rowIndex: number, paramIndex: number, field: keyof ParamType, value: string | number | boolean) => {
        const newData = tableData.map((row, rIndex) => {
            if (rIndex === rowIndex) {
                const updatedParams = row.params.map((param, pIndex) => {
                    if (pIndex === paramIndex) {
                        return { ...param, [field]: value };
                    }
                    return param;
                });
                return { ...row, params: updatedParams };
            }
            return row;
        });
        setTableData(newData);
    };

    const handleAddParam = (rowIndex: number) => {
        const newData = tableData.map((row, rIndex) => {
            if (rIndex === rowIndex) {
                const newParam: ParamType = { param: '', paramType: 'string', paramJP: '' };
                return { ...row, params: [...row.params, newParam] };
            }
            return row;
        });
        setTableData(newData);
    };

    const handleDeleteParam = (rowIndex: number, paramIndex: number) => {
        const newData = tableData.map((row, rIndex) => {
            if (rIndex === rowIndex) {
                const updatedParams = row.params.filter((_, pIndex) => pIndex !== paramIndex);
                return { ...row, params: updatedParams };
            }
            return row;
        });
        setTableData(newData);
    };
    // --- 既存のハンドラここまで ---

    // --- 新しいハンドラ (行の追加・削除) ---
    const handleAddRow = (rowIndex: number) => {
        const newRow = createNewRowData();
        const newData = [
            ...tableData.slice(0, rowIndex + 1), // クリックされた行まで
            newRow,                               // 新しい行を挿入
            ...tableData.slice(rowIndex + 1)     // 残りの行
        ];
        setTableData(newData);
    };

    const handleDeleteRow = (rowIndex: number) => {
        // 最低1行は残す場合 (任意)
        if (tableData.length <= 1) {
            console.log("Cannot delete the last row.");
            return;
        }
        const newData = tableData.filter((_, index) => index !== rowIndex);
        setTableData(newData);
    };
    // --- 新しいハンドラここまで ---

    // --- JSONダウンロードハンドラ ---
    const handleDownloadJson = () => {
        if (isRegistering) return; // 登録中はダウンロード不可にする (任意)
        const jsonString = JSON.stringify(tableData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    // --- JSONダウンロードハンドラここまで ---

    // --- 登録ボタンハンドラ ---
    const handleRegister = async () => {
        setIsRegistering(true);
        console.log('Registering data:', JSON.stringify(tableData, null, 2));

        try {
            const apiUrl = '/api/your-endpoint'; // ★実際のAPIエンドポイントに要変更
            /*
            const response = await fetch(apiUrl, {
                method: 'POST',
                // headers: { 'Content-Type': 'application/json', /* 'Authorization': ... */ //},
            // body: JSON.stringify(tableData),
            // });
            // if (!response.ok) {
            //     const errorData = await response.text(); // text() でプレーンなエラーメッセージ取得も可
            //     throw new Error(`API Error ${response.status}: ${errorData || response.statusText}`);
            // }
            // const result = await response.json();
            // console.log('Registration successful:', result);
            // alert('データの登録に成功しました。');
            // */
            await new Promise(resolve => setTimeout(resolve, 1500)); // ダミー待機
            console.log('（ダミー）Registration process finished.');
            alert('（ダミー）登録処理が完了しました。');

        } catch (error) {
            console.error('Registration failed:', error);
            alert(`データの登録に失敗しました。\n${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsRegistering(false);
        }
    };
    // --- 登録ボタンハンドラここまで ---

    // セルの内容をレンダリングするヘルパー関数 (アクションカラム対応)
    const renderCellContent = (row: TableRowType, rowIndex: number, column: Column) => {
        const columnId = column.id as keyof TableRowType; // actions の場合は TableRowType のキーではない
        const value = row[columnId];

        // アクションカラムの場合
        if (column.type === 'actions') {
            return (
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                    <Tooltip title="この下に行を追加">
                        {/* IconButton はデフォルトで padding があるため、 Button を使うかスタイル調整 */}
                        <IconButton onClick={() => handleAddRow(rowIndex)} size="small" color="primary">
                            <PlaylistAddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="この行を削除">
                        {/* 削除ボタンは最後の行では無効化するなどの制御も可能 */}
                        <IconButton
                            onClick={() => handleDeleteRow(rowIndex)}
                            size="small"
                            color="error"
                        // disabled={tableData.length <= 1} // 最後の行は削除不可にする場合
                        >
                            <DeleteForeverIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            );
        }

        // --- 既存のレンダリングロジック (変更なし) ---
        switch (column.type) {
            case 'text':
                return (
                    <TextField
                        variant="standard"
                        size="small"
                        fullWidth
                        value={typeof value === 'string' || typeof value === 'number' ? value : ''}
                        onChange={(e) => handleCellChange(rowIndex, columnId, e.target.value)}
                        sx={{ padding: 0, '.MuiInputBase-input': { fontSize: '0.875rem' } }}
                    />
                );
            case 'checkbox':
                return (
                    <Checkbox
                        checked={typeof value === 'boolean' ? value : false}
                        onChange={(e) => handleCellChange(rowIndex, columnId, e.target.checked)}
                        size="small"
                    />
                );
            case 'nested':
                if (column.id === 'params') {
                    if (value && Array.isArray(value)) { // ★チェック修正
                        const params = value as ParamType[];
                        return (
                            <Stack spacing={1} sx={{ width: '100%', py: 1 }}>
                                {params.map((param, paramIndex) => (
                                    <Stack direction="row" spacing={1} key={paramIndex} alignItems="center">
                                        <TextField
                                            label="パラメータ"
                                            variant="outlined"
                                            size="small"
                                            value={param.param}
                                            onChange={(e) => handleParamChange(rowIndex, paramIndex, 'param', e.target.value)}
                                            sx={{ flexGrow: 1 }}
                                        />
                                        <FormControl size="small" sx={{ minWidth: 100 }}>
                                            <Select
                                                value={param.paramType}
                                                onChange={(e) => handleParamChange(rowIndex, paramIndex, 'paramType', e.target.value as ParamType['paramType'])}
                                                displayEmpty
                                                inputProps={{ 'aria-label': 'データ型' }}
                                            >
                                                <MenuItem value="string">string</MenuItem>
                                                <MenuItem value="number">number</MenuItem>
                                                <MenuItem value="boolean">boolean</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            label="日本語名"
                                            variant="outlined"
                                            size="small"
                                            value={param.paramJP}
                                            onChange={(e) => handleParamChange(rowIndex, paramIndex, 'paramJP', e.target.value)}
                                            sx={{ flexGrow: 1 }}
                                        />
                                        <IconButton onClick={() => handleDeleteParam(rowIndex, paramIndex)} color="error" size="small">
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                ))}
                                <Button
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={() => handleAddParam(rowIndex)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    パラメータを追加
                                </Button>
                            </Stack>
                        );
                    }
                }
                return '-';
            default:
                // type が 'actions' でない未知のタイプの場合
                return '-';
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* ボタン配置用の Box */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}> {/* ★ mb: 2 に変更 */}
                {/* ダウンロードボタン */}
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadJson}
                    disabled={isRegistering} // 登録中は無効化 (任意)
                >
                    JSONダウンロード
                </Button>
                {/* 登録ボタン */}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={isRegistering ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleRegister}
                    disabled={isRegistering} // 登録中は無効化 (任意)
                >
                    {isRegistering ? '登録中...' : '登録'}
                </Button>
            </Box>
            <TableContainer component={Paper}>
                {/* Table, TableHead, TableBody は変更なし */}
                <Table sx={{ minWidth: 750 }} aria-label="editable inline table with actions">
                    <TableHead sx={{ backgroundColor: 'grey.200' }}>
                        <TableRow>
                            {columnsWithActions.map((column) => (<TableCell key={column.id} align={column.id === 'actions' ? 'center' : 'left'} sx={{ fontWeight: 'bold', padding: '8px', width: column.id === 'actions' ? '100px' : undefined, }}> {column.label} </TableCell>))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.map((row, rowIndex) => (
                            <TableRow key={row.prefix || `row-${rowIndex}`} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }, '& > td': { verticalAlign: 'top' } }}>
                                {columnsWithActions.map((column) => (<TableCell key={`${row.prefix || rowIndex}-${column.id}`} align={column.id === 'actions' ? 'center' : 'left'} component="td" scope="row" sx={column.id === 'params' ? { padding: '0px 8px' } : column.id === 'actions' ? { padding: '4px 0px' } : { padding: '4px 8px' }}> {renderCellContent(row, rowIndex, column)} </TableCell>))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DataTable;