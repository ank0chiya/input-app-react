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
    param: (Type1Param | Type2Param | Type3Param)[];
}

export interface Param {
    paramId: number;
    sortOrder: number;
}

export interface Type1Param extends Param {
    code: string;
    dispName: string;
    type: 'type1';
}

export interface Type2Param extends Param {
    min: number;
    increment: number;
    type: 'type2';
}

export interface Type3Param extends Param {
    code: string;
    dispName: string;
    type: 'type3';
}

export interface BaseTableTopRow {
    prefix: Product['prefix'];
    type: Product['type'];
    cfgType: Product['cfgType'];
    attributes: "項目値"
    paramHas: Attribute['paramHas'];
    contract: Attribute['contract'];
    public: Attribute['public'];
    masking: Attribute['masking'];
    online: Attribute['online'];
    attributeAction: "actions";
    productAction: "actions";
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
    paramAction: "actions";
}