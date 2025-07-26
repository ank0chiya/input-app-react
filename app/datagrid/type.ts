import type { GridRowId, GridRowModesModel } from '@mui/x-data-grid';
import type { Dispatch, SetStateAction } from 'react';

/**
 * データグリッドの単一行のデータ構造を定義します。
 */
export interface Row {
  id: GridRowId;
  name: string;
  age: number | string;
  job: string;
  group?: string; // グループ名
  isNew?: boolean;
}

/**
 * EditToolbarコンポーネントが受け取るpropsの型を定義します。
 */
export interface EditToolbarProps {
  setRows: Dispatch<SetStateAction<Row[]>>;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
}
