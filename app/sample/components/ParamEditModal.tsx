'use client';
// components/ParamEditModal.tsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ParamType } from '../types'; // パスは適宜調整

interface ParamEditModalProps {
    open: boolean;
    params: ParamType[];
    onClose: () => void;
    onSave: (newParams: ParamType[]) => void;
}

const ParamEditModal: React.FC<ParamEditModalProps> = ({ open, params: initialParams, onClose, onSave }) => {
    const [currentParams, setCurrentParams] = useState<ParamType[]>([]);

    // モーダルが開かれたとき、または初期パラメータが変更されたときに内部状態を同期
    useEffect(() => {
        // ディープコピーして内部状態に設定
        setCurrentParams(JSON.parse(JSON.stringify(initialParams)));
    }, [open, initialParams]);

    const handleParamChange = (index: number, field: keyof ParamType, value: string | number | boolean) => {
        const newParams = [...currentParams];
        // 型に合わせて値を設定 (Select などから来る値は string の可能性があるため)
        if (field === 'paramType') {
            newParams[index] = { ...newParams[index], [field]: value as 'string' | 'number' | 'boolean' };
        } else {
            newParams[index] = { ...newParams[index], [field]: value };
        }
        setCurrentParams(newParams);
    };

    const handleAddParam = () => {
        setCurrentParams([...currentParams, { param: '', paramType: 'string', paramJP: '' }]);
    };

    const handleDeleteParam = (index: number) => {
        const newParams = currentParams.filter((_, i) => i !== index);
        setCurrentParams(newParams);
    };

    const handleSaveChanges = () => {
        onSave(currentParams);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>パラメータ編集</DialogTitle>
            <DialogContent>
                {currentParams.map((param, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1} mb={2}>
                        <TextField
                            label="パラメータ"
                            value={param.param}
                            onChange={(e) => handleParamChange(index, 'param', e.target.value)}
                            size="small"
                            sx={{ flexGrow: 1 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>データ型</InputLabel>
                            <Select
                                label="データ型"
                                value={param.paramType}
                                onChange={(e) => handleParamChange(index, 'paramType', e.target.value as ParamType['paramType'])}
                            >
                                <MenuItem value="string">string</MenuItem>
                                <MenuItem value="number">number</MenuItem>
                                <MenuItem value="boolean">boolean</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="日本語名"
                            value={param.paramJP}
                            onChange={(e) => handleParamChange(index, 'paramJP', e.target.value)}
                            size="small"
                            sx={{ flexGrow: 1 }}
                        />
                        <IconButton onClick={() => handleDeleteParam(index)} color="error" size="small">
                            <DeleteOutlineIcon />
                        </IconButton>
                    </Box>
                ))}
                <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddParam} size="small">
                    パラメータを追加
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>キャンセル</Button>
                <Button onClick={handleSaveChanges} variant="contained">保存</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ParamEditModal;