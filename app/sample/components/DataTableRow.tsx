// components/DataTableRow.tsx
'use client';
import React, { memo, JSX } from 'react';
import {
    TableCell,
    TableRow,
    TextField,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    Stack,
    Tooltip,
    Checkbox,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // パラメータ追加アイコン
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'; // 行追加アイコン
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // 行削除アイコン
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // パラメータ削除アイコン
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // 上移動アイコン
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // 下移動アイコン
import { TableRowType, ParamType } from '../types'; // 型定義

// --- ★ 行コンポーネントの Props 定義 ---
export interface DataTableRowProps {
    row: TableRowType;
    rowIndex: number;
    tableDataLength: number; // 行削除ボタンの disabled 判定用に渡す
    // ★ 必要なコールバック関数を絞って渡す
    onTopLevelCellChange: (
        rowIndex: number,
        columnId: keyof Pick<TableRowType, 'prefix' | 'type' | 'cfgType'>,
        value: string
    ) => void;
    onParamFieldChange: (
        rowIndex: number,
        paramIndex: number,
        field: keyof ParamType,
        value: string | boolean | number
    ) => void;
    onAddParam: (rowIndex: number) => void;
    onDeleteParam: (rowIndex: number, paramIndex: number) => void; // パラメータ削除用コールバック
    onMoveParamUp: (rowIndex: number, paramIndex: number) => void; // パラメータ上移動用コールバック
    onMoveParamDown: (rowIndex: number, paramIndex: number) => void; // パラメータ下移動用コールバック
    onAddRow: (rowIndex: number) => void;
    onDeleteRow: (rowIndex: number) => void;
}

// --- ★ 行コンポーネントの作成とメモ化 ---
const DataTableRow = memo(
    ({
        row,
        rowIndex,
        tableDataLength,
        onTopLevelCellChange,
        onParamFieldChange,
        onAddParam,
        onDeleteParam,
        onMoveParamUp,
        onMoveParamDown,
        onAddRow,
        onDeleteRow,
    }: DataTableRowProps) => {
        console.log(`Rendering DataTableRow for row index: ${rowIndex}`); // 再レンダリング確認用ログ
        const rowSpanCount = row.params.length || 1;

        if (row.params.length === 0) {
            return (
                <TableRow
                    key={`${row.prefix || rowIndex}-empty`}
                    sx={{
                        '& > td': {
                            border: '1px solid rgba(224, 224, 224, 1)',
                            verticalAlign: 'middle',
                            p: 0.5,
                        },
                    }}
                >
                    <TableCell rowSpan={1}>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            value={row.prefix}
                            onChange={(e) => onTopLevelCellChange(rowIndex, 'prefix', e.target.value)}
                            InputProps={{ sx: { fontSize: '0.875rem' } }}
                        />
                    </TableCell>
                    <TableCell rowSpan={1}>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            value={row.type}
                            onChange={(e) => onTopLevelCellChange(rowIndex, 'type', e.target.value)}
                            InputProps={{ sx: { fontSize: '0.875rem' } }}
                        />
                    </TableCell>
                    <TableCell rowSpan={1}>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            value={row.cfgType}
                            onChange={(e) => onTopLevelCellChange(rowIndex, 'cfgType', e.target.value)}
                            InputProps={{ sx: { fontSize: '0.875rem' } }}
                        />
                    </TableCell>
                    <TableCell colSpan={6} align="center" sx={{ color: 'text.disabled', fontSize: '0.8rem' }}>
                        パラメータがありません
                    </TableCell>
                    {/* パラメータ操作列 */}
                    <TableCell rowSpan={1} align="center">
                        <Tooltip title="パラメータを追加">
                            <IconButton onClick={() => onAddParam(rowIndex)} size="small" color="success">
                                <AddCircleOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                    {/* 行操作列 */}
                    <TableCell rowSpan={1} align="center">
                        <Stack direction="column" spacing={0.5} alignItems="center">
                            <Tooltip title="この下に行を追加">
                                <IconButton onClick={() => onAddRow(rowIndex)} size="small" color="primary">
                                    <PlaylistAddIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="この行を削除">
                                <IconButton
                                    onClick={() => onDeleteRow(rowIndex)}
                                    size="small"
                                    color="error"
                                    disabled={tableDataLength <= 1}
                                >
                                    <DeleteForeverIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </TableCell>
                </TableRow>
            );
        }

        return (
            <>
                {/* 複数の TableRow を返すために Fragment を使用 */}
                {row.params.map((param, paramIndex) => (
                    <TableRow
                        key={`${row.prefix || rowIndex}-${paramIndex}`}
                        sx={{
                            '&:nth-of-type(even)': { backgroundColor: 'action.hover' },
                            '& > td': {
                                border: '1px solid rgba(224, 224, 224, 1)',
                                verticalAlign: 'middle',
                                p: 0.5,
                            },
                        }}
                    >
                        {paramIndex === 0 && (
                            <>
                                <TableCell rowSpan={rowSpanCount}>
                                    <TextField
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                        value={row.prefix}
                                        onChange={(e) => onTopLevelCellChange(rowIndex, 'prefix', e.target.value)}
                                        InputProps={{ sx: { fontSize: '0.875rem' } }}
                                    />
                                </TableCell>
                                <TableCell rowSpan={rowSpanCount}>
                                    <TextField
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                        value={row.type}
                                        onChange={(e) => onTopLevelCellChange(rowIndex, 'type', e.target.value)}
                                        InputProps={{ sx: { fontSize: '0.875rem' } }}
                                    />
                                </TableCell>
                                <TableCell rowSpan={rowSpanCount}>
                                    <TextField
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                        value={row.cfgType}
                                        onChange={(e) => onTopLevelCellChange(rowIndex, 'cfgType', e.target.value)}
                                        InputProps={{ sx: { fontSize: '0.875rem' } }}
                                    />
                                </TableCell>
                            </>
                        )}
                        <TableCell>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                value={param.param}
                                onChange={(e) => onParamFieldChange(rowIndex, paramIndex, 'param', e.target.value)}
                                InputProps={{ sx: { fontSize: '0.875rem' } }}
                            />
                        </TableCell>
                        <TableCell>
                            <FormControl variant="standard" size="small" fullWidth>
                                <Select
                                    value={param.paramType}
                                    onChange={(e) =>
                                        onParamFieldChange(
                                            rowIndex,
                                            paramIndex,
                                            'paramType',
                                            e.target.value as ParamType['paramType']
                                        )
                                    }
                                    sx={{ fontSize: '0.875rem' }}
                                >
                                    <MenuItem value="string">string</MenuItem>
                                    <MenuItem value="number">number</MenuItem>
                                    <MenuItem value="boolean">boolean</MenuItem>
                                </Select>
                            </FormControl>
                        </TableCell>
                        <TableCell>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                value={param.paramJP}
                                onChange={(e) => onParamFieldChange(rowIndex, paramIndex, 'paramJP', e.target.value)}
                                InputProps={{ sx: { fontSize: '0.875rem' } }}
                            />
                        </TableCell>
                        <TableCell align="center">
                            <Checkbox
                                size="small"
                                checked={param.selected}
                                onChange={(e) => onParamFieldChange(rowIndex, paramIndex, 'selected', e.target.checked)}
                            />
                        </TableCell>
                        <TableCell align="center">
                            <Checkbox
                                size="small"
                                checked={param.public}
                                onChange={(e) => onParamFieldChange(rowIndex, paramIndex, 'public', e.target.checked)}
                            />
                        </TableCell>
                        <TableCell align="center">
                            <Checkbox
                                size="small"
                                checked={param.security}
                                onChange={(e) => onParamFieldChange(rowIndex, paramIndex, 'security', e.target.checked)}
                            />
                        </TableCell>
                        {/* パラメータ操作列 */}
                        <TableCell align="center">
                            <Stack direction="column" spacing={0.5} alignItems="center">
                                {paramIndex === 0 && (
                                    <Tooltip title="パラメータを追加">
                                        <IconButton onClick={() => onAddParam(rowIndex)} size="small" color="success">
                                            <AddCircleOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="パラメータを上に移動">
                                    <span>
                                        <IconButton
                                            onClick={() => onMoveParamUp(rowIndex, paramIndex)}
                                            size="small"
                                            color="primary"
                                            disabled={paramIndex === 0}
                                        >
                                            <ArrowUpwardIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="パラメータを下に移動">
                                    <span>
                                        <IconButton
                                            onClick={() => onMoveParamDown(rowIndex, paramIndex)}
                                            size="small"
                                            color="primary"
                                            disabled={paramIndex === row.params.length - 1}
                                        >
                                            <ArrowDownwardIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="パラメータを削除">
                                    <span>
                                        <IconButton
                                            onClick={() => onDeleteParam(rowIndex, paramIndex)}
                                            size="small"
                                            color="error"
                                            disabled={row.params.length <= 1}
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        </TableCell>
                        {/* 行操作列 */}
                        {paramIndex === 0 && (
                            <TableCell rowSpan={rowSpanCount} align="center">
                                <Stack direction="column" spacing={0.5} alignItems="center">
                                    <Tooltip title="この下に行を追加">
                                        <IconButton onClick={() => onAddRow(rowIndex)} size="small" color="primary">
                                            <PlaylistAddIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="この行を削除">
                                        <IconButton
                                            onClick={() => onDeleteRow(rowIndex)}
                                            size="small"
                                            color="error"
                                            disabled={tableDataLength <= 1}
                                        >
                                            <DeleteForeverIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </>
        );
    }
);
DataTableRow.displayName = 'DataTableRow'; // DevTools での表示名

export default DataTableRow;
