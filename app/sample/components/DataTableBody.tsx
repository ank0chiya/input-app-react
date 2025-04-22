// components/DataTableBody.tsx
"use client";
import React, { JSX } from "react";
import { TableBody } from "@mui/material";
import { TableRowType, ParamType } from "../types"; // 型定義
import DataTableRow, { DataTableRowProps } from "./DataTableRow"; // 行コンポーネントをインポート

// DataTableBody コンポーネントの Props 定義
interface DataTableBodyProps {
  tableData: TableRowType[];
  onTopLevelCellChange: (
    rowIndex: number,
    columnId: keyof Pick<TableRowType, "prefix" | "type" | "cfgType">,
    value: string
  ) => void;
  onParamFieldChange: (
    rowIndex: number,
    paramIndex: number,
    field: keyof ParamType,
    value: string | boolean | number
  ) => void;
  onAddParam: (rowIndex: number) => void;
  onDeleteParam: (rowIndex: number, paramIndex: number) => void; // パラメータ削除用コールバック
  onMoveParamUp: (rowIndex: number, paramIndex: number) => void; // パラメータ上移動用コールバック
  onMoveParamDown: (rowIndex: number, paramIndex: number) => void; // パラメータ下移動用コールバック
  onAddRow: (rowIndex: number) => void;
  onDeleteRow: (rowIndex: number) => void;
}

// DataTableBody コンポーネント
const DataTableBody = ({
  tableData,
  onTopLevelCellChange,
  onParamFieldChange,
  onAddParam,
  onDeleteParam,
  onMoveParamUp,
  onMoveParamDown,
  onAddRow,
  onDeleteRow,
}: DataTableBodyProps): JSX.Element => {
  return (
    <TableBody>
      {tableData.map((row, rowIndex) => (
        <DataTableRow
          key={`row-${rowIndex}`}
          row={row}
          rowIndex={rowIndex}
          tableDataLength={tableData.length}
          onTopLevelCellChange={onTopLevelCellChange}
          onParamFieldChange={onParamFieldChange}
          onAddParam={onAddParam}
          onDeleteParam={onDeleteParam}
          onMoveParamUp={onMoveParamUp}
          onMoveParamDown={onMoveParamDown}
          onAddRow={onAddRow}
          onDeleteRow={onDeleteRow}
        />
      ))}
    </TableBody>
  );
};

export default DataTableBody;
