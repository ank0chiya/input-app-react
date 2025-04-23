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
import { usePattern } from '../contexts/PatternContext';

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
    disabled?: boolean;
}

export const EditableCell: React.FC<EditableCellProps> = ({ value, onChange, rowSpan, disabled }) => (
    <TableCell rowSpan={rowSpan}>
        <TextField 
            variant="standard" 
            size="small" 
            fullWidth 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            InputProps={{ sx: { fontSize: '0.875rem' } }}
            disabled={disabled}
        />
    </TableCell>
);

// 数値入力用のセル
interface NumberInputCellProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

export const NumberInputCell: React.FC<NumberInputCellProps> = ({ value, onChange, disabled }) => (
    <TableCell>
        <TextField 
            type="number" 
            variant="standard" 
            size="small" 
            fullWidth 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)} 
            InputProps={{ sx: { fontSize: '0.875rem' } }}
            disabled={disabled}
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
                <MenuItem value="pattern1">パターン値</MenuItem>
                <MenuItem value="pattern2">数値範囲</MenuItem>
            </Select>
        </FormControl>
    </TableCell>
);

// パターン操作ボタン
interface PatternActionButtonsProps {
    cfgType: string;
    param: string;
    itemType: 'pattern1' | 'pattern2';
    patternIndex: number;
    isFirst: boolean;
    isLast: boolean;
    canDelete: boolean;
}

export const PatternActionButtons: React.FC<PatternActionButtonsProps> = ({
    cfgType, param, itemType, patternIndex, isFirst, isLast, canDelete
}) => {
    const { 
        movePatternUpAction, 
        movePatternDownAction, 
        deletePatternAction, 
        addPatternAction 
    } = usePattern();

    return (
        <TableCell align="center">
            <Stack direction="row" spacing={0.5} justifyContent="center">
                {/* 上へ移動ボタン */}
                <Tooltip title="上へ移動">
                    <span>
                        <IconButton 
                            size="small" 
                            color="primary" 
                            disabled={isFirst} 
                            onClick={() => movePatternUpAction(cfgType, param, itemType, patternIndex)}
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
                            onClick={() => movePatternDownAction(cfgType, param, itemType, patternIndex)}
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
                            onClick={() => deletePatternAction(cfgType, param, itemType, patternIndex)}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
                
                {/* 追加ボタン（最後のパターン行でのみ表示） */}
                {isLast && (
                    <Tooltip title="追加">
                        <IconButton 
                            size="small" 
                            color="success" 
                            onClick={() => addPatternAction(cfgType, param, itemType)}
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>
        </TableCell>
    );
};

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
        field: keyof Pick<TableRowType, 'online'>, 
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
            value={paramInfo.itemType} 
            onChange={(value) => onParamFieldChange(filteredIndex, 'itemType', value)} 
            rowSpan={rowSpanCount} 
        />
    </>
);

// パターンフィールド
interface PatternFieldsProps {
    pattern1Data: Pattern1Type;
    pattern2Data: Pattern2Type;
    cfgType: string;
    param: string;
    patternIndex: number;
    itemType: 'pattern1' | 'pattern2';
}

export const PatternFields: React.FC<PatternFieldsProps> = ({
    pattern1Data,
    pattern2Data,
    cfgType,
    param,
    patternIndex,
    itemType,
}) => {
    const { updatePattern1Action, updatePattern2Action } = usePattern();
    
    return (
    <>
        {/* パターン1のフィールド */}
        <EditableCell 
            value={pattern1Data.pattern1Value}
            onChange={(value) => updatePattern1Action(cfgType, param, patternIndex, 'pattern1Value', value)}
            disabled={itemType === 'pattern2'}
        />
        <EditableCell 
            value={pattern1Data.pattern1JP}
            onChange={(value) => updatePattern1Action(cfgType, param, patternIndex, 'pattern1JP', value)}
            disabled={itemType === 'pattern2'}
        />
        <EditableCell 
            value={pattern1Data.pattern1Desc}
            onChange={(value) => updatePattern1Action(cfgType, param, patternIndex, 'pattern1Desc', value)}
            disabled={itemType === 'pattern2'}
        />

        {/* パターン2のフィールド */}
        <NumberInputCell 
            value={pattern2Data.pattern2Min}
            onChange={(value) => updatePattern2Action(cfgType, param, patternIndex, 'pattern2Min', value)}
            disabled={itemType === 'pattern1'}
        />
        <NumberInputCell 
            value={pattern2Data.pattern2Max}
            onChange={(value) => updatePattern2Action(cfgType, param, patternIndex, 'pattern2Max', value)}
            disabled={itemType === 'pattern1'}
        />
        <NumberInputCell 
            value={pattern2Data.pattern2Increment}
            onChange={(value) => updatePattern2Action(cfgType, param, patternIndex, 'pattern2Increment', value)}
            disabled={itemType === 'pattern1'}
        />
    </>
    );
};
