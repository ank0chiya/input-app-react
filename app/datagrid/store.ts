import { create } from 'zustand';
import { temporal } from 'zundo';
import type { Row, EditToolbarProps } from './type';
import type { GridRowModesModel } from '@mui/x-data-grid';

// Zustandストアの状態の型を定義
interface StoreState {
  rows: Row[];
  rowModesModel: GridRowModesModel;
  allGroups: string[];
  selectedGroups: string[];
  setRows: (rows: Row[] | ((prev: Row[]) => Row[])) => void;
  setRowModesModel: (model: GridRowModesModel | ((prev: GridRowModesModel) => GridRowModesModel)) => void;
  setAllGroups: (groups: string[] | ((prev: string[]) => string[])) => void;
  setSelectedGroups: (groups: string[] | ((prev: string[]) => string[])) => void;
}

// Zustandストアを作成
// zundoミドルウェアを適用し、rowsの状態のみを追跡
export const useStore = create<StoreState>()(
  temporal(
    (set) => ({
      rows: [],
      rowModesModel: {},
      allGroups: [],
      selectedGroups: [],
      setRows: (updater) => set((state) => ({ rows: typeof updater === 'function' ? updater(state.rows) : updater })),
      setRowModesModel: (updater) => set((state) => ({ rowModesModel: typeof updater === 'function' ? updater(state.rowModesModel) : updater })),
      setAllGroups: (updater) => set((state) => ({ allGroups: typeof updater === 'function' ? updater(state.allGroups) : updater })),
      setSelectedGroups: (updater) => set((state) => ({ selectedGroups: typeof updater === 'function' ? updater(state.selectedGroups) : updater })),
    }),
    {
      partialize: (state) => ({ rows: state.rows }), // rowsの状態のみ履歴管理の対象にする
    }
  )
);
