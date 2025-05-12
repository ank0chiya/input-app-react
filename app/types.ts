export type ChangeStatus = 'new' | 'updated' | 'deleted' | 'synced';

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
    _status?: ChangeStatus; // 変更状態
    params?: ParamItem[]; // GETレスポンスには含まれるが、AttributeInputには含まれない
}

export interface Product {
    productId: number;
    prefix: string;
    type: string;
    cfgType: string;
    attributes: Attribute[];
    sortOrder: number;
    _status?: ChangeStatus; // 変更状態
}

export interface Params {
    productId: number;
    attributeId: number;
    param: ParamType1[] | ParamType2[] | ParamType3[];
}

export interface Param {
    paramId: number;
    sortOrder: number;
    _status?: ChangeStatus; // 変更状態を追跡
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

export interface AttributeInput {
    attribute: string;
    attributeType: string;
    attributeJP: string;
    attributeUnit: string;
    contract: string;
    public: boolean;
    masking: boolean;
    online: boolean;
    sortOrder: number;
}

export interface ParamBaseInput {
    sortOrder: number;
}

export interface ParamType1Input extends ParamBaseInput {
    type: 'type1';
    code: string;
    dispName: string;
}

export interface ParamType2Input extends ParamBaseInput {
    type: 'type2';
    min: number;
    increment: number;
}

export interface ParamType3Input extends ParamBaseInput {
    type: 'type3';
    code: string;
    dispName: string;
}

export type ParamItemInput = ParamType1Input | ParamType2Input | ParamType3Input;

/**
 * OpenAPIの ParamItem スキーマに相当する型。
 * APIレスポンスでAttribute内のparams配列の要素として使用されます。
 * これはParamType1, ParamType2, ParamType3のいずれかの型です。
 */
export type ParamItem = ParamType1 | ParamType2 | ParamType3;

export interface ApiAttribute {
    attributeId: number;
    attribute: string;
    attributeType: string;
    attributeJP: string;
    attributeUnit: string;
    params: ParamItem[]; //APIサーバー側の実装で担保する
    contract: string;
    public: boolean;
    masking: boolean;
    online: boolean;
    sortOrder: number;
}

export interface ApiProduct {
    productId: number;
    prefix: string;
    type: string;
    cfgType: string;
    attributes: ApiAttribute[];
    sortOrder: number;
}

// --- API v1.3.1 Response Schemas (Snake Case, new key names) ---
export interface ApiParamBaseResponse {
    param_id: number;
    sort_order: number;
}
export interface ApiParamType1ItemResponse extends ApiParamBaseResponse {
    type: 'type1';
    code: string;
    disp_name: string;
}
export interface ApiParamType2ItemResponse extends ApiParamBaseResponse {
    type: 'type2';
    min: number;
    increment: number;
}
export interface ApiParamType3ItemResponse extends ApiParamBaseResponse {
    type: 'type3';
    code: string;
    disp_name: string;
}
export type ApiParamItemResponse =
    | ApiParamType1ItemResponse
    | ApiParamType2ItemResponse
    | ApiParamType3ItemResponse;

export interface ApiAttributeResponse {
    attribute_id: number;
    code: string; // formerly 'attribute' in app types
    data_type: string; // formerly 'attributeType'
    disp_name: string; // formerly 'attributeJP'
    unit: string; // formerly 'attributeUnit'
    params: ApiParamItemResponse[]; // Uses API param types
    contract: string;
    public: boolean;
    masking: boolean;
    online: boolean;
    sort_order: number;
}

export interface ApiProductResponse {
    prod_id: number; // formerly 'productId'
    prefix: string;
    prd_type: string; // formerly 'type'
    cfg_type: string; // formerly 'cfgType'
    attributes: ApiAttributeResponse[];
    sort_order: number;
}

// --- API v1.3.1 Input Schemas (Snake Case, new key names) ---
export interface ApiAttributeInputPayload {
    // OpenAPIのAttributeInputに一致
    code: string;
    data_type: string;
    disp_name: string;
    unit: string;
    contract: string;
    public: boolean;
    masking: boolean;
    online: boolean;
    sort_order: number;
    // 'params' は含まれない
}

export interface ApiParamBaseInputPayload {
    // OpenAPIのParamBaseInputに一致
    sort_order: number;
}
export interface ApiParamType1InputPayload extends ApiParamBaseInputPayload {
    type: 'type1';
    code: string;
    disp_name: string;
}
export interface ApiParamType2InputPayload extends ApiParamBaseInputPayload {
    type: 'type2';
    min: number;
    increment: number;
}
export interface ApiParamType3InputPayload extends ApiParamBaseInputPayload {
    type: 'type3';
    code: string;
    disp_name: string;
}
export type ApiParamItemInputPayload =
    | ApiParamType1InputPayload
    | ApiParamType2InputPayload
    | ApiParamType3InputPayload; // OpenAPIのParamItemInputに一致

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
    paramIndex: number;
    isFirstRowOfAttribute: boolean; // この属性グループ内の最初の行かどうか
}

// TableBodyProps のインポートパスなどを確認・調整 (もし必要なら)
export interface TableBodyProps {
    products: Product[];
}
