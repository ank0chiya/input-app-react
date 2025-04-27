import { Product, Attribute } from '@/app/types';
import { TableRow, TableCell, Stack } from '@mui/material';

import {
    TextFieldCell,
    AttributeTypeFieldCell,
    CheckboxCell,
    ActionFieldCell,
    AddRowTooltip,
    DeleteRowTooltip,
    AddParamTooltip,
} from './BodyCells';
import React from 'react';
import { Check } from '@mui/icons-material';

function EmptyAttribute(row: Product, rowIndex: number, tableDataLength: number) {
    // 新規プロダクト行を追加した場合など、属性が空の場合の処理
    return (
        <TableRow
            key={`${row.prefix}-${rowIndex}-empty-attribute`}
            sx={{
                '& > td': {
                    border: '1px solid rgba(224, 224, 224, 1)',
                    verticalAlign: 'middle',
                    p: 0.5,
                },
            }}
        >
            <TextFieldCell rowSpan={1} value={row.prefix} />
            <TextFieldCell rowSpan={1} value={row.type} />
            <TextFieldCell rowSpan={1} value={row.cfgType} />
            <TableCell
                colSpan={9}
                align="center"
                sx={{ color: 'text.disabled', fontSize: '0.8rem' }}
            >
                パラメータがありません
            </TableCell>
            <TableCell rowSpan={1} align="center">
                <AddParamTooltip rowIndex={rowIndex}/>
            </TableCell>
            <TableCell>
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <AddRowTooltip rowIndex={rowIndex} />
                    <DeleteRowTooltip rowIndex={rowIndex} tableDataLength={tableDataLength} />
                </Stack>
            </TableCell>
        </TableRow>
    );
}

function AttributeRow({
    row,
    rowIndex,
    attribute,
    attributeIndex,
    rowSpanCount,
    isFirstAttribute,
    tableDataLength,
}: {
    row: Product;
    rowIndex: number;
    attribute: Attribute;
    attributeIndex: number;
    rowSpanCount: number;
    isFirstAttribute: boolean;
    tableDataLength: number;
}) {
    return (
        <TableRow
            // key={`${row.prefix}-${rowIndex}`}
            sx={{
                '& > td': {
                    border: '1px solid rgba(224, 224, 224, 1)',
                    verticalAlign: 'middle',
                    p: 0.5,
                },
            }}
        >
            {isFirstAttribute && (
                <>
                    <TextFieldCell rowSpan={rowSpanCount} value={row.prefix} />
                    <TextFieldCell rowSpan={rowSpanCount} value={row.type} />
                    <TextFieldCell rowSpan={rowSpanCount} value={row.cfgType} />
                </>
            )}
            <TextFieldCell rowSpan={1} value={attribute.attribute} />
            <AttributeTypeFieldCell rowSpan={1} value={attribute.attributeType} />
            <TextFieldCell rowSpan={1} value={attribute.attributeJP} />
            <TextFieldCell rowSpan={1} value={attribute.attributeUnit} />
            <CheckboxCell rowSpan={1} value={attribute.paramHas} />
            <TextFieldCell rowSpan={1} value={attribute.contract} />
            <CheckboxCell rowSpan={1} value={attribute.public} />
            <CheckboxCell rowSpan={1} value={attribute.masking} />
            <CheckboxCell rowSpan={1} value={attribute.online} />
            <ActionFieldCell
                row={row}
                rowIndex={rowIndex}
                rowSpanCount={rowSpanCount}
                attributeIndex={attributeIndex}
                tableDataLength={tableDataLength}
            />
        </TableRow>
    );
}
export default function BaseTableRow({
    key,
    sx,
    row,
    rowIndex,
    tableDataLength,
}: {
    key: any;
    sx: any;
    row: Product;
    rowIndex: number;
    tableDataLength: number;
}) {
    if (row.attributes.length === 0) {
        return EmptyAttribute(row, rowIndex, tableDataLength);
    }

    return (
        <>
            {row.attributes.map((attribute, index) => {
                const isFirstParam = index === 0;
                const rowSpanCount = row.attributes.length;

                return (
                    <AttributeRow
                        key={`${row.prefix}-${rowIndex}-${attribute.attributeId}`}
                        row={row}
                        rowIndex={rowIndex}
                        attribute={attribute}
                        attributeIndex={index}
                        rowSpanCount={rowSpanCount}
                        isFirstAttribute={isFirstParam}
                        tableDataLength={tableDataLength}
                    />
                );
            })}
        </>
    );
}
