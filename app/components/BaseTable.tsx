// 'use client';
import React, { useCallback, useState } from 'react';
import { Product, Attribute, Params } from '../types';
import { Table, TableContainer, Paper } from '@mui/material';
import BaseTableHeader from './BaseTable/Header';
import BaseTableBody from './BaseTable/Body';
import BaseTableManager from './BaseTable/Manager';
import { BaseTableProvider } from './BaseTable/contexts/BaseTableContext';
import { sample_products, sample_params } from '../data/data'; // サンプルデータをインポート

// 新しい行のデフォルトデータを作成する関数
const createNewRowData = (productId: number, sortOrder: number): Product => {
    // ランダムなアルファベット3文字を生成
    const randomAlpha = Math.random().toString(36).substring(2, 5).toUpperCase();
    return {
        productId: productId,
        prefix: randomAlpha,
        type: '',
        cfgType: '',
        attributes: [], // 最初はパラメータなし
        sortOrder: sortOrder,
    };
};

interface BaseTableProps {
    baseTableData: Product[];
    setProductData: React.Dispatch<React.SetStateAction<Product[]>>;
    detailTableData: Params[];
    setParamsData: React.Dispatch<React.SetStateAction<Params[]>>;
    handleAddParamsRow: (targetRow: Product, updatedAttributes: Attribute[], attributeIndex: number) => void
}

export default function BaseTable({
    baseTableData,
    detailTableData,
    setProductData,
    setParamsData,
    handleAddParamsRow,
}: BaseTableProps) {
    
    // 子コンポーネント から行データの変更通知を受け取るコールバック
    const handleDataUpdate = useCallback((updatedRow: Product, rowIndex: number) => {
        setProductData((prevData) => {
            return prevData.map((row, index) => (index === rowIndex ? updatedRow : row));
        });
    }, []);

    // DataTable から行追加通知を受け取るコールバック
    const handleAddRowCallback = useCallback((rowIndex: number) => {
        // const newRow = createNewRowData();
        setProductData((prevData) => {
            const maxId = Math.max(...prevData.map((row) => row.productId), 0);

            const newRow = createNewRowData(maxId + 1, rowIndex);

            const newData = [
                ...prevData.slice(0, rowIndex + 1), // クリックされた行の直後に追加
                newRow,
                ...prevData.slice(rowIndex + 1),
            ];
            return newData;
        });
    }, []);

    const handleDeleteRowCallback = useCallback((rowIndex: number) => {
        setProductData((prevData) => {
            if (prevData.length <= 1) {
                return prevData;
            }
            return prevData.filter((_, index) => index !== rowIndex);
        });
    }, []);

    return (
        <>
            <BaseTableManager tableData={baseTableData} />
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 900 }} aria-label="data table with parameters expanded">
                    <BaseTableHeader />
                    <BaseTableProvider
                        baseTableData={baseTableData}
                        detailTableData={detailTableData}
                        setParamsData={setParamsData}
                        onAddParamsDataRow={handleAddParamsRow}
                        onDataChange={handleDataUpdate} // 行データ変更時のコールバック
                        onAddRow={handleAddRowCallback} // 行追加時のコールバック
                        onDeleteRow={handleDeleteRowCallback} // 行削除時のコールバック>
                    >
                        <BaseTableBody tableData={baseTableData} />
                    </BaseTableProvider>
                </Table>
            </TableContainer>
        </>
    );
}
