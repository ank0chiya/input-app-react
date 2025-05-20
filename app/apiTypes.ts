interface Param {
    param_code: string;
    disp_name: string;
    sort_order: number;
}


// Attributeの型をtypeプロパティに基づいて判別可能なユニオン型で定義します
interface AttributeBase {
    attribute_code: string;
    disp_name: string;
    unit: string;
}

interface AttributeType1 extends AttributeBase {
    type: 'type1';
    type1_number: number;
    required_flg: boolean;
    params: Param[];
}

interface AttributeType2 extends AttributeBase {
    type: 'type2';
    type2_number: number;
    max: number;
    min: number;
    increment: number;
}

interface AttributeType3 extends AttributeBase {
    type: 'type3';
    data_type: string;
    setting_type: string;
    mgmt_flg: boolean;
    sec_mask: boolean;
    input_format: string;
    width: number;
    max: number;
    min: number;
    required_flg: boolean;
    list_flg: boolean;
    ui_flg: boolean;
    api_cls: string;
    edit_cls: string;
    cont_cls: string;
    sort_order: number;
    init_online: string;
    init_paper: string;
    check: string;
    params: Param[];
}

// 上記のAttribute型を組み合わせたユニオン型
type Attribute = AttributeType1 | AttributeType2 | AttributeType3;

interface Component {
    components_type: string;
    component_name: string;
    deliv_flg: boolean;
    label_cls: string;
    attributes: Attribute[];
}

interface Product {
    prod_id: string;
    components: Component[];
}

// JSONデータの最上位はProductの配列
type ProductData = Product[];
