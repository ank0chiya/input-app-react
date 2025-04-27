'use client';
import React, { useCallback } from 'react';
import {
    IconButton,
    TableCell,
    TextField,
    Tooltip,
    Stack,
    FormControl,
    Select,
    MenuItem,
    Checkbox,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // パラメータ追加アイコン
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'; // 行追加アイコン
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // 行削除アイコン
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // パラメータ削除アイコン
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // 上移動アイコン
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // 下移動アイコン
import { Product, BaseTableTopRow } from '@/app/types';
import { usePattern } from './contexts/BaseTableContext';

export function TextFieldCell({ rowSpan, value }: { rowSpan: number; value: string }) {
    return (
        <TableCell rowSpan={rowSpan}>
            <TextField
                variant="standard"
                size="small"
                fullWidth
                value={value}
                placeholder="Enter text"
                sx={{ fontSize: '0.875rem' }}
            />
        </TableCell>
    );
}

export function AttributeTypeFieldCell({ rowSpan, value }: { rowSpan: number; value: string }) {
    const types = ['string', 'number', 'boolean'];
    const SelectItems = types.map((type) => (
        <MenuItem key={type} value={type}>
            {type}
        </MenuItem>
    ));
    return (
        <TableCell rowSpan={rowSpan}>
            <FormControl variant="standard" size="small" fullWidth>
                <Select value={value} sx={{ fontSize: '0.875rem' }}>
                    {SelectItems}
                </Select>
            </FormControl>
        </TableCell>
    );
}

export function CheckboxCell({ rowSpan, value }: { rowSpan: number; value: boolean }) {
    return (
        <TableCell rowSpan={rowSpan} align="center">
            <Checkbox size="small" checked={value} />
        </TableCell>
    );
}

export function EmptyActionFieldCell() {
    return (
        <>
            <TableCell rowSpan={1} align="center">
                <Tooltip title="パラメータを追加">
                    <IconButton
                        onClick={() => {
                            console.log('Add parameter');
                        }}
                    >
                        <AddCircleOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </TableCell>
            <TableCell rowSpan={1} align="center">
                <Stack direction="column" spacing={0.5} alignItems="center">
                    <Tooltip title="この下に行を追加">
                        <IconButton
                            onClick={() => console.log('この下に行を追加')}
                            size="small"
                            color="primary"
                        >
                            <PlaylistAddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="この行を削除">
                        <IconButton
                            onClick={() => console.log('この行を削除')}
                            size="small"
                            color="error"
                            // disabled={tableDataLength <= 1}
                        >
                            <DeleteForeverIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </TableCell>
        </>
    );
}

export function AddRowTooltip({ rowIndex }: { rowIndex: number; }) {
    const { handleAddRow } = usePattern();
    return (
        <Tooltip title="この下に行を追加">
            <IconButton onClick={() => handleAddRow(rowIndex)} size="small" color="primary">
                <PlaylistAddIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
}

export function DeleteRowTooltip({ rowIndex, tableDataLength }: { rowIndex: number; tableDataLength: number; }) {
    const { handleDeleteRow } = usePattern();
    return (
        <Tooltip title="この行を削除">
            <IconButton
                onClick={() => handleDeleteRow(rowIndex)}
                size="small"
                color="error"
                disabled={tableDataLength <= 1}
            >
                <DeleteForeverIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
}

export function AddParamTooltip({ rowIndex }: { rowIndex: number; }) {
    const { handleAddAttribute } = usePattern();
    return (
        <Tooltip title="パラメータを追加">
            <IconButton onClick={() => handleAddAttribute(rowIndex, -1)} size="small" color="success">
                <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
}


export function ActionFieldCell({
    row,
    rowIndex,
    rowSpanCount,
    attributeIndex,
    tableDataLength,
}: {
    row: Product;
    rowIndex: number;
    rowSpanCount: number;
    attributeIndex: number;
    tableDataLength: number;
}) {
    const { tableData, handleTestContext, handleAddRow } = usePattern();

    return (
        <>
            <TableCell align="center">
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title="パラメータを上に移動">
                        <span>
                            <IconButton
                                onClick={() => console.log('Move parameter up')}
                                size="small"
                                color="primary"
                                disabled={attributeIndex === 0}
                            >
                                <ArrowUpwardIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="パラメータを下に移動">
                        <span>
                            <IconButton
                                onClick={() => console.log('Move parameter down')}
                                size="small"
                                color="primary"
                                disabled={attributeIndex === row.attributes.length - 1}
                            >
                                <ArrowDownwardIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="パラメータを追加">
                        <IconButton
                            onClick={() => console.log('Add parameter')}
                            size="small"
                            color="success"
                        >
                            <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="パラメータを削除">
                        <span>
                            <IconButton
                                onClick={() => console.log('Delete parameter')}
                                size="small"
                                color="error"
                                disabled={row.attributes.length <= 1}
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </TableCell>
            {/* 行操作列 */}
            {attributeIndex === 0 && (
                <TableCell rowSpan={rowSpanCount} align="center">
                    <Stack direction="column" spacing={0.5} alignItems="center">
                        <Tooltip title="この下に行を追加">
                            <IconButton
                                onClick={() => handleAddRow(rowIndex)}
                                size="small"
                                color="primary"
                            >
                                <PlaylistAddIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="この行を削除">
                            <IconButton
                                onClick={() => console.log('行を削除')}
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
        </>
    );
}
