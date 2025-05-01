// src/components/EditableTableCell.tsx
import React, { useState, ChangeEvent, FocusEvent, useEffect } from 'react';
import { TextField, Checkbox } from '@mui/material';
import type { EditableCellProps } from '@/app/types';

const EditableTableCell: React.FC<EditableCellProps> = ({
    value,
    onChange,
    type = 'string',
    editable = true,
    placeholder = '',
}) => {
    const [internalValue, setInternalValue] = useState(value);

    // 親コンポーネントから渡された value が変更されたら内部状態も更新
    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue =
            type === 'number'
                ? parseFloat(event.target.value) || 0 // 数値に変換、無効なら0
                : event.target.value;
        setInternalValue(newValue);
        // 数値や文字列の場合、フォーカスが外れた時に onChange を呼ぶ
    };

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setInternalValue(checked);
        onChange(checked); // チェックボックスは即時反映
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Blur時に変更を確定（Checkbox以外）
        if (type !== 'boolean' && internalValue !== value) {
            // 値が変更されていたら
            onChange(internalValue ?? (type === 'number' ? 0 : '')); // null/undefined を適切に処理
        }
    };

    if (!editable) {
        return type === 'boolean' ? (
            <Checkbox checked={!!value} disabled />
        ) : (
            <span>{String(value ?? '')}</span>
        );
    }

    if (type === 'boolean') {
        return <Checkbox checked={!!internalValue} onChange={handleCheckboxChange} />;
    }

    return (
        <TextField
            value={internalValue ?? ''} // undefined/nullを空文字に
            onChange={handleInputChange}
            onBlur={handleBlur}
            type={type === 'number' ? 'number' : 'text'}
            variant="standard"
            size="small"
            placeholder={placeholder}
            fullWidth
            sx={{
                // 標準的な入力欄に見せるための最小限のスタイル
                padding: 0,
                margin: 0,
                '.MuiInputBase-input': { padding: '2px 0px' }, // パディング調整
            }}
            inputProps={type === 'number' ? { step: 'any' } : {}} // numberの場合、任意の小数を許可
        />
    );
};

export default EditableTableCell;
