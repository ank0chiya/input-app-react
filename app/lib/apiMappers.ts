// lib/apiMappers.ts
import * as ApiSchemaTypes from '@/app/types'; // API専用型
import * as AppTypes from '../types'; // 既存のアプリ内型

// --- APIレスポンス型 -> アプリ内型 ---

export function mapApiParamItemResponseToAppParamItem(
    apiParam: ApiSchemaTypes.ApiParamItemResponse,
): AppTypes.ParamItem {
    const baseAppParam: AppTypes.Param = {
        // アプリ内 Param 型
        paramId: apiParam.param_id, // キー名マッピング
        sortOrder: apiParam.sort_order, // キー名マッピング
        _status: 'synced',
    };

    if (apiParam.type === 'type1') {
        return {
            ...baseAppParam,
            type: 'type1',
            code: apiParam.code,
            dispName: apiParam.disp_name,
        }; // キー名マッピング
    } else if (apiParam.type === 'type2') {
        return { ...baseAppParam, type: 'type2', min: apiParam.min, increment: apiParam.increment };
    } else if (apiParam.type === 'type3') {
        return {
            ...baseAppParam,
            type: 'type3',
            code: apiParam.code,
            dispName: apiParam.disp_name,
        }; // キー名マッピング
    }
    throw new Error(`Unknown API param type: ${(apiParam as any).type}`);
}

export function mapApiAttributeResponseToAppAttribute(
    apiAttr: ApiSchemaTypes.ApiAttributeResponse,
): AppTypes.Attribute {
    return {
        attributeId: apiAttr.attribute_id, // キー名マッピング
        attribute: apiAttr.code, // ★ キー名マッピング: code -> attribute ★
        attributeType: apiAttr.data_type, // キー名マッピング
        attributeJP: apiAttr.disp_name, // キー名マッピング
        attributeUnit: apiAttr.unit, // キー名マッピング
        contract: apiAttr.contract,
        public: apiAttr.public,
        masking: apiAttr.masking,
        online: apiAttr.online,
        sortOrder: apiAttr.sort_order, // キー名マッピング
        paramHas: apiAttr.params != null && apiAttr.params.length > 0,
        params: (apiAttr.params || []).map(mapApiParamItemResponseToAppParamItem),
        _status: 'synced',
    };
}

export function mapApiProductsToAppProductsAndParams(
    apiProducts: ApiSchemaTypes.ApiProductResponse[],
): { products: AppTypes.Product[]; paramsList: AppTypes.Params[] } {
    const products: AppTypes.Product[] = [];
    const paramsList: AppTypes.Params[] = [];

    apiProducts.forEach((apiProduct) => {
        const appAttributes = (apiProduct.attributes || []).map(
            mapApiAttributeResponseToAppAttribute,
        );
        const appProduct: AppTypes.Product = {
            productId: apiProduct.prod_id, // キー名マッピング
            prefix: apiProduct.prefix,
            type: apiProduct.prd_type, // キー名マッピング
            cfgType: apiProduct.cfg_type, // キー名マッピング
            attributes: appAttributes,
            sortOrder: apiProduct.sort_order, // キー名マッピング
            _status: 'synced',
        };
        products.push(appProduct);

        appAttributes.forEach((appAttr) => {
            if (appAttr.paramHas && appAttr.params && appAttr.params.length > 0) {
                paramsList.push({
                    productId: appProduct.productId, // アプリ内 Product のキー名
                    attributeId: appAttr.attributeId, // アプリ内 Attribute のキー名
                    param: appAttr.params as
                        | AppTypes.ParamType1[]
                        | AppTypes.ParamType2[]
                        | AppTypes.ParamType3[], // 型キャストに注意
                });
            }
        });
    });

    return { products, paramsList };
}

// --- アプリ内Input型 -> APIリクエストPayload型 ---

export function mapAppAttributeInputToApiAttributePayload(
    appAttrInput: AppTypes.AttributeInput,
): ApiSchemaTypes.ApiAttributeInputPayload {
    return {
        code: appAttrInput.attribute, // ★ キー名マッピング: attribute -> code ★
        data_type: appAttrInput.attributeType, // キー名マッピング
        disp_name: appAttrInput.attributeJP, // キー名マッピング
        unit: appAttrInput.attributeUnit, // キー名マッピング
        contract: appAttrInput.contract,
        public: appAttrInput.public,
        masking: appAttrInput.masking,
        online: appAttrInput.online,
        sort_order: appAttrInput.sortOrder, // キー名マッピング
    };
}

export function mapAppParamItemInputToApiParamItemPayload(
    appParamInput: AppTypes.ParamItemInput,
): ApiSchemaTypes.ApiParamItemInputPayload {
    const baseApiInput: ApiSchemaTypes.ApiParamBaseInputPayload = {
        sort_order: appParamInput.sortOrder, // キー名マッピング
    };

    if (appParamInput.type === 'type1') {
        return {
            ...baseApiInput,
            type: 'type1',
            code: appParamInput.code,
            disp_name: appParamInput.dispName,
        }; // キー名マッピング
    } else if (appParamInput.type === 'type2') {
        return {
            ...baseApiInput,
            type: 'type2',
            min: appParamInput.min,
            increment: appParamInput.increment,
        };
    } else if (appParamInput.type === 'type3') {
        return {
            ...baseApiInput,
            type: 'type3',
            code: appParamInput.code,
            disp_name: appParamInput.dispName,
        }; // キー名マッピング
    }
    throw new Error(`Unknown App param input type: ${(appParamInput as any).type}`);
}
