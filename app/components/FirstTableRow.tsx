import React from 'react';
import {
  TableRow,
  TableCell,
  Box,
  TextField,
  Checkbox,
  IconButton,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Column, TableRowType } from '../data';
import { cp } from 'fs';

interface FlatTableRowProps {
  row: TableRowType;
  columns: Column[];
  onDataChange: (rowId: string, fieldId: string, value: any) => void;
  onSubItemChange: (rowId: string, subItemIndex: number, fieldId: string, value: any) => void;
  onAddSubItem: (rowId: string) => void;
  onRemoveSubItem: (rowId: string, subItemIndex: number) => void;
  isEditable?: boolean;
}

const FlatTableRow: React.FC<FlatTableRowProps> = ({
  row,
  columns,
  onDataChange,
  onSubItemChange,
  onAddSubItem,
  onRemoveSubItem,
  isEditable = true
}) => {
  console.log('FlatTableRow2 row:', row);
  console.log('FlatTableRow2 columns:', columns);
  const nestedColumn = columns.find(col => col.type === 'nested');

  const renderCellContent = (row: any, column: Column, onChange: (value: any) => void) => {
    // カラムのタイプに基づいて適切なコンポーネントを表示
    const columnType = column.type;

    if (!isEditable) {
      if (columnType === 'checkbox') {
        return <Checkbox checked={row[column.id]} disabled />;
      }
      if (columnType === 'dropdown') {
        return row[column.id] === 'pattern1' ? 'パターン1' : 'パターン2';
      }
      if (columnType === 'int') {
        return row[column.id];
      }
      return row[column.id];
    }

    switch (columnType) {
      case 'checkbox':
        return (
          <Checkbox
            checked={row[column.id] || false}
            onChange={(e) => onChange(e.target.checked)}
          />
        );
      case 'dropdown':
        return (
          <FormControl fullWidth size="small">
            <Select
              value={row[column.id] || 'pattern1'}
              onChange={(e) => onChange(e.target.value)}
              variant="outlined"
              size="small"
            >
              <MenuItem value="pattern1">パターン1</MenuItem>
              <MenuItem value="pattern2">パターン2</MenuItem>
            </Select>
          </FormControl>
        );
      case 'int':
        return (
          <TextField
            type="number"
            value={row[column.id] || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              // 0以上の値のみ許可
              if (!isNaN(value) && value >= 0) {
                onChange(value);
              }
            }}
            inputProps={{ min: 0 }}
            variant="outlined"
            size="small"
            fullWidth
          />
        );
      case 'text':
      default:
        return (
          <TextField
            value={row[column.id] || ''}
            onChange={(e) => onChange(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          />
        );
    }
  };

  // パターン1またはパターン2のサブアイテムを取得
  const getSubItems = (columnId: string) => {
    if (columnId === 'params') {
      return row.params;
    } else if (columnId === 'pattern1') {
      return row.pattern1;
    } else if (columnId === 'pattern2') {
      return row.pattern2;
    }
    return [];
  };

  // 特定のネストカラムのサブアイテムを表示するかどうかを判断
  const shouldRenderNestedColumn = (columnId: string) => {
    if (columnId === 'params') {
      return true; // パラメータは常に表示
    } else if (columnId === 'pattern1') {
      return nestedColumn?.id === 'pattern1'; // pattern1カラムの場合のみ表示
    } else if (columnId === 'pattern2') {
      return nestedColumn?.id === 'pattern2'; // pattern2カラムの場合のみ表示
    }
    return false;
  };

  // 基本情報タブ用のレンダリング（パラメータ一覧を表示）
  const renderBasicTabRow = () => {
    if (!nestedColumn || !shouldRenderNestedColumn(nestedColumn.id)) {
      return null;
    }

    const subItems = getSubItems(nestedColumn.id);
    console.log('subItems:', subItems);
    console.log('columns: in basic', columns);


  };

  // ネストカラムのIDに基づいて適切なレンダリング関数を選択
  return (
    <>
      {renderBasicTabRow()}
    </>
  );
};

export default FlatTableRow;
