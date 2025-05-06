// src/components/BodyRow.tsx
import React from 'react';
import { TableRow } from '@mui/material';

// types.ts から必要な型をインポート (パスを環境に合わせて調整)
import type { BodyRowProps, ParamType1, ParamType2, ParamType3, ParamDetail } from '@/app/types';

import {
    ReadOnlyCell,
    EmptyCell,
    CheckboxCell,
    TextFieldCell,
    NumberFieldCell,
    ActionFieldCells,
} from './BodyCells';
import { usePattern } from './contexts/DetailTableContext';

// Type guards to check paramDetail type
function isParamType1Or3(param: ParamDetail | null | undefined): param is ParamType1 | ParamType3 {
    return !!param && (param.type === 'type1' || param.type === 'type3');
}
function isParamType2(param: ParamDetail | null | undefined): param is ParamType2 {
    return !!param && param.type === 'type2';
}

const BodyRow: React.FC<BodyRowProps> = ({
    product,
    attribute,
    paramDetail,
    rowSpanCount,
    isFirstRowOfAttribute,
}) => {
    const { handleParamChange, handleAttributeChange } = usePattern();
    // ユニークキー (paramDetailが存在しない場合も考慮)
    const uniqueKey = `${product.productId}-${attribute.attributeId}-${paramDetail?.paramId ?? 'attr-only'}-${isFirstRowOfAttribute ? 'first' : 'other'}`;

    // --- Helper function to create onChange handlers --- (変更なし)
    const createChangeHandler =
        (handler: (...args: any[]) => void, ...prefixArgs: (string | number | undefined)[]) =>
        (fieldName: string) =>
        (newValue: any) => {
            const idArgs = [...prefixArgs];
            if (idArgs.length === 2) {
                // Attribute changes
            } else if (idArgs.length === 3 && idArgs[2] === undefined && paramDetail?.paramId) {
                idArgs[2] = paramDetail.paramId;
            }
            handler(...idArgs.filter((arg) => arg !== undefined), fieldName, newValue);
        };

    const createParamHandler = createChangeHandler(
        handleParamChange,
        product.productId,
        attribute.attributeId,
        paramDetail?.paramId,
    );
    const createAttributeHandler = createChangeHandler(
        handleAttributeChange,
        product.productId,
        attribute.attributeId,
    );

    // --- Render Parameter Cells
    let codeCell = <EmptyCell />;
    let dispNameCell = <EmptyCell />;
    let minCell = <EmptyCell />;
    let incrementCell = <EmptyCell />;

    if (isParamType1Or3(paramDetail)) {
        codeCell = <TextFieldCell value={paramDetail.code} onChange={createParamHandler('code')} />;
        dispNameCell = (
            <TextFieldCell value={paramDetail.dispName} onChange={createParamHandler('dispName')} />
        );
    } else if (isParamType2(paramDetail)) {
        minCell = (
            <NumberFieldCell
                value={paramDetail.min} // Pass number or string
                onChange={createParamHandler('min')}
            />
        );
        incrementCell = (
            <NumberFieldCell
                value={paramDetail.increment} // Pass number or string
                onChange={createParamHandler('increment')}
            />
        );
    }

    return (
        <TableRow
            key={uniqueKey}
            sx={{
                '& > td': {
                    border: '1px solid rgba(224, 224, 224, 1)',
                    verticalAlign: 'middle',
                    p: 0.5,
                },
            }}
        >
            {/* --- Product & Attribute Cells (最初の行のみ表示 & rowspan) --- */}
            {isFirstRowOfAttribute && (
                <>
                    <ReadOnlyCell rowSpan={rowSpanCount} value={product.prefix} />
                    <ReadOnlyCell rowSpan={rowSpanCount} value={product.type} />
                    <ReadOnlyCell rowSpan={rowSpanCount} value={product.cfgType} />
                    <ReadOnlyCell rowSpan={rowSpanCount} value={attribute.attribute} />
                    <ReadOnlyCell rowSpan={rowSpanCount} value={attribute.attributeJP} />
                    <ReadOnlyCell rowSpan={rowSpanCount} value={attribute.contract} />
                </>
            )}

            {/* --- Parameter Cells --- */}
            {codeCell}
            {dispNameCell}
            {minCell}
            {incrementCell}

            {/* --- Online Cell --- */}
            {isFirstRowOfAttribute && (
                <CheckboxCell
                    rowSpan={rowSpanCount}
                    value={attribute.online}
                    onChange={createAttributeHandler('online')}
                />
            )}

            {/* Action Cell (Replaced with ActionCell component) */}
            <ActionFieldCells product={product} attribute={attribute} paramDetail={paramDetail} />
        </TableRow>
    );
};

export default BodyRow;
