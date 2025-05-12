// lib/apiClient.ts
import {
    Product, // フロントエンド表示用のProduct型 (_status, paramHasを含む)
    Params, // フロントエンド表示用のParams型 (特定のAttributeに紐づくParamのリスト)
    Attribute, // フロントエンド表示用のAttribute型 (_status, paramHasを含む)
    ApiProduct, // APIが返す生のProductの型 (Attribute内にparamsがネスト)
    ParamItem, // APIが返すParamの型 (ParamType1 | ParamType2 | ParamType3 のユニオン)
    ParamType1, // 具体的なParam型1
    ParamType2, // 具体的なParam型2
    ParamType3, // 具体的なParam型3
    AttributeInput, // POST/PUT Attribute時のリクエストボディ型 (paramsを含まない)
    ParamItemInput, // POST/PUT Param時のリクエストボディ型 (paramIdを含まない)
} from '../types'; // 型定義のパスはプロジェクト構成に合わせてください
import * as AppTypes from '../types';
import * as Mappers from '@/app/lib/apiMappers';
// Next.jsのRewrites機能で設定したパス、またはAPIサーバーのベースURL
const API_PROXY_PATH = '/api-proxy';
// 共通レスポンスハンドラ
async function handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorData: any = { message: `API Error: ${response.status} ${response.statusText}` };
        try {
            const errorBody = await response.json(); // response body might contain more details
            errorData = { ...errorData, ...errorBody };
        } catch (e) {
            // Failed to parse JSON body or no JSON body
        }
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `API request failed: ${response.status}`);
    }
    if (response.status === 204) {
        return undefined as T;
    }
    return response.json() as Promise<T>;
}

// データ変換関数: ApiProduct[] から フロントエンド用の Product[] と Params[] へ
// Attribute内のフィールド名が 'params' に変更されたことを反映
function transformApiDataForFrontend(apiData: ApiProduct[]): {
    products: Product[];
    paramsList: Params[];
} {
    const products: Product[] = [];
    const paramsList: Params[] = [];

    apiData.forEach((apiProduct) => {
        const productAttributes: Attribute[] = []; // これはフロントエンド用のAttribute型
        (apiProduct.attributes || []).forEach((apiAttribute) => {
            // フロントエンド用のAttribute型を生成
            const feAttribute: Attribute = {
                attributeId: apiAttribute.attributeId,
                attribute: apiAttribute.attribute,
                attributeType: apiAttribute.attributeType,
                attributeJP: apiAttribute.attributeJP,
                attributeUnit: apiAttribute.attributeUnit,
                paramHas: apiAttribute.params && apiAttribute.params.length > 0, // 'params' を使用
                contract: apiAttribute.contract,
                public: apiAttribute.public,
                masking: apiAttribute.masking,
                online: apiAttribute.online,
                sortOrder: apiAttribute.sortOrder,
                _status: 'synced', // 初期ロード時はsyncedとして扱う
                // params: apiAttribute.params // Product型にはapiAttribute.paramsそのものは含めない
            };
            productAttributes.push(feAttribute);

            // Paramsリストの生成 (apiAttribute.params が存在し、要素があれば)
            if (apiAttribute.params && apiAttribute.params.length > 0) {
                const paramsEntry: Params = {
                    productId: apiProduct.productId,
                    attributeId: apiAttribute.attributeId,
                    // APIレスポンスの params が ParamItem[] (具体的な型の配列) であることを想定
                    // フロントエンドの Params 型の param プロパティも同様の型 (ParamType1[] | ParamType2[] | ParamType3[])
                    // である必要があるため、サーバーからのデータがこの制約を満たす前提でキャスト
                    param: apiAttribute.params as ParamType1[] | ParamType2[] | ParamType3[],
                };
                paramsList.push(paramsEntry);
            }
        });

        const product: Product = {
            productId: apiProduct.productId,
            prefix: apiProduct.prefix,
            type: apiProduct.type,
            cfgType: apiProduct.cfgType,
            attributes: productAttributes, // フロントエンド用Attributeの配列
            sortOrder: apiProduct.sortOrder,
            _status: 'synced', // 初期ロード時はsynced
        };
        products.push(product);
    });

    return { products, paramsList };
}

// --- Product Operations ---
/**
 * 全てのProductデータを取得し、フロントエンド表示用に変換します。
 */
// --- Product/Attribute/Param 取得 (GET) ---
export async function fetchAllProductsForDisplay(): Promise<{
    products: AppTypes.Product[];
    paramsList: AppTypes.Params[];
}> {
    const response = await fetch(`${API_PROXY_PATH}/products`);
    const apiProducts: AppTypes.ApiProductResponse[] =
        await handleApiResponse<AppTypes.ApiProductResponse[]>(response);
    return Mappers.mapApiProductsToAppProductsAndParams(apiProducts); // ★マッピング★
}

/**
 * 指定されたIDのProductデータをAPIから直接取得します (ApiProduct形式)。
 * Note: この関数はApiProductを返します。表示用に変換が必要な場合は別途transformしてください。
 */
export async function fetchProductById(productId: number): Promise<ApiProduct> {
    const response = await fetch(`${API_PROXY_PATH}/products/${productId}`);
    return handleApiResponse<ApiProduct>(response);
}

// --- Attribute Operations ---
/**
 * Productに新しいAttributeを追加します。
 * リクエストボディには AttributeInput を使用 (paramsを含まない)。
 * レスポンスとして、作成された完全な Attribute オブジェクト (paramsは空配列またはAPI仕様による) を期待。
 */
// --- Attribute API Functions ---
export async function addAttributeToProduct(
    productId: number,
    appAttributeInput: AppTypes.AttributeInput,
): Promise<AppTypes.Attribute> {
    const apiPayload = Mappers.mapAppAttributeInputToApiAttributePayload(appAttributeInput); // ★マッピング★
    const response = await fetch(`${API_PROXY_PATH}/products/${productId}/attributes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
    });
    const createdApiAttribute = await handleApiResponse<AppTypes.ApiAttributeResponse>(response);
    return Mappers.mapApiAttributeResponseToAppAttribute(createdApiAttribute); // ★マッピング★
}

/**
 * 既存のAttributeを更新します。
 * リクエストボディには AttributeInput を使用 (paramsを含まない)。
 * レスポンスとして、更新された完全な Attribute オブジェクトを期待。
 */
export async function updateProductAttribute(
    productId: number,
    attributeId: number, // パスパラメータのattributeIdはアプリ内のキャメルケースのまま
    appAttributeInput: AppTypes.AttributeInput,
): Promise<AppTypes.Attribute> {
    const apiPayload = Mappers.mapAppAttributeInputToApiAttributePayload(appAttributeInput); // ★マッピング★
    const response = await fetch(
        `${API_PROXY_PATH}/products/${productId}/attributes/${attributeId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload),
        },
    );
    const updatedApiAttribute = await handleApiResponse<AppTypes.ApiAttributeResponse>(response);
    return Mappers.mapApiAttributeResponseToAppAttribute(updatedApiAttribute); // ★マッピング★
}

/**
 * Attributeを削除します。
 * 成功時は 204 No Content を期待。
 */
export async function deleteProductAttribute(
    productId: number,
    attributeId: number,
): Promise<void> {
    const response = await fetch(
        `${API_PROXY_PATH}/products/${productId}/attributes/${attributeId}`,
        {
            method: 'DELETE',
        },
    );
    await handleApiResponse<void>(response); // レスポンスボディがない場合はマッピング不要
}

// --- Parameter Operations ---
/**
 * Attributeに新しいParamを追加します。
 * リクエストボディには ParamItemInput を使用。
 * レスポンスとして、作成された完全な ParamItem オブジェクトを期待。
 */
export async function addParamToAttribute(
    productId: number,
    attributeId: number,
    appParamInput: AppTypes.ParamItemInput,
): Promise<AppTypes.ParamItem> {
    const apiPayload = Mappers.mapAppParamItemInputToApiParamItemPayload(appParamInput); // ★マッピング★
    const response = await fetch(
        `${API_PROXY_PATH}/products/${productId}/attributes/${attributeId}/params`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload),
        },
    );
    const createdApiParam = await handleApiResponse<AppTypes.ApiParamItemResponse>(response);
    return Mappers.mapApiParamItemResponseToAppParamItem(createdApiParam); // ★マッピング★
}

/**
 * 既存のParamを更新します。
 * リクエストボディには ParamItemInput を使用。
 * レスポンスとして、更新された完全な ParamItem オブジェクトを期待。
 */
export async function updateAttributeParam(
    productId: number,
    attributeId: number,
    paramId: number, // パスパラメータのparamIdはアプリ内のキャメルケースのまま
    appParamInput: AppTypes.ParamItemInput,
): Promise<AppTypes.ParamItem> {
    const apiPayload = Mappers.mapAppParamItemInputToApiParamItemPayload(appParamInput); // ★マッピング★
    const response = await fetch(
        `${API_PROXY_PATH}/products/${productId}/attributes/${attributeId}/params/${paramId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload),
        },
    );
    const updatedApiParam = await handleApiResponse<AppTypes.ApiParamItemResponse>(response);
    return Mappers.mapApiParamItemResponseToAppParamItem(updatedApiParam); // ★マッピング★
}

/**
 * Paramを削除します。
 * 成功時は 204 No Content を期待。
 */
export async function deleteAttributeParam(
    productId: number,
    attributeId: number,
    paramId: number,
): Promise<void> {
    const response = await fetch(
        `${API_PROXY_PATH}/products/${productId}/attributes/${attributeId}/params/${paramId}`,
        {
            method: 'DELETE',
        },
    );
    await handleApiResponse<void>(response);
}

// --- Utility API Functions ---
export async function refreshMockData(): Promise<{ message: string }> {
    const response = await fetch(`${API_PROXY_PATH}/refresh`, { method: 'POST' });
    // このレスポンスはシンプルなため、直接型を指定するか、必要ならマッパーを用意
    return handleApiResponse<{ message: string }>(response);
}
