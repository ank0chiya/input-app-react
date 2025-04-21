import React, { JSX } from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

// 既存の型定義と変換後の型、変換関数をインポート
import {
    Column, // 元データ用
    SubColumn,
    TransformedHeaderConfig, // 変換後データ用
    TransformedGroupedHeader,
    TransformedSimpleHeader
} from '../types';
import { transformConfigForHeader } from '../config/transformHeaderData'; // 変換関数をインポート
import { firstTabTableColumns } from '../config/tableColumn'; // カラム定義

// テーブルヘッダーのスタイル定義 (例)
const tableHeadSx: SxProps<Theme> = {
    backgroundColor: 'grey.100',
    '& th': {
        fontWeight: 'bold',
        border: '1px solid rgba(224, 224, 224, 1)',
    },
};

const secondRowCellSx: SxProps<Theme> = {
    fontSize: '0.75rem',
    py: 0.5,
};

const MyDynamicHeaderFinal: React.FC = () => {
    // ヘッダー表示用に変換した設定データを使用
    const columnsConfigForHeader: TransformedHeaderConfig[] = transformConfigForHeader(firstTabTableColumns);

    const topRowCells: JSX.Element[] = [];
    const bottomRowCells: JSX.Element[] = [];

    columnsConfigForHeader.forEach((column) => {
        // isGroupedHeader フラグで判定
        if (column.isGroupedHeader) {
            // GroupedHeader として扱う
            const groupedColumn = column as TransformedGroupedHeader;

            topRowCells.push(
                <TableCell
                    key={groupedColumn.id}
                    colSpan={groupedColumn.subColumns.length}
                    align="center"
                >
                    {groupedColumn.label}
                </TableCell>
            );
            groupedColumn.subColumns.forEach((subCol: SubColumn) => { // 型は SubColumn
                bottomRowCells.push(
                    <TableCell
                        // key は SubColumn の id (keyof ParamType)
                        key={subCol.id}
                        align="left"
                        sx={secondRowCellSx}
                    >
                        {subCol.label}
                    </TableCell>
                );
            });
        } else {
            // SimpleHeader として扱う (rowSpan=2)
            const simpleColumn = column as TransformedSimpleHeader;
            topRowCells.push(
                <TableCell
                    // key は Column['id'] または SubColumn['id'] (string | keyof ParamType)
                    key={simpleColumn.id as string} // string として扱う
                    rowSpan={2}
                >
                    {simpleColumn.label}
                </TableCell>
            );
        }
    });


    return (
        <TableHead sx={tableHeadSx}>
            <TableRow>
                {topRowCells}
            </TableRow>
            {bottomRowCells.length > 0 && (
                <TableRow>
                    {bottomRowCells}
                </TableRow>
            )}
        </TableHead>
    );
}

export default MyDynamicHeaderFinal;