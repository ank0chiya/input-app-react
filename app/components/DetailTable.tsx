// src/components/RowSpanEditableTable.tsx
import React from 'react';
import { Table, TableContainer, Paper } from '@mui/material';
import TableHeader from './DetailTable/Header';
import DetailTableBody from './DetailTable/Body';
import { DetailTableProvider } from './DetailTable/contexts/DetailTableContext';
import type { Product, Params } from '@/app/types'; // 必要な型をインポート

interface BaseTableProps {
    baseTableData: Product[];
    setProductData: React.Dispatch<React.SetStateAction<Product[]>>;
    detailTableData: Params[];
    setParamsData: React.Dispatch<React.SetStateAction<Params[]>>;
}

const RowSpanEditableTable: React.FC<BaseTableProps> = ({
    baseTableData,
    detailTableData,
    setProductData,
    setParamsData,
}) => {
    return (
        <TableContainer component={Paper}>
            {' '}
            {/* 外側に余白 */}
            <Table sx={{ minWidth: 900 }} size="small" aria-label="spanning editable table">
                <TableHeader />
                <DetailTableProvider
                    baseTableData={baseTableData}
                    detailTableData={detailTableData}
                    setProductData={setProductData}
                    setParamsData={setParamsData}
                >
                    <DetailTableBody products={baseTableData} />
                </DetailTableProvider>
            </Table>
        </TableContainer>
    );
};

export default RowSpanEditableTable;
