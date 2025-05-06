// src/components/RowSpanEditableTable.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Table, TableContainer, Paper } from '@mui/material';
import TableHeader from './DetailTable/Header';
import DetailTableBody from './DetailTable/Body';
import { DetailTableProvider } from './DetailTable/contexts/DetailTableContext';
import type {
    Product,
    Attribute,
    Params,
    ParamDetail,
    ParamType1,
    ParamType2,
    ParamType3,
} from '@/app/types'; // 必要な型をインポート

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
    // paramsList を検索しやすい Map に変換
    const paramsMap = useMemo(() => {
        const map = new Map<string, Params>();
        detailTableData.forEach((p) => {
            map.set(`${p.productId}-${p.attributeId}`, p);
        });
        return map;
    }, [detailTableData]);


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
                    <DetailTableBody
                        products={baseTableData}
                        // paramsMap={paramsMap}
                        // handleAttributeChange={handleAttributeChange}
                        // handleParamChange={handleParamChange}
                        // handleAddParam={handleAddParam}
                        // handleDeleteParam={handleDeleteParam}
                        // handleMoveParamUp={handleMoveParamUp}   // 移動ハンドラを渡す
                        // handleMoveParamDown={handleMoveParamDown} // 移動ハンドラを渡す
                    />
                </DetailTableProvider>
            </Table>
        </TableContainer>
    );
};

export default RowSpanEditableTable;
