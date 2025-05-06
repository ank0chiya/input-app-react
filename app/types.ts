export interface Attribute {
    attributeId: number;
    attribute: string;
    attributeType: string;
    attributeJP: string;
    attributeUnit: string;
    paramHas: boolean;
    contract: string;
    public: boolean;
    masking: boolean;
    online: boolean;
    sortOrder: number;
}

export interface Product {
    productId: number;
    prefix: string;
    type: string;
    cfgType: string;
    attributes: Attribute[];
    sortOrder: number;
}

export interface Params {
    productId: number;
    attributeId: number;
    param: ParamType1[] | ParamType2[] | ParamType3[];
}

export interface Param {
    paramId: number;
    sortOrder: number;
}

export interface ParamType1 extends Param {
    code: string;
    dispName: string;
    type: 'type1';
}

export interface ParamType2 extends Param {
    min: number;
    increment: number;
    type: 'type2';
}

export interface ParamType3 extends Param {
    code: string;
    dispName: string;
    type: 'type3';
}

export type ParamDetail = ParamType1 | ParamType2 | ParamType3;

export interface BaseTableTopRow {
    prefix: Product['prefix'];
    type: Product['type'];
    cfgType: Product['cfgType'];
    attributes: '項目値';
    paramHas: Attribute['paramHas'];
    contract: Attribute['contract'];
    public: Attribute['public'];
    masking: Attribute['masking'];
    online: Attribute['online'];
    attributeAction: 'actions';
    productAction: 'actions';
}

export interface BaseTableButtomRow {
    attribute: Attribute['attribute'];
    attributeType: Attribute['attributeType'];
    attributeJP: Attribute['attributeJP'];
    attributeUnit: Attribute['attributeUnit'];
}

export interface DetailTableRow {
    prefix: Product['prefix'];
    type: Product['type'];
    cfgType: Product['cfgType'];
    attribute: Attribute['attribute'];
    attributeJP: Attribute['attributeJP'];
    contract: Attribute['contract'];
    params: Params[];
    paramAction: 'actions';
}

// EditableTableCell用のProps型
export interface EditableCellProps {
    value: string | number | boolean | undefined;
    onChange: (newValue: string | number | boolean) => void;
    type?: 'string' | 'number' | 'boolean';
    editable?: boolean;
    placeholder?: string;
}

// BodyRow コンポーネント用の Props 型定義を追加
export interface BodyRowProps {
    product: Product;
    attribute: Attribute;
    paramDetail: ParamDetail | undefined; // この行に対応するパラメータ (存在しない場合あり)
    rowSpanCount: number; // この属性グループが占める行数
    isFirstRowOfAttribute: boolean; // この属性グループ内の最初の行かどうか
}

// TableBodyProps のインポートパスなどを確認・調整 (もし必要なら)
export interface TableBodyProps {
    products: Product[];
}
