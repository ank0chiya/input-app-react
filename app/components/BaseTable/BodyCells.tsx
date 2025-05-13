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
    Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // パラメータ追加アイコン
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'; // 行追加アイコン
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // 行削除アイコン
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // パラメータ削除アイコン
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // 上移動アイコン
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // 下移動アイコン
import { Product, BaseTableTopRow } from '@/app/types';
import { usePattern } from './contexts/BaseTableContext';
import { Attribute } from '@/app/types';
import { Paragliding } from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material';

export function ReadOnlyCell({ rowSpan, value }: { rowSpan: number; value: string }) {
    return (
        <TableCell rowSpan={rowSpan}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {value}
            </Typography>
        </TableCell>
    );
}

export function TextFieldCell({
    sx,
    rowSpan,
    value,
    columnId,
    rowIndex,
    attributeIndex,
}: {
    sx: SxProps<Theme>;
    rowSpan: number;
    value: string;
    columnId: string;
    rowIndex: number;
    attributeIndex?: number;
}) {
    const { handleProductCellChange, handleAttributeCellChange } = usePattern();
    const productCells = ['prefix', 'type', 'cfgType'];
    const isProductCell = productCells.includes(columnId as keyof Product);

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (isProductCell) {
                handleProductCellChange(
                    rowIndex,
                    columnId as 'prefix' | 'type' | 'cfgType',
                    event.target.value,
                );
            } else {
                if (attributeIndex !== undefined) {
                    console.log(columnId);
                    handleAttributeCellChange(
                        rowIndex,
                        attributeIndex,
                        columnId as keyof Pick<
                            Attribute,
                            | 'attribute'
                            | 'attributeJP'
                            | 'attributeType'
                            | 'attributeUnit'
                            | 'contract'
                            | 'masking'
                            | 'public'
                        >,
                        event?.target.value,
                    );
                } else {
                    console.warn(`Attribute index is undefined`);
                }
            }
        },
        [
            isProductCell,
            rowIndex,
            attributeIndex,
            columnId,
            handleProductCellChange,
            handleAttributeCellChange,
        ],
    );

    return (
        <TableCell sx={{ ...sx }} rowSpan={rowSpan}>
            <TextField
                variant="standard"
                size="small"
                fullWidth
                value={value}
                onChange={handleChange}
                placeholder="Enter text"
                sx={{ fontSize: '0.875rem' }}
            />
        </TableCell>
    );
}

export function AttributeTypeFieldCell({
    sx,
    rowSpan,
    value,
    columnId,
    rowIndex,
    attributeIndex,
}: {
    sx: SxProps<Theme>;
    rowSpan: number;
    value: string;
    columnId: string;
    rowIndex: number;
    attributeIndex: number;
}) {
    const { handleAttributeCellChange } = usePattern();
    const types = ['string', 'number', 'boolean'];
    const SelectItems = types.map((type) => (
        <MenuItem key={type} value={type}>
            {type}
        </MenuItem>
    ));
    return (
        <TableCell sx={{ ...sx }} rowSpan={rowSpan}>
            <FormControl variant="standard" size="small" fullWidth>
                <Select
                    value={value}
                    sx={{ fontSize: '0.875rem' }}
                    onChange={(e) =>
                        handleAttributeCellChange(
                            rowIndex,
                            attributeIndex,
                            columnId as keyof Pick<Attribute, 'attributeType'>,
                            e.target.value,
                        )
                    }
                >
                    {SelectItems}
                </Select>
            </FormControl>
        </TableCell>
    );
}

export function ContractTypeFieldCell({
    sx,
    rowSpan,
    value,
    columnId,
    rowIndex,
    attributeIndex,
}: {
    sx: SxProps<Theme>;
    rowSpan: number;
    value: string;
    columnId: string;
    rowIndex: number;
    attributeIndex: number;
}) {
    const { handleAttributeCellChange } = usePattern();
    const types = ['type1', 'type2', 'None'];
    const SelectItems = types.map((type) => {
        if (type === 'None') {
            return (
                <MenuItem key={type} value={''}>
                    {type}
                </MenuItem>
            );
        } else {
            return (
                <MenuItem key={type} value={type}>
                    {type}
                </MenuItem>
            );
        }
    });
    return (
        <TableCell sx={{ ...sx }} rowSpan={rowSpan}>
            <FormControl variant="standard" size="small" fullWidth>
                <Select
                    value={value}
                    sx={{ ontSize: '0.875rem' }}
                    onChange={(e) =>
                        handleAttributeCellChange(
                            rowIndex,
                            attributeIndex,
                            columnId as keyof Pick<Attribute, 'attributeType'>,
                            e.target.value,
                        )
                    }
                >
                    {SelectItems}
                </Select>
            </FormControl>
        </TableCell>
    );
}

export function CheckboxCell({
    sx,
    rowSpan,
    value,
    columnId,
    rowIndex,
    attributeIndex,
}: {
    sx: SxProps<Theme>;
    rowSpan: number;
    value: boolean;
    columnId: keyof Pick<Attribute, 'paramHas' | 'public' | 'masking'>;
    rowIndex: number;
    attributeIndex: number;
}) {
    const { handleAttributeCellChange } = usePattern();
    return (
        <TableCell sx={{ ...sx }} rowSpan={rowSpan} align="center">
            <Checkbox
                size="small"
                checked={value}
                onChange={(e) =>
                    handleAttributeCellChange(
                        rowIndex,
                        attributeIndex,
                        columnId as keyof Pick<Attribute, 'public' | 'masking'>,
                        e.target.checked,
                    )
                }
            />
        </TableCell>
    );
}

export function AddRowTooltip({ rowIndex }: { rowIndex: number }) {
    const { handleAddRow } = usePattern();
    return (
        <Tooltip title="この下に行を追加">
            <IconButton onClick={() => handleAddRow(rowIndex)} size="small" color="primary">
                <PlaylistAddIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
}

export function DeleteRowTooltip({
    rowIndex,
    tableDataLength,
}: {
    rowIndex: number;
    tableDataLength: number;
}) {
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

export function AddAttributeTooltip({ rowIndex }: { rowIndex: number }) {
    const { handleAddAttribute } = usePattern();
    return (
        <Tooltip title="パラメータを追加">
            <IconButton
                onClick={() => handleAddAttribute(rowIndex, -1)}
                size="small"
                color="success"
            >
                <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
}

export function ActionFieldCells({
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
    const {
        tableData,
        handleAddRow,
        handleAddAttribute,
        handleDeleteAttribute,
        handleMoveAttributeUp,
        handleMoveAttributeDown,
    } = usePattern();

    return (
        <>
            <TableCell align="center">
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title="パラメータを上に移動">
                        <span>
                            <IconButton
                                onClick={() => handleMoveAttributeUp(rowIndex, attributeIndex)}
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
                                onClick={() => handleMoveAttributeDown(rowIndex, attributeIndex)}
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
                            onClick={() => handleAddAttribute(rowIndex, attributeIndex)}
                            size="small"
                            color="success"
                        >
                            <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="パラメータを削除">
                        <span>
                            <IconButton
                                onClick={() => handleDeleteAttribute(rowIndex, attributeIndex)}
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
