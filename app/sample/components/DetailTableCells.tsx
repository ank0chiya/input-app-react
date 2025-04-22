// components/DetailTableCells.tsx
'use client';
import React from 'react';
import {
    TableCell, TextField, Checkbox, IconButton, Stack, Tooltip, Typography,
    Select, MenuItem, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Pattern1Type, Pattern2Type, TableRowType, ParamType } from '../types';

// 読み取り専用セル
interface ReadOnlyCellProps {
    value: string | number;
    rowSpan?: number;
}

export const ReadOnlyCell: React.FC<ReadOnlyCellProps> = ({ value, rowSpan }) => (
    <TableCell rowSpan={rowSpan}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {value}
        </Typography>
    </TableCell>
);

// 編集可能なテキストフィールドを持つセル
interface EditableCellProps {
    value: string;
    onChange: (value: string) => void;
    rowSpan?: number;
}

export const EditableCell: React.FC<EditableCellProps> = ({ value, onChange, rowSpan }) => (
    <TableCell rowSpan={rowSpan}>
        <TextField 
            variant="standard" 
            size="small" 
            fullWidth 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            InputProps={{ sx: { fontSize: '0.875rem' } }} 
        />
    </TableCell>
);

// 数値入力用のセル
interface NumberInputCellProps {
    value: number;
    onChange: (value: number) => void;
}

export const NumberInputCell: React.FC<NumberInputCellProps> = ({ value, onChange }) => (
    <TableCell>
        <TextField 
            type="number" 
            variant="standard" 
            size="small" 
            fullWidth 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)} 
            InputProps={{ sx: { fontSize: '0.875rem' } }} 
        />
    </TableCell>
);

// チェックボックスを持つセル
interface CheckboxCellProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    rowSpan?: number;
}

export const CheckboxCell: React.FC<CheckboxCellProps> = ({ checked, onChange, rowSpan }) => (
    <TableCell rowSpan={rowSpan} align="center">
        <Checkbox 
            size="small" 
            checked={checked} 
            onChange={(e) => onChange(e.target.checked)} 
        />
    </TableCell>
);

// アイテムタイプ選択セル
interface ItemTypeSelectCellProps {
    value: 'pattern1' | 'pattern2';
    onChange: (value: 'pattern1' | 'pattern2') => void;
    rowSpan?: number;
}

export const ItemTypeSelectCell: React.FC<ItemTypeSelectCellProps> = ({ value, onChange, rowSpan }) => (
    <TableCell rowSpan={rowSpan}>
        <FormControl variant="standard" size="small" fullWidth>
            <Select 
                value={value} 
                onChange={(e) => onChange(e.target.value as 'pattern1' | 'pattern2')} 
                sx={{ fontSize: '0.875rem' }}
            >
                <MenuItem value="pattern1">pattern1</MenuItem>
                <MenuItem value="pattern2">pattern2</MenuItem>
            </Select>
        </FormControl>
    </TableCell>
);

// パターン操作ボタン
interface PatternActionButtonsProps {
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    onAdd?: () => void;
    isFirst: boolean;
    isLast: boolean;
    canDelete: boolean;
}

export const PatternActionButtons: React.FC<PatternActionButtonsProps> = ({
    onMoveUp, onMoveDown, onDelete, onAdd, isFirst, isLast, canDelete
}) => (
    <TableCell align="center">
        <Stack direction="row" spacing={0.5} justifyContent="center">
            {/* 上へ移動ボタン */}
            <Tooltip title="上へ移動">
                <span>
                    <IconButton 
                        size="small" 
                        color="primary" 
                        disabled={isFirst} 
                        onClick={onMoveUp}
                    >
                        <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
            
            {/* 下へ移動ボタン */}
            <Tooltip title="下へ移動">
                <span>
                    <IconButton 
                        size="small" 
                        color="primary" 
                        disabled={isLast} 
                        onClick={onMoveDown}
                    >
                        <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
            
            {/* 削除ボタン */}
            <Tooltip title="削除">
                <span>
                    <IconButton 
                        size="small" 
                        color="error" 
                        disabled={!canDelete} 
                        onClick={onDelete}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
            
            {/* 追加ボタン（最後のパターン行でのみ表示） */}
            {isLast && onAdd && (
                <Tooltip title="追加">
                    <IconButton 
                        size="small" 
                        color="success" 
                        onClick={onAdd}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Stack>
    </TableCell>
);

// 親情報セル群
interface ParentInfoCellsProps {
    parentRow: TableRowType;
    paramInfo: ParamType & { 
        parentRow: TableRowType; 
        originalRowIndex: number; 
        originalParamIndex: number 
    };
    filteredIndex: number;
    rowSpanCount: number;
    onParamFieldChange: (
        filteredParamIndex: number, 
        field: keyof ParamType, 
        value: string | boolean | number
    ) => void;
    onParentFieldChange: (
        filteredParamIndex: number, 
        field: keyof Pick<TableRowType, 'itemType' | 'online'>, 
        value: any
    ) => void;
}

export const ParentInfoCells: React.FC<ParentInfoCellsProps> = ({
    parentRow, paramInfo, filteredIndex, rowSpanCount, onParamFieldChange, onParentFieldChange
}) => (
    <>
        <ReadOnlyCell value={parentRow.prefix} rowSpan={rowSpanCount} />
        <ReadOnlyCell value={parentRow.type} rowSpan={rowSpanCount} />
        <ReadOnlyCell value={parentRow.cfgType} rowSpan={rowSpanCount} />
        <EditableCell 
            value={paramInfo.param} 
            onChange={(value) => onParamFieldChange(filteredIndex, 'param', value)} 
            rowSpan={rowSpanCount} 
        />
        <EditableCell 
            value={paramInfo.paramJP} 
            onChange={(value) => onParamFieldChange(filteredIndex, 'paramJP', value)} 
            rowSpan={rowSpanCount} 
        />
        <ItemTypeSelectCell 
            value={parentRow.itemType} 
            onChange={(value) => onParentFieldChange(filteredIndex, 'itemType', value)} 
            rowSpan={rowSpanCount} 
        />
    </>
);

// Pattern1 行のフィールド
interface Pattern1FieldsProps {
    pattern: Pattern1Type;
    cfgType: string;
    param: string;
    patternIndex: number;
    onChange: (
        cfgType: string,
        param: string,
        patternIndex: number,
        field: keyof Pattern1Type,
        value: string
    ) => void;
}

export const Pattern1Fields: React.FC<Pattern1FieldsProps> = ({
    pattern, cfgType, param, patternIndex, onChange
}) => (
    <>
        <EditableCell 
            value={pattern.pattern1Value} 
            onChange={(value) => onChange(cfgType, param, patternIndex, 'pattern1Value', value)} 
        />
        <EditableCell 
            value={pattern.pattern1JP} 
            onChange={(value) => onChange(cfgType, param, patternIndex, 'pattern1JP', value)} 
        />
        <EditableCell 
            value={pattern.pattern1Desc} 
            onChange={(value) => onChange(cfgType, param, patternIndex, 'pattern1Desc', value)} 
        />
    </>
);

// Pattern2 行のフィールド
interface Pattern2FieldsProps {
    pattern: Pattern2Type;
    cfgType: string;
    param: string;
    patternIndex: number;
    onChange: (
        cfgType: string,
        param: string,
        patternIndex: number,
        field: keyof Pattern2Type,
        value: number
    ) => void;
}

export const Pattern2Fields: React.FC<Pattern2FieldsProps> = ({
    pattern, cfgType, param, patternIndex, onChange
}) => (
    <>
        <NumberInputCell 
            value={pattern.pattern2Min} 
            onChange={(value) => onChange(cfgType, param, patternIndex, 'pattern2Min', value)} 
        />
        <NumberInputCell 
            value={pattern.pattern2Max} 
            onChange={(value) => onChange(cfgType, param, patternIndex, 'pattern2Max', value)} 
        />
        <NumberInputCell 
            value={pattern.pattern2Increment} 
            onChange={(value) => onChange(cfgType, param, patternIndex, 'pattern2Increment', value)} 
        />
    </>
);
