import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box
} from '@mui/material';
import FlatTableRow from './FlatTableRow';
import { Column, TableRowType } from '../data';

interface FirstTabTableProps {
  data: TableRowType[];
  columns: Column[];
  onDataChange: (rowId: string, fieldId: string, value: any) => void;
  onSubItemChange: (rowId: string, subItemIndex: number, fieldId: string, value: any) => void;
  onAddSubItem: (rowId: string) => void;
  onRemoveSubItem: (rowId: string, subItemIndex: number) => void;
}

const FirstTabTable: React.FC<FirstTabTableProps> = ({
  data,
  columns,
  onDataChange,
  onSubItemChange,
  onAddSubItem,
  onRemoveSubItem
}) => {
  console.log('FirstTabTable data:', data);
  const nestedColumn = columns.find(col => col.type === 'nested');
  
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
                // ネストされたカラム（パラメータ一覧）
                else if (column.subColumns && column.subColumns.length > 0) {
                  return (
                    <TableCell 
                      key={column.id}
                      colSpan={column.subColumns.length} 
                      sx={{ 
                        padding: 0,
                      }}
                    >
                      {/* 上部: パラメータ一覧 */}
                      <Box sx={{ 
                        textAlign: 'center', 
                        borderBottom: '1px solid rgba(224, 224, 224, 1)',
                        padding: '8px'
                      }}>
                        {column.label}
                      </Box>
                      
                      {/* 下部: サブカラムのヘッダー */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                      }}>
                        {column.subColumns?.map((subCol, index) => (
                          <Box 
                            key={subCol.id} 
                            sx={{ 
                              flex: 1, 
                              textAlign: 'center',
                              padding: '8px',
                              ...(index < (column.subColumns?.length || 0) - 1 ? {
                                borderRight: '1px solid rgba(224, 224, 224, 1)'
                              } : {})
                            }}
                          >
                            {subCol.label}
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                  );
                }
                return null;
              })}
              
              {/* 操作カラムのヘッダー */}
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.filter(row => 
              // パラメータが存在する行のみ表示
              row.params && row.params.length > 0
            ).map((row) => (
              <FlatTableRow
                key={row.prefix}
                row={row}
                columns={columns}
                onDataChange={onDataChange}
                onSubItemChange={onSubItemChange}
                onAddSubItem={onAddSubItem}
                onRemoveSubItem={onRemoveSubItem}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FirstTabTable;
