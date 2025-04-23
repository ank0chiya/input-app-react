// types/index.ts
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

export interface ParamType {
  param: string;
  paramType: 'string' | 'number' | 'boolean';
  paramJP: string;
  selected: boolean; // パラメータ選択用
  public: boolean;   // パラメータごとの公開フラグ
  security: boolean; // パラメータごとのセキュリティフラグ
  itemType: 'pattern1' | 'pattern2'; // パラメータごとのパターンタイプ
}

export interface Pattern1Type {
  pattern1Value: string;
  pattern1JP: string;
  pattern1Desc: string;
}

export interface Pattern2Type {
  pattern2Min: number;
  pattern2Max: number;
  pattern2Increment: number;
}

export interface PatternDataType {
  cfgType: string;
  param: string;
  itemType: 'pattern1' | 'pattern2';
  data: Pattern1Type[] | Pattern2Type[];
}

export interface TableRowType {
  prefix: string;
  type: string;
  cfgType: string;
  params: ParamType[]; // params 配列は必須
  // selected: boolean; // ← 行選択用は削除 (パラメータ選択に移行)
  // public: boolean;   // ← params に移動したため削除
  // security: boolean; // ← params に移動したため削除
  pattern1?: Pattern1Type[]; // オプショナルに変更
  pattern2?: Pattern2Type[]; // オプショナルに変更
  online: boolean;
}

export interface SubColumn {
  id: keyof ParamType | 'delete'; // 'delete'を追加
  label: string;
  type: 'text' | 'checkbox';
}

export interface Column {
  id: keyof TableRowType | string; // params のようなネスト構造も含むため string も許容
  label: string;
  type: 'text' | 'checkbox' | 'nested' | 'actions' | 'dropdown';
  subColumns?: SubColumn[]; // nested 型の場合にサブカラム定義を持つ
}


// グループ化されたヘッダー部分の型 ('パラメータ一覧' など)
export interface TransformedGroupedHeader extends Omit<Column, 'subColumns' | 'type'> {
  type: 'nested'; // または 'grouped' など区別する型
  subColumns: SubColumn[]; // フィルタリング後の 'param' 系 SubColumn のみ
  isGroupedHeader: true;   // 判定用フラグ
}


// シンプルなヘッダー部分の型 (rowSpan=2 になるもの)
// (元々のシンプルなColumnと、paramsから分離されたSubColumnの両方を表現)
export interface TransformedSimpleHeader extends Omit<Column, 'subColumns' | 'type'> {
  type: Exclude<Column['type'], 'nested'> | SubColumn['type']; // 元の型またはSubColumnの型
  isGroupedHeader: false;  // 判定用フラグ
  subColumns?: never;      // この型はサブカラムを持たない
}

// 変換後の設定データのカラム型 (Union Type)
export type TransformedHeaderConfig = TransformedGroupedHeader | TransformedSimpleHeader;

// MUIのTableCellで使用する可能性のある型 (再掲)
export interface TableCellProps {
  key: string;
  rowSpan?: number;
  colSpan?: number;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
}
