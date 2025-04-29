// components/DataTable.tsx
"use client";
import React, { useCallback, JSX } from "react";
import { Table, TableContainer, Paper } from "@mui/material";
import { TableRowType, Column, ParamType } from "../types"; // 型定義
import { firstTabTableColumns } from "../config/tableColumn"; // カラム定義

import DataTableHeader from "./DataTableHeader"; // ヘッダーコンポーネントをインポート
import DataTableBody from "./DataTableBody"; // ボディコンポーネントをインポート

// Props のインターフェース定義
interface DataTableProps {
  tableData: TableRowType[];
  onDataChange: (updatedRow: TableRowType, rowIndex: number) => void; // 親へのデータ変更通知
  onAddRow: (rowIndex: number) => void; // 親への行追加通知
  onDeleteRow: (rowIndex: number) => void; // 親への行削除通知
}

// DataTable コンポーネント本体
const DataTable = ({
  tableData,
  onDataChange,
  onAddRow,
  onDeleteRow,
}: DataTableProps): JSX.Element => {
  // 使用するカラム定義 (アクション列は別途追加)

  // --- データ変更関連のコールバック関数 ---

  // 行データ全体の更新を親コンポーネントに通知する関数
  const handleRowUpdate = useCallback(
    (updatedRow: TableRowType, rowIndex: number) => {
      onDataChange(updatedRow, rowIndex);
    },
    [onDataChange]
  );

  // トップレベルのセル (ID, タイプ, 設定タイプ) の値が変更された時のハンドラ
  const handleTopLevelCellChange = useCallback(
    (
      rowIndex: number,
      columnId: keyof Pick<TableRowType, "prefix" | "type" | "cfgType">,
      value: string
    ) => {
      const targetRow = tableData[rowIndex];
      const updatedRow = { ...targetRow, [columnId]: value };
      handleRowUpdate(updatedRow, rowIndex);
    },
    [tableData, handleRowUpdate]
  );

  // パラメータ配列内の特定のフィールドの値が変更された時のハンドラ
  const handleParamFieldChange = useCallback(
    (
      rowIndex: number,
      paramIndex: number,
      field: keyof ParamType,
      value: string | boolean | number
    ) => {
      const targetRow = tableData[rowIndex];
      if (!targetRow) {
        console.error(`Row not found at index ${rowIndex}`);
        return;
      }
      const updatedParams = targetRow.params.map((param, pIndex) =>
        pIndex === paramIndex ? { ...param, [field]: value } : param
      );
      const updatedRow = { ...targetRow, params: updatedParams };
      handleRowUpdate(updatedRow, rowIndex);
    },
    [tableData, handleRowUpdate]
  );

  // パラメータを指定位置の後に追加するハンドラ
  const handleAddParam = useCallback(
    (rowIndex: number, paramIndex?: number) => {
      const targetRow = tableData[rowIndex];
      if (!targetRow) return;
      
      const newParam: ParamType = {
        param: "",
        paramType: "string",
        paramJP: "",
        selected: false,
        public: false,
        security: false,
        itemType: 'pattern1'// build用に定義
      };

      let updatedParams;
      if (paramIndex === undefined || paramIndex === -1) {
        // パラメータがない場合は最初のパラメータとして追加
        updatedParams = [newParam];
      } else {
        // 指定されたパラメータの後に新しいパラメータを挿入
        updatedParams = [
          ...targetRow.params.slice(0, paramIndex + 1),
          newParam,
          ...targetRow.params.slice(paramIndex + 1)
        ];
      }

      const updatedRow = {
        ...targetRow,
        params: updatedParams,
      };
      handleRowUpdate(updatedRow, rowIndex);
    },
    [tableData, handleRowUpdate]
  );

  // パラメータを削除するハンドラ
  const handleDeleteParam = useCallback(
    (rowIndex: number, paramIndex: number) => {
      const targetRow = tableData[rowIndex];
      if (!targetRow || targetRow.params.length <= 1) return; // 最後のパラメータは削除不可
      
      const updatedParams = targetRow.params.filter((_, pIndex) => pIndex !== paramIndex);
      const updatedRow = { ...targetRow, params: updatedParams };
      handleRowUpdate(updatedRow, rowIndex);
    },
    [tableData, handleRowUpdate]
  );

  // パラメータの順番を上に移動するハンドラ
  const handleMoveParamUp = useCallback(
    (rowIndex: number, paramIndex: number) => {
      const targetRow = tableData[rowIndex];
      if (!targetRow || paramIndex <= 0) return; // 最初のパラメータは上に移動できない
      
      const updatedParams = [...targetRow.params];
      // 選択したパラメータと1つ上のパラメータを入れ替え
      [updatedParams[paramIndex], updatedParams[paramIndex - 1]] = 
        [updatedParams[paramIndex - 1], updatedParams[paramIndex]];
      
      const updatedRow = { ...targetRow, params: updatedParams };
      handleRowUpdate(updatedRow, rowIndex);
    },
    [tableData, handleRowUpdate]
  );

  // パラメータの順番を下に移動するハンドラ
  const handleMoveParamDown = useCallback(
    (rowIndex: number, paramIndex: number) => {
      const targetRow = tableData[rowIndex];
      if (!targetRow || paramIndex >= targetRow.params.length - 1) return; // 最後のパラメータは下に移動できない
      
      const updatedParams = [...targetRow.params];
      // 選択したパラメータと1つ下のパラメータを入れ替え
      [updatedParams[paramIndex], updatedParams[paramIndex + 1]] = 
        [updatedParams[paramIndex + 1], updatedParams[paramIndex]];
      
      const updatedRow = { ...targetRow, params: updatedParams };
      handleRowUpdate(updatedRow, rowIndex);
    },
    [tableData, handleRowUpdate]
  );

  // 行追加ボタンが押された時のハンドラ (親コンポーネントの関数を呼び出す)
  const handleAddRow = useCallback(
    (rowIndex: number) => onAddRow(rowIndex),
    [onAddRow]
  );

  // 行削除ボタンが押された時のハンドラ (親コンポーネントの関数を呼び出す)
  const handleDeleteRow = useCallback(
    (rowIndex: number) => onDeleteRow(rowIndex),
    [onDeleteRow]
  );

  // --- レンダリング ---
  return (
    <TableContainer component={Paper}>
      <Table
        sx={{ minWidth: 900 }}
        aria-label="data table with parameters expanded"
      >
        {/* テーブルヘッダー */}
        <DataTableHeader />
        {/* テーブルボディ */}
        <DataTableBody
          tableData={tableData}
          onTopLevelCellChange={handleTopLevelCellChange}
          onParamFieldChange={handleParamFieldChange}
          onAddParam={handleAddParam}
          onDeleteParam={handleDeleteParam}
          onMoveParamUp={handleMoveParamUp}
          onMoveParamDown={handleMoveParamDown}
          onAddRow={handleAddRow}
          onDeleteRow={handleDeleteRow}
        />
      </Table>
    </TableContainer>
  );
};

export default DataTable;
