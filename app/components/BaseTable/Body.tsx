import React from 'react';
import { Product } from '@/app/types';
import { TableBody, TableRow } from '@mui/material';
import BaseTableRow from './BodyRow';

export default function BaseTableBody({ tableData }: { tableData: Product[] }) {
    return (
        <TableBody>
            {tableData.map((row, rowIndex) => (
                <BaseTableRow
                    key={`row-${rowIndex}`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    row={row}
                    rowIndex={rowIndex}
                    tableDataLength={tableData.length}
                />
            ))}
        </TableBody>
    );
}