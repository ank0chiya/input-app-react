'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';

import { Box, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import {
    Product,
    Params,
    Attribute,
    ApiProduct,
    ParamType1,
    ParamType2,
    ParamType3,
    ChangeStatus,
    AttributeInput,
    ParamDetail,
    ParamItemInput,
} from '../types';
// import { sample_products, sample_params } from '../data/data'; // サンプルデータをインポート
import {
    fetchAllProductsForDisplay,
    refreshMockData,
    // Attribute API
    addAttributeToProduct,
    updateProductAttribute,
    deleteProductAttribute,
    // ParamItem API
    addParamToAttribute,
    updateAttributeParam,
    deleteAttributeParam,
    // Product API (今回はログのみ)
    // createProduct, updateProduct, deleteProduct,
} from '@/app/lib/apiClient'; // APIクライアント

import BaseTable from './BaseTable';
import DetailTable from './DetailTable';
import ButtonManager from './ButtonManager';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

// タブのアクセシビリティ用 Props を生成するヘルパー関数
function a11yProps(index: number) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`,
    };
}

// クライアントサイドでの仮ID生成用 (Context内にあったものをここに移動させるか検討)
// これらはContextファイルスコープではなく、TabbedDataManagerのスコープで管理する方がリセットしやすい
let globalTempProductIdCounter = -1;
let globalTempAttributeIdCounter = -1;
let globalTempParamIdCounter = -1;

export default function TabbedDataManager() {
    const [baseTableData, setProductData] = useState<Product[]>([]); // 初期値を空配列に
    const [detailTableData, setParamsData] = useState<Params[]>([]); // 初期値を空配列に
    const [loading, setLoading] = useState<boolean>(true); // ローディング状態を追加
    const [error, setError] = useState<string | null>(null); // エラー状態を追加
    const [saving, setSaving] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState(0); // タブの状態を管理

    // タブが変更されたときのハンドラ
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const loadInitialData = useCallback(
        async (showSpinner = true) => {
            if (showSpinner) setLoading(true);
            setError(null);
            try {
                const { products, paramsList } = await fetchAllProductsForDisplay();
                const initialTrackedProducts: Product[] = products.map((p) => ({
                    ...p,
                    _status: 'synced' as ChangeStatus,
                    attributes: (p.attributes || []).map((a) => ({
                        ...a,
                        _status: 'synced' as ChangeStatus,
                        // APIからのAttribute.paramsをフロントエンドのParamItemにマップし_statusを付与
                        // Attribute型自体にparamsは含めない方針だったが、APIレスポンスにはあるので、
                        // ここでは一旦そのままにし、BaseTableContext内でparamHasの計算に使う
                        params: (a.params || []).map((param) => ({
                            ...param,
                            _status: 'synced' as ChangeStatus,
                        })),
                    })),
                }));
                setProductData(initialTrackedProducts);

                const initialTrackedParamsList: Params[] = paramsList.map((pl) => ({
                    ...pl,
                    param: (pl.param || []).map((p) => ({
                        ...p,
                        _status: 'synced' as ChangeStatus,
                    })) as ParamType1[] | ParamType2[] | ParamType3[],
                }));
                setParamsData(initialTrackedParamsList);

                globalTempProductIdCounter = -1;
                globalTempAttributeIdCounter = -1;
                globalTempParamIdCounter = -1;
            } catch (e: any) {
                console.error('Failed to fetch data via apiClient:', e);
                setError(e.message || 'データの取得中にエラーが発生しました。');
            } finally {
                if (showSpinner) setLoading(false);
            }
        },
        [setProductData, setParamsData],
    ); // set関数は依存配列に含めても安定している

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // BaseTableContext の onAddParamsDataRow に渡すためのコールバック
    // Attribute の paramHas が true になった時、または false になった時に detailTableData を調整する
    const handleAddOrRemoveParamsEntry = useCallback(
        (product: Product, attributeWithUpdatedParamHas: Attribute) => {
            const productId = product.productId;
            // attributeIdは更新後のものを使う。仮IDの場合もあるので注意。
            const attributeId = attributeWithUpdatedParamHas.attributeId;
            const paramHas = attributeWithUpdatedParamHas.paramHas;

            if (paramHas) {
                setParamsData((prevParamsList) => {
                    const alreadyExists = prevParamsList.some(
                        (p) => p.productId === productId && p.attributeId === attributeId,
                    );
                    if (alreadyExists) return prevParamsList;
                    const newParamEntry: Params = {
                        productId: productId,
                        attributeId: attributeId, // ここはAttributeのID (仮IDの場合もある)
                        param: [],
                    };
                    return [...prevParamsList, newParamEntry];
                });
            } else {
                setParamsData((prevParamsList) =>
                    prevParamsList.filter(
                        (p) => !(p.productId === productId && p.attributeId === attributeId),
                    ),
                );
            }
        },
        [setParamsData],
    );

    const handleDataRefresh = useCallback(async () => {
        if (isOverallDirty) {
            if (
                !window.confirm(
                    '未保存の変更がありますが、リフレッシュしてもよろしいですか？変更は失われます。',
                )
            ) {
                return;
            }
        }
        setSaving(true);
        try {
            await refreshMockData(); // APIでサーバー側データをリセット
            await loadInitialData(false); // フロントエンドも再ロード
            alert('データがリフレッシュされました。');
        } catch (e: any) {
            setError(e.message || 'データのリフレッシュ中にエラーが発生しました。');
        } finally {
            setSaving(false);
        }
    }, [loadInitialData /* isOverallDirty を依存配列に追加 */]); // isOverallDirtyの計算をここでも行うか、propsで渡す

    // 全体のisDirty状態
    const isOverallDirty = useMemo(() => {
        const isBaseDirty = baseTableData.some(
            (p) =>
                (p._status && p._status !== 'synced') ||
                (p.attributes || []).some((a) => a._status && a._status !== 'synced'),
        );
        const isDetailDirty = detailTableData.some((pl) =>
            (pl.param || []).some((p) => p._status && p._status !== 'synced'),
        );
        return isBaseDirty || isDetailDirty;
    }, [baseTableData, detailTableData]);

    // handleDataRefresh の依存配列に isOverallDirty を追加
    useEffect(() => {
        // isOverallDirty が変更されたときに handleDataRefresh を再生成する必要はないが、
        // handleDataRefresh の中で isOverallDirty を参照しているため、
        // 正確には isOverallDirty の値を handleDataRefresh の中で使うなら依存配列に入れるべき。
        // ただし、ここでは window.confirm の中で使っているだけなので、
        // 最新の isOverallDirty を参照するために、useCallbackの外部で計算し、
        // useCallbackの依存配列からは外すか、useCallbackを使わないという選択肢もある。
        // 今回は上記handleDataRefreshの実装で依存配列から外しておく。
    }, [isOverallDirty]);

    // 「登録」ボタンが押されたときのグローバルな保存処理
    const handleGlobalSaveChanges = useCallback(async () => {
        setLoading(true); // 保存処理中のローディング表示
        setError(null);
        let overallSuccess = true;
        // 仮IDとサーバーIDのマッピングを保持（ParamsのattributeId更新用）
        const attributeIdMap = new Map<number, number>();
        // const paramIdMap = new Map<number, number>(); // 仮ParamID -> サーバーParamID (親子関係も考慮が必要)

        // Product と Attribute の変更を処理
        let processedProducts: Product[] = JSON.parse(JSON.stringify(baseTableData)); // 作業用コピー

        // --- Step 1: Productの処理 (今回はログのみ、実際はAPI呼び出し) ---
        const finalProductsAfterProductOps: Product[] = [];
        for (let i = 0; i < processedProducts.length; i++) {
            const product = processedProducts[i];
            let currentProductData = { ...product }; // APIレスポンスで更新される可能性

            if (product._status === 'new' && product.productId < 0) {
                console.log(`TODO: API POST Product (client ID: ${product.productId})`);
                // const { _status, attributes, productId: tempPId, ...productInputData } = product;
                // try {
                //   const createdProduct = await apiClient.createProduct(productInputData as any);
                //   currentProductData = { ...createdProduct, attributes: attributes || [], _status: 'synced' };
                //   attributeIdMap.set(tempPId, createdProduct.productId); // Product IDのマッピング
                // } catch (e) { overallSuccess = false; console.error(`P Create Err: ${e}`);}
                currentProductData._status = 'synced'; // 仮
            } else if (product._status === 'updated' && product.productId > 0) {
                console.log(`TODO: API PUT Product ${product.productId}`);
                currentProductData._status = 'synced'; // 仮
            } else if (product._status === 'deleted' && product.productId > 0) {
                console.log(`TODO: API DELETE Product ${product.productId}`);
                // このProductは finalProductsAfterProductOps には追加しない
                continue;
            }
            finalProductsAfterProductOps.push(currentProductData);
        }
        processedProducts = finalProductsAfterProductOps;

        // --- Step 2: Attributeの処理 ---
        for (const product of processedProducts) {
            if (product.productId < 0) {
                // 親Productが未保存(仮IDのまま)ならAttributeも保存できない
                console.warn(
                    `Attributes for new Product (client ID: ${product.productId}) will not be saved until Product is saved.`,
                );
                continue;
            }

            const finalAttributesForThisProduct: Attribute[] = [];
            const attributesToProcess = [...(product.attributes || [])];
            for (const attr of attributesToProcess) {
                const {
                    _status,
                    attributeId: clientAttributeId,
                    params: localParams,
                    paramHas: localParamHas,
                    sortOrder,
                    ...attrDataForApi
                } = attr;
                const attributeApiInput: AttributeInput = {
                    ...(attrDataForApi as Omit<
                        Attribute,
                        | 'attributeId'
                        | 'params'
                        | 'paramHas'
                        | '_status'
                        | 'sortOrder'
                        | '_original'
                    >),
                    sortOrder,
                };
                try {
                    if (_status === 'new') {
                        const created = await addAttributeToProduct(
                            product.productId,
                            attributeApiInput,
                        );
                        attributeIdMap.set(clientAttributeId, created.attributeId); // マップに保存
                        finalAttributesForThisProduct.push({
                            ...created,
                            params: created.params || [],
                            paramHas: !!(created.params && created.params.length > 0),
                            _status: 'synced',
                        });
                    } else if (_status === 'updated') {
                        const updated = await updateProductAttribute(
                            product.productId,
                            attr.attributeId,
                            attributeApiInput,
                        );
                        finalAttributesForThisProduct.push({
                            ...updated,
                            params: localParams,
                            paramHas: localParamHas,
                            _status: 'synced',
                        });
                    } else if (_status === 'deleted' && attr.attributeId > 0) {
                        await deleteProductAttribute(product.productId, attr.attributeId);
                        // 削除成功時はfinalAttributesForThisProductに追加しない
                    } else if (_status !== 'deleted') {
                        // synced or no status
                        finalAttributesForThisProduct.push(attr);
                    }
                } catch (e: any) {
                    overallSuccess = false;
                    finalAttributesForThisProduct.push(attr); // エラー時は元のAttributeを戻す
                    console.error(
                        `Attribute (Client ID: ${clientAttributeId}, DB ID: ${attr.attributeId}) for Product ${product.productId} save/delete failed: ${e.message}`,
                    );
                }
            }
            product.attributes = finalAttributesForThisProduct
                .filter((a) => a._status !== 'deleted')
                .map((a, i) => ({ ...a, sortOrder: i, _status: 'synced' }));
        }
        // setProductData([...processedProducts]); // Attribute処理後のProductリストで状態更新

        // --- Step 3: DetailTableData (Params) の AttributeId を仮IDからサーバーIDに更新 ---
        let workingDetailTableData = detailTableData; // 現在のdetailTableDataをベースにする
        if (attributeIdMap.size > 0) {
            workingDetailTableData = detailTableData.map((paramsEntry) => {
                if (attributeIdMap.has(paramsEntry.attributeId)) {
                    // attributeIdが仮IDだったら
                    return {
                        ...paramsEntry,
                        attributeId: attributeIdMap.get(paramsEntry.attributeId)!,
                    };
                }
                return paramsEntry;
            });
            // setParamsData(workingDetailTableData); // 更新されたattributeIdを持つdetailTableDataを一旦セット
        }

        // --- Step 4: Params の処理 ---
        const finalParamsDataList: Params[] = [];
        for (const paramsEntry of workingDetailTableData) {
            // 更新されたattributeIdを持つリストで処理
            const parentProduct = processedProducts.find(
                (p) => p.productId === paramsEntry.productId,
            );
            const parentAttribute = parentProduct?.attributes.find(
                (a) => a.attributeId === paramsEntry.attributeId,
            );

            if (!parentAttribute || parentAttribute._status === 'deleted') {
                // 親Attributeが存在しないか削除マークならParamsも処理しない
                continue;
            }

            const processedParamItems: ParamDetail[] = [];
            const paramItemsToProcess = [...(paramsEntry.param || [])];
            for (const item of paramItemsToProcess) {
                const { _status, paramId: clientParamId, ...itemDataForApi } = item;
                let paramApiInput: ParamItemInput;
                try {
                    if (item.type === 'type1')
                        paramApiInput = {
                            type: 'type1',
                            code: (item as ParamType1).code,
                            dispName: (item as ParamType1).dispName,
                            sortOrder: item.sortOrder,
                        };
                    else if (item.type === 'type2')
                        paramApiInput = {
                            type: 'type2',
                            min: (item as ParamType2).min,
                            increment: (item as ParamType2).increment,
                            sortOrder: item.sortOrder,
                        };
                    else if (item.type === 'type3')
                        paramApiInput = {
                            type: 'type3',
                            code: (item as ParamType3).code,
                            dispName: (item as ParamType3).dispName,
                            sortOrder: item.sortOrder,
                        };
                    else {
                        throw new Error(`Unknown param type: ${(item as any).type}`);
                    }

                    if (_status === 'new') {
                        const created = await addParamToAttribute(
                            paramsEntry.productId,
                            paramsEntry.attributeId,
                            paramApiInput,
                        );
                        processedParamItems.push({ ...created, _status: 'synced' });
                        // paramIdMap.set(clientParamId, created.paramId); // 必要ならParamのIDマッピングも
                    } else if (_status === 'updated') {
                        const updated = await updateAttributeParam(
                            paramsEntry.productId,
                            paramsEntry.attributeId,
                            item.paramId,
                            paramApiInput,
                        );
                        processedParamItems.push({ ...updated, _status: 'synced' });
                    } else if (_status === 'deleted' && item.paramId > 0) {
                        await deleteAttributeParam(
                            paramsEntry.productId,
                            paramsEntry.attributeId,
                            item.paramId,
                        );
                    } else if (_status !== 'deleted') {
                        processedParamItems.push(item);
                    }
                } catch (e: any) {
                    overallSuccess = false;
                    processedParamItems.push(item);
                    console.error(
                        `Param (Client ID: ${clientParamId}, DB ID: ${item.paramId}) for P:${paramsEntry.productId},A:${paramsEntry.attributeId} save/delete failed: ${e.message}`,
                    );
                }
            }
            const finalParamItemsForEntry = processedParamItems
                .filter((p) => p._status !== 'deleted')
                .map((p, i) => ({ ...p, sortOrder: i, _status: 'synced' as ChangeStatus }));
            finalParamsDataList.push({
                ...paramsEntry,
                param: finalParamItemsForEntry as ParamType1[] | ParamType2[] | ParamType3[],
            });
        }

        // 最後にまとめて状態を更新
        setProductData(
            processedProducts
                .filter((p) => p._status !== 'deleted')
                .map((p) => ({ ...p, _status: 'synced' })),
        );
        setParamsData(finalParamsDataList);

        setSaving(false);

        if (overallSuccess) {
            alert('変更が保存されました。\n(Product自体の新規/更新/削除APIはログ出力のみです。)');
            globalTempProductIdCounter = -1; // グローバル仮IDカウンターリセット
            globalTempAttributeIdCounter = -1;
            globalTempParamIdCounter = -1; // DetailTableContext内のカウンターもリセットする方法が必要
            // またはDetailTableContextが提供するリセット関数を呼ぶ
        } else {
            setError('一部の変更の保存に失敗しました。詳細はコンソールを確認してください。');
        }
    }, [baseTableData, detailTableData, setProductData, setParamsData]);


    return (
        <>
            <ButtonManager
                baseTableData={baseTableData}
                detailTableData={detailTableData}
                onSaveRequest={handleGlobalSaveChanges}
                isSaveDisabled={!isOverallDirty || saving || loading}
                onRefreshRequest={handleDataRefresh}
            />
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        aria-label="Data manager tabs"
                    >
                        <Tab label="基本情報" {...a11yProps(0)} />
                        <Tab label="詳細情報" {...a11yProps(1)} />
                    </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                    <BaseTable
                        baseTableData={baseTableData}
                        setProductData={setProductData}
                        detailTableData={detailTableData}
                        setParamsData={setParamsData}
                        handleAddParamsRow={handleAddOrRemoveParamsEntry}
                    />
                </TabPanel>
                <TabPanel value={activeTab} index={1}>
                    <DetailTable
                        baseTableData={baseTableData}
                        setProductData={setProductData}
                        detailTableData={detailTableData}
                        setParamsData={setParamsData}
                    />
                </TabPanel>
            </Box>
        </>
    );
}
