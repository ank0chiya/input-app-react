import { BaseTableButtomRow, BaseTableTopRow } from '@/app/types';
import { TableHead, TableRow, TableCell } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

interface HeaderConfig {
    key: keyof BaseTableTopRow | keyof BaseTableButtomRow;
    label: string;
    rowSpan?: number;
    colSpan?: number;
}
const topRowConfig: HeaderConfig[] = [
    { key: 'prefix', label: 'Prefix', rowSpan: 2 },
    { key: 'type', label: 'Type', rowSpan: 2 },
    { key: 'cfgType', label: 'Config Type', rowSpan: 2 },
    { key: 'attributes', label: 'Attributes', colSpan: 4 },
    { key: 'paramHas', label: 'paramHas', rowSpan: 2 },
    { key: 'contract', label: 'contract', rowSpan: 2 },
    { key: 'public', label: 'Public', rowSpan: 2 },
    { key: 'masking', label: 'Masking', rowSpan: 2 },
    { key: 'online', label: 'Online', rowSpan: 2 },
    { key: 'attributeAction', label: '属性操作', rowSpan: 2 },
    { key: 'productAction', label: '行操作', rowSpan: 2 },
];

const bottomRowConfig: HeaderConfig[] = [
    { key: 'attribute', label: 'Attribute', colSpan: 1 },
    { key: 'attributeType', label: '属性タイプ', colSpan: 1 },
    { key: 'attributeJP', label: '属性名', colSpan: 1 },
    { key: 'attributeUnit', label: '単位', colSpan: 1 },
];
// テーブルヘッダーのスタイル定義 (例)
const tableHeadSx: SxProps<Theme> = {
    backgroundColor: 'grey.100',
    '& th': {
        fontWeight: 'bold',
        border: '1px solid rgba(224, 224, 224, 1)',
    },
};

const topRowCells: React.ReactNode[] = [];
const bottomRowCells: React.ReactNode[] = [];
topRowConfig.forEach((col) => {
    if (col.rowSpan) {
        topRowCells.push(
            <TableCell key={col.key} rowSpan={col.rowSpan} align="center">
                {col.label}
            </TableCell>,
        );
    } else {
        topRowCells.push(
            <TableCell key={col.key} colSpan={col.colSpan} align="center">
                {col.label}
            </TableCell>,
        );
    }
});
bottomRowConfig.forEach((col) => {
    bottomRowCells.push(
        <TableCell key={col.key} align="left">
            {col.label}
        </TableCell>,
    );
});

export default function BaseTableHeader() {
    return (
        <TableHead sx={tableHeadSx}>
            <TableRow>
                {topRowCells}
            </TableRow>
            <TableRow>
                {bottomRowCells}
            </TableRow>
        </TableHead>
    );
}
