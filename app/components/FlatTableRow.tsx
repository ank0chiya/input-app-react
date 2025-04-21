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

  // アイテムタイプに基づく条件付き表示の制御
  const isPattern1Active = row.itemType === 'pattern1';
  const isPattern2Active = row.itemType === 'pattern2';

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

  // 特定のネストカラムが編集可能かどうかを判断
  const isNestedColumnEditable = (columnId: string) => {
    if (columnId === 'params') {
      return isEditable; // パラメータは常に編集可能（isEditableに依存）
    } else if (columnId === 'pattern1') {
      return isEditable && isPattern1Active; // pattern1はアイテムタイプがpattern1の場合のみ編集可能
    } else if (columnId === 'pattern2') {
      return isEditable && isPattern2Active; // pattern2はアイテムタイプがpattern2の場合のみ編集可能
    }
    return false;
  };

  // 詳細情報タブ用のレンダリング（パターン1とパターン2のサブカラムを適切に表示）
  const renderDetailTabRow = () => {
    // 現在のアイテムタイプに基づいて、表示するネストカラムを決定
    const activeNestedColumn = columns.find(col =>
      col.type === 'nested' &&
      ((row.itemType === 'pattern1' && col.id === 'pattern1') ||
        (row.itemType === 'pattern2' && col.id === 'pattern2'))
    );

    // アクティブなネストカラムがない場合は何も表示しない
    if (!activeNestedColumn) {
      return null;
    }

    const activeSubItems = row.itemType === 'pattern1' ? row.pattern1 : row.pattern2;

    return activeSubItems.map((subItem: any, index: number) => (
      <TableRow key={`${row.prefix}-${activeNestedColumn.id}-${index}`}>
        {/* 最初の行にのみメインカラムを表示 */}
        {index === 0 && columns.map(column => {
          if (column.type !== 'nested') {
            return (
              <TableCell
                key={column.id}
                rowSpan={activeSubItems.length}
              >
                {renderCellContent(
                  row,
                  column,
                  (value) => onDataChange(row.prefix, column.id, value)
                )}
              </TableCell>
            );
          }
          return null;
        })}

        {/* アクティブなパターンのサブカラムを表示 */}
        {activeNestedColumn.subColumns?.map(subCol => (
          <TableCell
            key={subCol.id}
            style={{
              opacity: isNestedColumnEditable(activeNestedColumn.id) ? 1 : 0.5
            }}
          >
            {renderCellContent(
              subItem,
              subCol,
              (value) => isNestedColumnEditable(activeNestedColumn.id)
                ? onSubItemChange(row.prefix, index, subCol.id, value)
                : null
            )}
          </TableCell>
        ))}

        {/* 操作ボタン */}
        {isEditable && (
          <TableCell>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* サブアイテムが1つだけの場合は削除ボタンを無効化 */}
              <IconButton
                size="small"
                onClick={() => onRemoveSubItem(row.prefix, index)}
                color="error"
                disabled={activeSubItems.length <= 1 || !isNestedColumnEditable(activeNestedColumn.id)}
              >
                <DeleteIcon />
              </IconButton>

              {/* 最後の行にのみ追加ボタンを表示 */}
              {index === activeSubItems.length - 1 && (
                <IconButton
                  size="small"
                  onClick={() => onAddSubItem(row.prefix)}
                  color="primary"
                  disabled={!isNestedColumnEditable(activeNestedColumn.id)}
                >
                  <AddIcon />
                </IconButton>
              )}
            </Box>
          </TableCell>
        )}
      </TableRow>
    ));
  };

  // 基本情報タブ用のレンダリング（パラメータ一覧を表示）
  const renderBasicTabRow = () => {
    if (!nestedColumn || !shouldRenderNestedColumn(nestedColumn.id)) {
      return null;
    }

    const subItems = getSubItems(nestedColumn.id);
    console.log('subItems:', subItems);
    console.log('columns: in basic', columns);

    // return columns.map((column: Column, index: number) => (
    //   <TableRow key={`${row.prefix}-${nestedColumn.id}-${index}`}>

    //   </TableRow>
    // ));
    return subItems.map((subItem: any, index: number) => (
      <TableRow key={`${row.prefix}-${nestedColumn.id}-${index}`}>
        {/* 最初の行にのみメインカラムを表示 */}
        {index === 0 && columns.map(column => {
          if (column.type !== 'nested') {
            return (
              <TableCell
                key={column.id}
                rowSpan={subItems.length}
              >
                {renderCellContent(
                  row,
                  column,
                  (value) => onDataChange(row.prefix, column.id, value)
                )}
              </TableCell>
            );
          } else if (column.type === 'nested') {
            {/* ネストされたカラムのサブカラムを表示 */ }
            console.log('nested column:', column);
            {
              nestedColumn.subColumns?.map(subCol => { 
                console.log('nested subCol:', subCol);
                console.log('nested subItem:', subItem);
                return ( 
                  <TableCell
                    key={subCol.id}
                  >
                    {renderCellContent(
                      subItem, // subItem がこのスコープで利用可能か確認
                      subCol,
                      (value) => onSubItemChange(row.prefix, index, subCol.id, value) // row, index, onSubItemChange が利用可能か確認
                    )}
                  </TableCell>
                );
              })
            } 
          }
          return null;
        })}

        {/* パラメータのサブカラムを表示 */}
        {/* {nestedColumn.subColumns?.map(subCol => (
          <TableCell 
            key={subCol.id}
          >
            {renderCellContent(
              subItem, 
              subCol, 
              (value) => onSubItemChange(row.prefix, index, subCol.id, value)
            )}
          </TableCell>
        ))} */}

        {/* 操作ボタン */}
        {isEditable && (
          <TableCell>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* サブアイテムが1つだけの場合は削除ボタンを無効化 */}
              <IconButton
                size="small"
                onClick={() => onRemoveSubItem(row.prefix, index)}
                color="error"
                disabled={subItems.length <= 1}
              >
                <DeleteIcon />
              </IconButton>

              {/* 最後の行にのみ追加ボタンを表示 */}
              {index === subItems.length - 1 && (
                <IconButton
                  size="small"
                  onClick={() => onAddSubItem(row.prefix)}
                  color="primary"
                >
                  <AddIcon />
                </IconButton>
              )}
            </Box>
          </TableCell>
        )}
      </TableRow>
    ));
  };

  // ネストカラムのIDに基づいて適切なレンダリング関数を選択
  return (
    <>
      {nestedColumn?.id === 'params'
        ? renderBasicTabRow()
        : renderDetailTabRow()}
    </>
  );
};

export default FlatTableRow;
