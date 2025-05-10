import React, { useCallback, useEffect, useState } from 'react';
import {
    IconButton,
    TableCell,
    TextField,
    Tooltip,
    Checkbox,
    Typography,
    Box,
    type TableCellProps,
} from '@mui/material';
import { Attribute, Product, ParamDetail } from '@/app/types';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { usePattern } from './contexts/DetailTableContext';

type CellBaseProps = {
    rowSpan?: number;
    align?: TableCellProps['align']; // TableCellProps['align'] を使用
    valign?: TableCellProps['valign']; // TableCellProps['valign'] を使用 ('inherit' が含まれなくなる)
};
// 各コンポーネント固有のPropsと CellBaseProps を組み合わせる
interface ReadOnlyCellProps extends CellBaseProps {
    value: string | number | undefined;
}
interface TextFieldCellProps extends CellBaseProps {
    value: string | number;
    onChange: (v: string | number) => void;
}
interface NumberFieldCellProps extends CellBaseProps {
    value: number | string;
    onChange: (v: number) => void;
}
interface CheckboxCellProps extends CellBaseProps {
    value: boolean;
    onChange: (v: boolean) => void;
}
interface EmptyCellProps extends CellBaseProps {} // EmptyCell も align/valign を持つ可能性がある
// --- ActionCell Props Definition ---
interface ActionFieldCellProps {
    product: Product;
    attribute: Attribute;
    paramDetail: ParamDetail | null | undefined; // Can be null or undefined
    isFirstParam: boolean
    isLastParam: boolean
    // Optional TableCell props like align and sx
    align?: TableCellProps['align'];
    sx?: TableCellProps['sx'];
}

export function ReadOnlyCell({ rowSpan, value }: ReadOnlyCellProps) {
    return (
        <TableCell rowSpan={rowSpan}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {value}
            </Typography>
        </TableCell>
    );
}

export function TextFieldCell({
    value,
    onChange,
    rowSpan,
    align = 'left',
    valign = 'middle',
}: TextFieldCellProps) {
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        setCurrentValue(value); // Sync with external changes
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentValue(event.target.value);
    };

    const handleBlur = () => {
        if (currentValue !== value) {
            onChange(currentValue);
        }
    };

    return (
        <TableCell rowSpan={rowSpan} align={align} valign={valign} sx={{ p: 0 }}>
            <TextField
                value={currentValue}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="standard"
                size="small"
                fullWidth
                sx={{ fontSize: '0.875rem' }}
            />
        </TableCell>
    );
}

export function NumberFieldCell({
    value,
    onChange,
    rowSpan,
    align = 'left',
    valign = 'middle',
}: NumberFieldCellProps) {
    const [currentValue, setCurrentValue] = useState(String(value ?? '')); // Work with string internally

    useEffect(() => {
        setCurrentValue(String(value ?? '')); // Sync with external changes
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentValue(event.target.value);
    };

    const handleBlur = () => {
        const stringValue = String(value ?? '');
        if (currentValue !== stringValue) {
            const num = parseFloat(currentValue);
            // Allow empty string to be passed if needed, or handle invalid input
            if (!isNaN(num)) {
                onChange(num); // Pass number
            } else if (currentValue === '' && value !== '') {
                // Handle clearing the field if needed by passing null or specific value
                // onChange(null); // Or handle as error, or revert
                setCurrentValue(stringValue); // Revert for now if invalid
            } else {
                // Revert if input is non-numeric and not empty
                setCurrentValue(stringValue);
            }
        }
    };

    return (
        <TableCell rowSpan={rowSpan} align={align} valign={valign} sx={{ p: 0 }}>
            <TextField
                type="number"
                value={currentValue}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="standard"
                size="small"
                fullWidth
                sx={{ fontSize: '0.875rem' }}
            />
        </TableCell>
    );
}

// --- EditableCheckboxCell ---
export function CheckboxCell({
    value,
    onChange,
    rowSpan,
    align = 'center',
    valign = 'middle',
}: CheckboxCellProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.checked);
    };
    return (
        <TableCell rowSpan={rowSpan} align={align} valign={valign} sx={{ padding: '0 8px' }}>
            <Checkbox checked={!!value} onChange={handleChange} size="small" sx={{ padding: 0 }} />
        </TableCell>
    );
}

// --- EmptyCell ---
export function EmptyCell({ rowSpan }: EmptyCellProps) {
    return (
        <TableCell rowSpan={rowSpan} sx={{ padding: '4px 8px' }}>
            {/* &nbsp; */}
        </TableCell>
    );
}

// --- ActionCell Component ---
export function ActionFieldCells({
    product,
    attribute,
    paramDetail,
    isFirstParam,
    isLastParam,
    align = 'center', // Default align to center
    sx, // sx prop is optional
}: ActionFieldCellProps) {
    const { handleMoveParamUp, handleMoveParamDown, handleAddParam, handleDeleteParam } =
        usePattern();
    // Determine button visibility based on props
    const showMoveButtons = !!paramDetail;
    const showAddButton = attribute.paramHas; // Use paramHas from attribute
    const showDeleteButton = !!paramDetail;

    // Define onClick handlers for clarity
    const onMoveUpClick = () => {
        if (paramDetail) {
            handleMoveParamUp(product.productId, attribute.attributeId, paramDetail.paramId);
        }
    };

    const onMoveDownClick = () => {
        if (paramDetail) {
            handleMoveParamDown(product.productId, attribute.attributeId, paramDetail.paramId);
        }
    };

    const onAddClick = () => {
        // Pass current paramId (or undefined if none) to add below it
        handleAddParam(product.productId, attribute.attributeId, paramDetail?.paramId);
    };

    const onDeleteClick = () => {
        if (paramDetail) {
            handleDeleteParam(product.productId, attribute.attributeId, paramDetail.paramId);
        }
    };

    return (
        // Use passed align and sx, provide defaults for padding and minWidth
        <TableCell align={align} sx={{ p: '0 4px', minWidth: 120, ...sx }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center', // Center the icons within the Box
                    alignItems: 'center',
                    gap: 0.1, // Adjust gap between icons
                    width: '100%', // Ensure Box takes full cell width
                }}
            >
                {/* Move Up/Down Buttons or Placeholder */}
                {showMoveButtons ? (
                    <>
                        <Tooltip title="Move Up">
                            <span>
                                {' '}
                                {/* Tooltip requires a child element even when button is disabled */}
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={onMoveUpClick}
                                    disabled={isFirstParam}
                                >
                                    <ArrowUpwardIcon fontSize="inherit" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Move Down">
                            <span>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={onMoveDownClick}
                                    disabled={isLastParam}
                                >
                                    <ArrowDownwardIcon fontSize="inherit" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </>
                ) : (
                    // Placeholder to maintain layout when buttons are hidden
                    <Box
                        sx={{ width: '56px', flexShrink: 0 }}
                    /> /* Adjust width based on IconButton size*2 + gap */
                )}

                {/* Add Button or Placeholder */}
                {showAddButton ? (
                    <Tooltip title={paramDetail ? 'Insert Parameter Below' : 'Add First Parameter'}>
                        <IconButton size="small" color="success" onClick={onAddClick}>
                            <AddCircleOutlineIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                ) : (
                    // Placeholder
                    <Box
                        sx={{ width: '28px', flexShrink: 0 }}
                    /> /* Adjust width based on IconButton size */
                )}

                {/* Delete Button or Placeholder */}
                {showDeleteButton ? (
                    <Tooltip title="Delete Parameter">
                        <IconButton size="small" color="error" onClick={onDeleteClick}>
                            <DeleteOutlineIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                ) : (
                    // Placeholder
                    <Box
                        sx={{ width: '28px', flexShrink: 0 }}
                    /> /* Adjust width based on IconButton size */
                )}
            </Box>
        </TableCell>
    );
}
