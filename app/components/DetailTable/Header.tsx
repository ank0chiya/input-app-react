// src/components/TableHeader.tsx (または DetailTable/Header.tsx)
import React from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles'; // SxPropsの型をインポート

// --- ヘッダーセル設定 ---

const tableHeadSx: SxProps<Theme> = {
    backgroundColor: 'grey.100',
    '& th': {
        fontWeight: 'bold',
        border: '1px solid rgba(224, 224, 224, 1)',
    },
};

// ヘッダーセル設定の型定義
interface HeaderCellConfig {
    id: string; // Reactのkeyとして使用するためのユニークなID
    label: string; // セルに表示するテキスト
    rowSpan?: number; // 垂直方向のセル結合数
    colSpan?: number; // 水平方向のセル結合数
}

// 上段ヘッダーの設定データ
const topRowConfig: HeaderCellConfig[] = [
    // Product/Attribute 情報
    { id: 'prefix', label: 'prefix', rowSpan: 2 },
    { id: 'type', label: 'type', rowSpan: 2 },
    { id: 'cfgType', label: 'cfgType', rowSpan: 2 },
    { id: 'attribute', label: 'attribute', rowSpan: 2 },
    { id: 'attributeJP', label: 'attributeJP', rowSpan: 2 },
    { id: 'contract', label: 'contract', rowSpan: 2 },
    // パラメータグループ
    { id: 'paramGroup1', label: 'type1 / type3', colSpan: 2 }, // code, dispName のグループ
    { id: 'paramGroup2', label: 'type2', colSpan: 2 }, // min, increment のグループ
    { id: 'online', label: 'online', rowSpan: 2 },
    { id: 'actions', label: 'アクション', rowSpan: 2 },
];

// 下段ヘッダーの設定データ (変更なし)
const bottomRowConfig: HeaderCellConfig[] = [
    // paramGroup1 の下
    { id: 'code', label: 'code' },
    { id: 'dispName', label: 'dispName' },
    // paramGroup2 の下
    { id: 'min', label: 'min' },
    { id: 'increment', label: 'increment' },
];

const TableHeader: React.FC = () => {
    return (
        <TableHead sx={tableHeadSx}>
            <TableRow>
                {topRowConfig.map((cell) => (
                    <TableCell key={cell.id} rowSpan={cell.rowSpan} colSpan={cell.colSpan}>
                        {cell.label}
                    </TableCell>
                ))}
            </TableRow>
            <TableRow>
                {bottomRowConfig.map((cell) => (
                    <TableCell key={cell.id}>{cell.label}</TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
};

export default TableHeader;
