// 'use client';
import React, { useCallback, useState } from 'react';
import { Product, Attribute, Params } from '../types';
import { Table, TableContainer, Paper } from '@mui/material';
import BaseTableHeader from './BaseTable/Header';
import BaseTableBody from './BaseTable/Body';
import { BaseTableProvider } from './BaseTable/contexts/BaseTableContext';

interface BaseTableProps {
    baseTableData: Product[];
    setProductData: React.Dispatch<React.SetStateAction<Product[]>>;
    detailTableData: Params[];
    setParamsData: React.Dispatch<React.SetStateAction<Params[]>>;
    handleAddParamsRow: (
        targetRow: Product,
        updatedAttributes: Attribute[],
        attributeIndex: number,
    ) => void;
}

export default function BaseTable({
    baseTableData,
    detailTableData,
    setProductData,
    setParamsData,
    handleAddParamsRow,
}: BaseTableProps) {
    return (
        <>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 900 }} aria-label="data table with parameters expanded">
                    <BaseTableHeader />
                    <BaseTableProvider
                        baseTableData={baseTableData}
                        detailTableData={detailTableData}
                        setProductData={setProductData}
                        setParamsData={setParamsData}
                        onAddParamsDataRow={handleAddParamsRow}
                    >
                        <BaseTableBody tableData={baseTableData} />
                    </BaseTableProvider>
                </Table>
            </TableContainer>
        </>
    );
}
