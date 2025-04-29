import { Product, Attribute } from '@/app/types';
import { TableRow, TableCell, Stack } from '@mui/material';

import {
    TextFieldCell,
    AttributeTypeFieldCell,
    CheckboxCell,
    ActionFieldCells,
    AddRowTooltip,
    DeleteRowTooltip,
    AddAttributeTooltip,
} from './BodyCells';
import React from 'react';

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
            <TextFieldCell rowSpan={1} value={row.prefix} columnId="prefix" rowIndex={rowIndex} />
            <TextFieldCell rowSpan={1} value={row.type} columnId="prefix" rowIndex={rowIndex} />
            <TextFieldCell rowSpan={1} value={row.cfgType} columnId="prefix" rowIndex={rowIndex} />
            <TableCell
                colSpan={8}
                align="center"
                sx={{ color: 'text.disabled', fontSize: '0.8rem' }}
            >
                パラメータがありません
            </TableCell>
            <TableCell rowSpan={1} align="center">
                <AddAttributeTooltip rowIndex={rowIndex} />
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
                    <TextFieldCell
                        rowSpan={rowSpanCount}
                        value={row.prefix}
                        columnId="prefix"
                        rowIndex={rowIndex}
                    />
                    <TextFieldCell
                        rowSpan={rowSpanCount}
                        value={row.type}
                        columnId="type"
                        rowIndex={rowIndex}
                    />
                    <TextFieldCell
                        rowSpan={rowSpanCount}
                        value={row.cfgType}
                        columnId="cfgType"
                        rowIndex={rowIndex}
                    />
                </>
            )}
            <TextFieldCell
                rowSpan={1}
                value={attribute.attribute}
                columnId="attribute"
                rowIndex={rowIndex}
                attributeIndex={attributeIndex}
            />
            <AttributeTypeFieldCell
                rowSpan={1}
                value={attribute.attributeType}
                columnId="attributeType"
                rowIndex={rowIndex}
                attributeIndex={attributeIndex}
            />
            <TextFieldCell
                rowSpan={1}
                value={attribute.attributeJP}
                columnId="attributeJP"
                rowIndex={rowIndex}
                attributeIndex={attributeIndex}
            />
            <TextFieldCell
                rowSpan={1}
                value={attribute.attributeUnit}
                columnId="attributeUnit"
                rowIndex={rowIndex}
                attributeIndex={attributeIndex}
            />
            <CheckboxCell
                rowSpan={1}
                value={attribute.paramHas}
                columnId="paramHas"
                rowIndex={rowIndex}
                attributeIndex={attributeIndex}
            />
            <TextFieldCell
                rowSpan={1}
                value={attribute.contract}
                columnId="contract"
                rowIndex={rowIndex}
                attributeIndex={attributeIndex}
            />
            <CheckboxCell
                rowSpan={1}
                value={attribute.public}
                columnId="public"
                rowIndex={rowIndex}
                attributeIndex={attributeIndex}
            />
            <CheckboxCell
                rowSpan={1}
                value={attribute.masking}
                columnId="masking"
                rowIndex={rowIndex}
                attributeIndex={attributeIndex}
            />
            <ActionFieldCells
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
    sx,
    row,
    rowIndex,
    tableDataLength,
}: {
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
