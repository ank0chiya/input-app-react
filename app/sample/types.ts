// types/index.ts
export interface ParamType {
    param: string;
    paramType: 'string' | 'number' | 'boolean';
    paramJP: string;
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
  
  export interface TableRowType {
    prefix: string;
    type: string;
    cfgType: string;
    params: ParamType[];
    selected: boolean;
    public: boolean;
    security: boolean;
    itemType: 'pattern1' | 'pattern2';
    pattern1: Pattern1Type[];
    pattern2: Pattern2Type[];
    online: boolean;
  }
  
  export interface SubColumn {
    id: keyof ParamType;
    label: string;
    type: 'text'; // サブカラムは今のところ text のみ
  }
  
  export interface Column {
    id: keyof TableRowType | string; // params のようなネスト構造も含むため string も許容
    label: string;
    type: 'text' | 'checkbox' | 'nested' | 'actions';
    subColumns?: SubColumn[]; // nested 型の場合にサブカラム定義を持つ
  }