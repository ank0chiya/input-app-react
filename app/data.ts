
// データの型定義
export interface SubItem {
  subId: string;
  subName: string;
  subValue: string;
}

export interface DetailSubItem {
  detailSubId: string;
  detailSubDesc: string;
  detailSubValue: string;
}

// export interface TableRow {
//   id: string;
//   name: string;
//   category: string;
//   selected: boolean;
//   subItems: SubItem[];
//   detail1: string;
//   detail2: string;
//   detailItems: DetailSubItem[];
// }

export interface Column {
  id: string;
  label: string;
  type: string;
  editable?: boolean;
  subColumns?: Column[];
}

// 1つ目のタブのテーブルカラム定義（新）
export const firstTabTableColumns = [
  { id: 'prefix', label: 'ID', type: 'text' },
  { id: 'type', label: 'タイプ', type: 'text' },
  { id: 'cfgType', label: '設定タイプ', type: 'text' },
  { id: 'params', label: 'パラメータ一覧', type: 'nested',
    subColumns: [
      { id: 'param', label: 'パラメータ', type: 'text' },
      { id: 'paramType', label: 'データ型', type: 'text' },
      { id: 'paramJP', label: '日本語名', type: 'text' }
    ]
  },
  { id: 'selected', label: '選択', type: 'checkbox' },
  { id: 'public', label: '公開', type: 'checkbox' },
  { id: 'security', label: 'セキュリティ', type: 'checkbox' },
];

// 2つ目のタブのテーブルカラム定義（新）
export const secondTabTableColumns = [
  { id: 'prefix', label: 'ID', type: 'text' },
  { id: 'type', label: 'タイプ', type: 'text' },
  { id: 'cfgType', label: '設定タイプ', type: 'text' },
  { id: 'itemType', label: 'アイテムタイプ', type: 'dropdown' }, // ドロップダウンで2パターンの選択肢を持つ（pattern1/pattern2）
  { id: 'pattern1', label: 'パターン1', type: 'nested',
    subColumns: [
      { id: 'pattern1Value', label: 'パターン1 値', type: 'text' },
      { id: 'pattern1JP', label: 'パターン1 説明', type: 'text' },
      { id: 'pattern1Desc', label: 'パターン1 備考', type: 'text' }
    ]
  },
  { id: 'pattern2', label: 'パターン2', type: 'nested',
    subColumns: [
      { id: 'pattern2Min', label: 'パターン2 最小値', type: 'int' },
      { id: 'pattern2Max', label: 'パターン2 最大値', type: 'int' },
      { id: 'pattern2Increment', label: 'パターン2 間隔', type: 'int' }
    ]
  },
  { id: 'online', label: 'オンライン', type: 'checkbox' },
];

// 1つ目のタブのパラメータ型（新）
export interface ParamItem {
  param: string;
  paramType: string;
  paramJP: string;
}

// 2つ目のタブのパターン1型（新）
export interface Pattern1Item {
  pattern1Value: string;
  pattern1JP: string;
  pattern1Desc: string;
}

// 2つ目のタブのパターン2型（新）
export interface Pattern2Item {
  pattern2Min: number;
  pattern2Max: number;
  pattern2Increment: number;
}

// メインデータ型（新）
export interface TableRowType {
  prefix: string;
  type: string;
  cfgType: string;
  params: ParamItem[];
  selected: boolean;
  public: boolean;
  security: boolean;
  itemType: 'pattern1' | 'pattern2';
  pattern1: Pattern1Item[];
  pattern2: Pattern2Item[];
  online: boolean;
}

// 初期データ（新）
export const initialData: TableRowType[] = [
  {
    prefix: 'CFG001',
    type: 'タイプA',
    cfgType: '設定1',
    params: [
      { param: 'param1', paramType: 'string', paramJP: 'パラメータ1' },
      { param: 'param2', paramType: 'number', paramJP: 'パラメータ2' }
    ],
    selected: false,
    public: true,
    security: false,
    itemType: 'pattern1',
    pattern1: [
      { pattern1Value: '値A', pattern1JP: '説明A', pattern1Desc: '備考A' }
    ],
    pattern2: [], // pattern1が選択されているため、pattern2は空配列
    online: true
  },
  {
    prefix: 'CFG002',
    type: 'タイプB',
    cfgType: '設定2',
    params: [
      { param: 'param3', paramType: 'boolean', paramJP: 'パラメータ3' }
    ],
    selected: false,
    public: false,
    security: true,
    itemType: 'pattern2',
    pattern1: [], // pattern2が選択されているため、pattern1は空配列
    pattern2: [
      { pattern2Min: 0, pattern2Max: 100, pattern2Increment: 5 }
    ],
    online: false
  }
];
