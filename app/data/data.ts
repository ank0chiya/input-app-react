import { Product, Attribute, Params, ApiProduct } from '../types';

export const sample_data: ApiProduct[] = [
    {
        productId: 0,
        prefix: 'abc',
        type: 'abc00',
        cfgType: 'abcdef',
        attributes: [
            {
                attributeId: 0,
                attribute: 'attr1',
                attributeType: 'string',
                attributeJP: '属性1',
                attributeUnit: '',
                param: [
                    {
                        paramId: 0,
                        code: 'code1',
                        dispName: 'コード1',
                        sortOrder: 0,
                        type: 'type1',
                    },
                    {
                        paramId: 1,
                        code: 'code2',
                        dispName: 'コード2',
                        sortOrder: 1,
                        type: 'type1',
                    },
                ],
                contract: 'type1',
                public: true,
                masking: false,
                online: true,
                sortOrder: 0,
            },
            {
                attributeId: 1,
                attribute: 'attr2',
                attributeType: 'string',
                attributeJP: '属性2',
                attributeUnit: '',
                param: [
                    {
                        paramId: 0,
                        min: 1,
                        increment: 2,
                        sortOrder: 0,
                        type: 'type2',
                    },
                ],
                contract: 'type2',
                public: false,
                masking: true,
                online: false,
                sortOrder: 1,
            },
            {
                attributeId: 2,
                attribute: 'attr2',
                attributeType: 'string',
                attributeJP: '属性2',
                attributeUnit: '',
                param: [
                    {
                        paramId: 1,
                        code: 'code',
                        dispName: 'コード',
                        sortOrder: 0,
                        type: 'type3',
                    },
                ],
                contract: '',
                public: false,
                masking: true,
                online: false,
                sortOrder: 1,
            },
        ],
        sortOrder: 0,
    },
    {
        productId: 1,
        prefix: 'def',
        type: 'def00',
        cfgType: 'abcdef',
        attributes: [
            {
                attributeId: 0,
                attribute: 'attr1',
                attributeType: 'string',
                attributeJP: '属性1',
                attributeUnit: '',
                param: [
                    {
                        paramId: 0,
                        code: 'code1',
                        dispName: 'コード1',
                        sortOrder: 0,
                        type: 'type1',
                    },
                    {
                        paramId: 1,
                        code: 'code2',
                        dispName: 'コード2',
                        sortOrder: 1,
                        type: 'type1',
                    },
                ],
                contract: 'type1',
                public: true,
                masking: false,
                online: true,
                sortOrder: 0,
            },
            {
                attributeId: 1,
                attribute: 'attr2',
                attributeType: 'string',
                attributeJP: '属性2',
                attributeUnit: '',
                param: [],
                contract: '',
                public: false,
                masking: true,
                online: false,
                sortOrder: 1,
            },
        ],
        sortOrder: 1,
    },
];

// データ変換関数
function transformData(apiData: ApiProduct[]): { products: Product[]; paramsList: Params[] } {
    const products: Product[] = [];
    const paramsList: Params[] = [];

    apiData.forEach((apiProduct) => {
        const productAttributes: Attribute[] = [];

        apiProduct.attributes.forEach((apiAttribute) => {
            // Product用のAttributeオブジェクトを作成
            const attribute: Attribute = {
                attributeId: apiAttribute.attributeId,
                attribute: apiAttribute.attribute,
                attributeType: apiAttribute.attributeType,
                attributeJP: apiAttribute.attributeJP,
                attributeUnit: apiAttribute.attributeUnit,
                paramHas: apiAttribute.param.length > 0, // param配列が空かどうかでparamHasを決定
                contract: apiAttribute.contract,
                public: apiAttribute.public,
                masking: apiAttribute.masking,
                online: apiAttribute.online,
                sortOrder: apiAttribute.sortOrder,
            };
            productAttributes.push(attribute);

            // Paramsオブジェクトを作成
            if (apiAttribute.param.length > 0) {
                const params: Params = {
                    productId: apiProduct.productId,
                    attributeId: apiAttribute.attributeId,
                    param: apiAttribute.param,
                };
                paramsList.push(params);
            }
        });

        // Productオブジェクトを作成
        const product: Product = {
            productId: apiProduct.productId,
            prefix: apiProduct.prefix,
            type: apiProduct.type,
            cfgType: apiProduct.cfgType,
            attributes: productAttributes,
            sortOrder: apiProduct.sortOrder,
        };
        products.push(product);
    });

    return { products, paramsList };
}

// 変換を実行
export const { products: sample_products, paramsList: sample_params } = transformData(sample_data);
