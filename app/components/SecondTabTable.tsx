import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography
} from '@mui/material';
import FlatTableRow2 from './FlatTableRow';
import { Column, TableRowType } from '../data';

interface SecondTabTable2Props {
  data: TableRowType[];
  columns: Column[];
  onDataChange: (rowId: string, fieldId: string, value: any) => void;
  onSubItemChange: (rowId: string, subItemIndex: number, fieldId: string, value: any) => void;
  onAddSubItem: (rowId: string) => void;
  onRemoveSubItem: (rowId: string, subItemIndex: number) => void;
}

const SecondTabTable2: React.FC<SecondTabTable2Props> = ({
  data,
  columns,
  onDataChange,
  onSubItemChange,
  onAddSubItem,
  onRemoveSubItem
}) => {
  const nestedColumn = columns.find(col => col.type === 'nested');
  const selectedRows = data.filter(row => row.selected);
  
  if (selectedRows.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          1つ目のタブで行を選択してください
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      <TableContainer component={Paper} sx={{ minWidth: '100%' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              '& th': { 
                border: '1px solid rgba(224, 224, 224, 1)',
              }
            }}>
              {/* data.tsの順番に従ってカラムを表示 */}
              {columns.map((column) => {
                // 通常のカラム
                if (column.type !== 'nested') {
                  return (
                    <TableCell key={column.id}>{column.label}</TableCell>
                  );
                }
                // ネストされたカラム（パターン1またはパターン2）
                else if (column.subColumns && column.subColumns.length > 0) {
                  return column.subColumns.map(subCol => (
                    <TableCell key={subCol.id}>{subCol.label}</TableCell>
                  ));
                }
                return null;
              })}
              
              {/* 操作カラムのヘッダー */}
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedRows.map((row) => (
              <FlatTableRow2
                key={row.prefix}
                row={row}
                columns={columns}
                onDataChange={onDataChange}
                onSubItemChange={onSubItemChange}
                onAddSubItem={onAddSubItem}
                onRemoveSubItem={onRemoveSubItem}
                isEditable={true}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SecondTabTable2;
