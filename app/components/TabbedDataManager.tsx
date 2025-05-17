'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';

import { Box, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import {
    Product,
    Params,
    Attribute,
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
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // エラー状態を追加
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState(0); // タブの状態を管理

    // タブが変更されたときのハンドラ
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const getExpectedParamTypeFromContract = (contract?: string): 'type1' | 'type2' | 'type3' => {
        if (contract === 'type1') {
            return 'type1';
        } else if (contract === 'type2') {
            return 'type2';
        }
        return 'type3'; // contractが 'type1', 'type2' 以外 (空文字列 '' を含む) の場合のデフォルト
    };

    const isOverallDirty = useMemo(() => {
        const isBaseDirty = baseTableData.some(
            (product) =>
                (product._status && product._status !== 'synced') ||
                (product.attributes || []).some(
                    (attribute) => attribute._status && attribute._status !== 'synced',
                ),
        );
        const isDetailDirty = detailTableData.some((paramsEntry) =>
            (paramsEntry.param || []).some(
                (paramItem) => paramItem._status && paramItem._status !== 'synced',
            ),
        );
        return isBaseDirty || isDetailDirty;
    }, [baseTableData, detailTableData]);

    const loadInitialData = useCallback(
        async (showSpinner = true) => {
            if (showSpinner) setInitialLoading(true);
            setError(null);
            try {
                // fetchAllProductsForDisplayはアプリ内型(Product[], Params[])を返すようにマッピング済みと想定
                const { products, paramsList } = await fetchAllProductsForDisplay();

                const initialTrackedProducts: Product[] = products.map((p) => ({
                    ...p,
                    _status: 'synced' as ChangeStatus,
                    attributes: (p.attributes || []).map((a) => ({
                        ...a,
                        _status: 'synced' as ChangeStatus,
                        // Attribute.params はAPIレスポンスに含まれる (マッピング後)
                        // そのparams内の各要素にも_statusを付与
                        params: (a.params || []).map((param) => ({
                            ...param,
                            _status: 'synced' as ChangeStatus,
                        })),
                        // paramHas は Attribute.params の有無で決定される
                        paramHas: a.params != null && a.params.length > 0,
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
                console.error('Failed to fetch initial data:', e);
                setError(e.message || 'データの初期ロード中にエラーが発生しました。');
            } finally {
                if (showSpinner) setInitialLoading(false);
            }
        },
        [setProductData, setParamsData],
    );

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
        setIsSaving(true);
        setError(null);
        try {
            await refreshMockData();
            await loadInitialData(false);
            alert('データがリフレッシュされました。');
        } catch (e: any) {
            setError(e.message || 'データのリフレッシュ中にエラーが発生しました。');
        } finally {
            setIsSaving(false);
        }
    }, [loadInitialData, isOverallDirty]);

    // 「登録」ボタンが押されたときのグローバルな保存処理
    const handleGlobalSaveChanges = useCallback(async () => {
        setIsSaving(true);
        setError(null);
        let overallSuccess = true;

        let currentProductsState: Product[] = JSON.parse(JSON.stringify(baseTableData));
        let currentParamsListState: Params[] = JSON.parse(JSON.stringify(detailTableData));

        // 仮IDとサーバーIDのマッピングを保持（ParamsのattributeId更新用）
        const attributeIdMap = new Map<number, number>(); // <tempAttrId, serverAttrId>
        // const paramIdMap = new Map<string, Map<number,number>>(); // 必要であれば

        try {
            // --- Phase 1: Process Products (DELETE, UPDATE, CREATE) ---
            // (ProductのAPI呼び出しは未実装のため、ここでは主にAttributeとParamに影響するID処理を考慮)
            const processedProductsAfterProductOps: Product[] = [];
            for (const product of currentProductsState) {
                if (product._status === 'deleted' && product.productId > 0) {
                    console.log(`SIMULATE: API DELETE Product ${product.productId}`);
                    // await deleteProduct(product.productId); // API呼び出し
                    continue; // 削除されたものは以降の処理に含めない
                }
                // TODO: Productの新規作成(POST)と更新(PUT)処理
                // 新規作成の場合はサーバーIDをproductIdに設定し、attributeIdMapのキーにも影響する
                processedProductsAfterProductOps.push(product);
            }
            currentProductsState = processedProductsAfterProductOps;

            // --- Phase 2: Process Attributes (DELETE, UPDATE, CREATE) ---
            for (const product of currentProductsState) {
                if (!product.attributes) product.attributes = []; // attributesがない場合初期化
                let finalAttributesForProduct: Attribute[] = [];
                const attributesToDelete = product.attributes.filter(
                    (attr) => attr._status === 'deleted' && attr.attributeId > 0,
                );
                for (const attr of attributesToDelete) {
                    try {
                        await deleteProductAttribute(product.productId, attr.attributeId);
                    } catch (e: any) {
                        overallSuccess = false;
                        console.error(
                            `Failed to delete attribute ${attr.attributeId}:`,
                            e,
                        ); /* エラー時はリストに残すか検討 */
                    }
                }

                const attributesToKeepOrUpdate = product.attributes.filter(
                    (attr) => !(attr._status === 'deleted' && attr.attributeId > 0),
                );
                for (const attr of attributesToKeepOrUpdate) {
                    const clientAttributeId = attr.attributeId;
                    const {
                        _status,
                        attributeId,
                        params: localParams,
                        paramHas: localParamHas,
                        ...attrInputData
                    } = attr;

                    if (_status === 'new' && clientAttributeId < 0 && product.productId > 0) {
                        try {
                            const createdApiAttribute = await addAttributeToProduct(
                                product.productId,
                                attrInputData as AttributeInput,
                            );
                            attributeIdMap.set(clientAttributeId, createdApiAttribute.attributeId);
                            // 新規AttributeのparamHasは、これに紐づくローカルParamの有無で決める
                            const paramsEntryForNewAttr = currentParamsListState.find(
                                (pl) =>
                                    pl.productId === product.productId &&
                                    pl.attributeId === clientAttributeId,
                            );
                            const hasLocalNewParams = !!(paramsEntryForNewAttr?.param || []).some(
                                (p) => p._status === 'new',
                            );
                            finalAttributesForProduct.push({
                                ...createdApiAttribute,
                                params: [], // APIレスポンスでは空のはず
                                paramHas: hasLocalNewParams, // ローカル状態を反映
                                _status: 'synced',
                            });
                        } catch (e: any) {
                            overallSuccess = false;
                            console.error(e);
                            finalAttributesForProduct.push(attr);
                        }
                    } else if (_status === 'updated' && clientAttributeId > 0) {
                        try {
                            const updatedApiAttribute = await updateProductAttribute(
                                product.productId,
                                clientAttributeId,
                                attrInputData as AttributeInput,
                            );
                            finalAttributesForProduct.push({
                                ...updatedApiAttribute,
                                params: localParams || [], // ローカルのparamsを維持
                                paramHas: localParamHas, // ローカルのparamHasを維持
                                _status: 'synced',
                            });
                        } catch (e: any) {
                            overallSuccess = false;
                            console.error(e);
                            finalAttributesForProduct.push(attr);
                        }
                    } else if (_status !== 'deleted') {
                        // synced or new (but parent product is new)
                        finalAttributesForProduct.push(attr);
                    }
                }
                product.attributes = finalAttributesForProduct;
            }

            // --- Phase 3: Update attributeId in workingParamsList using attributeIdMap ---
            if (attributeIdMap.size > 0) {
                currentParamsListState = currentParamsListState.map((pl) => {
                    if (attributeIdMap.has(pl.attributeId)) {
                        // 仮のattributeIdだったら
                        return { ...pl, attributeId: attributeIdMap.get(pl.attributeId)! };
                    }
                    return pl;
                });
            }

            // --- Phase 4: Process Parameters (DELETE, UPDATE, CREATE) ---
            const finalProcessedParamsList: Params[] = [];
            for (const paramsEntry of currentParamsListState) {
                const parentProduct = currentProductsState.find(
                    (p) => p.productId === paramsEntry.productId,
                );
                const parentAttribute = parentProduct?.attributes.find(
                    (a) => a.attributeId === paramsEntry.attributeId,
                );

                if (!parentAttribute || parentAttribute.attributeId < 0) {
                    // 親Attributeが未保存(仮ID) or 存在しない
                    if (paramsEntry.param && paramsEntry.param.length > 0)
                        finalProcessedParamsList.push(paramsEntry); // 処理できなかったものとして保持
                    continue;
                }

                let currentParamsInEntry = [...(paramsEntry.param || [])];
                const finalParamsForThisEntry: ParamDetail[] = [];

                const paramsToDeleteInEntry = currentParamsInEntry.filter(
                    (p) => p._status === 'deleted' && p.paramId > 0,
                );
                for (const param of paramsToDeleteInEntry) {
                    try {
                        await deleteAttributeParam(
                            paramsEntry.productId,
                            paramsEntry.attributeId,
                            param.paramId,
                        );
                    } catch (e: any) {
                        overallSuccess = false;
                        console.error(e); /* エラー処理 */
                    }
                }
                currentParamsInEntry = currentParamsInEntry.filter(
                    (p) => !(p._status === 'deleted' && p.paramId > 0),
                );

                for (const item of currentParamsInEntry) {
                    const { _status, paramId: clientParamId, ...itemInputData } = item;
                    let paramApiInput: ParamItemInput = itemInputData as ParamItemInput; // 型キャスト注意

                    if (_status === 'new' && clientParamId < 0) {
                        try {
                            const createdParam = await addParamToAttribute(
                                paramsEntry.productId,
                                paramsEntry.attributeId,
                                paramApiInput,
                            );
                            finalParamsForThisEntry.push({ ...createdParam, _status: 'synced' });
                        } catch (e: any) {
                            overallSuccess = false;
                            console.error(e);
                            finalParamsForThisEntry.push(item);
                        }
                    } else if (_status === 'updated' && clientParamId > 0) {
                        try {
                            const updatedParam = await updateAttributeParam(
                                paramsEntry.productId,
                                paramsEntry.attributeId,
                                clientParamId,
                                paramApiInput,
                            );
                            finalParamsForThisEntry.push({ ...updatedParam, _status: 'synced' });
                        } catch (e: any) {
                            overallSuccess = false;
                            console.error(e);
                            finalParamsForThisEntry.push(item);
                        }
                    } else if (_status !== 'deleted') {
                        finalParamsForThisEntry.push(item);
                    }
                }
                paramsEntry.param = finalParamsForThisEntry.map((p, i) => ({
                    ...p,
                    sortOrder: i,
                    _status: 'synced' as ChangeStatus,
                })) as ParamType1[] | ParamType2[] | ParamType3[];

                // 親AttributeのparamHasとparamsを最終状態で更新
                if (parentAttribute) {
                    parentAttribute.params = paramsEntry.param;
                    parentAttribute.paramHas = paramsEntry.param.length > 0;
                }
                if (paramsEntry.param.length > 0 || paramsToDeleteInEntry.length > 0) {
                    finalProcessedParamsList.push(paramsEntry);
                }
            }
            currentParamsListState = finalProcessedParamsList;

            // --- Phase 5: 最終的な状態でstateを更新 ---
            setProductData(
                currentProductsState.map((p) => ({
                    ...p,
                    _status: 'synced',
                    attributes: (p.attributes || []).map((a) => ({ ...a, _status: 'synced' })),
                })),
            );
            setParamsData(
                currentParamsListState.map((pl) => ({
                    ...pl,
                    param: (pl.param || []).map((p) => ({ ...p, _status: 'synced' })) as
                        | ParamType1[]
                        | ParamType2[]
                        | ParamType3[],
                })),
            );
        } catch (e: any) {
            console.error('An unexpected error occurred during save:');
            setError(e.message || '保存処理中に予期せぬエラーが発生しました。');
            overallSuccess = false;
        } finally {
            setIsSaving(false);
        }

        if (overallSuccess) {
            alert('変更が保存されました。\n(Product自体のAPIはログのみ)');
            globalTempProductIdCounter = -1;
            globalTempAttributeIdCounter = -1;
            globalTempParamIdCounter = -1;
            await loadInitialData(false); // データを再ロードしてクリーンな状態にする
        } else {
            if (!error)
                setError('一部の変更の保存に失敗しました。詳細はコンソールを確認してください。');
            // エラー時はUIの整合性のため、変更前の状態に戻すか、再ロードを促す
            // ここでは再ロードで対応
            await loadInitialData(false);
        }
    }, [baseTableData, detailTableData, setProductData, setParamsData, loadInitialData, error]);

    // ButtonManagerからリストアされたデータを受け取ってstateを更新するコールバック
    const handleDataRestoredFromButtonManager = useCallback(
        (restoredData: { baseTableData: Product[]; detailTableData: Params[] }) => {
            setIsSaving(true); // リストア処理中もローディング/処理中とみなす
            setError(null);
            try {
                setProductData(restoredData.baseTableData);
                setParamsData(restoredData.detailTableData);

                // 仮IDカウンターをリセット
                globalTempProductIdCounter = -1;
                globalTempAttributeIdCounter = -1;
                globalTempParamIdCounter = -1;

                // isOverallDirty はリストアされたデータの _status に基づいて再計算される
                alert('データがファイルからリストアされました。'); // メッセージはButtonManager側で出しても良い
            } catch (e: any) {
                setError(e.message || 'リストアデータの適用中にエラーが発生しました。');
            } finally {
                setIsSaving(false);
            }
        },
        [setProductData, setParamsData],
    );

    if (initialLoading && !isSaving) {
        // 初期ロード中 (かつ他の操作中でない)
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />{' '}
                <Box component="span" sx={{ ml: 2 }}>
                    Loading data...
                </Box>
            </Box>
        );
    }
    // isSaving 中の専用ローディング表示 (任意)
    if (isSaving) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />{' '}
                <Box component="span" sx={{ ml: 2 }}>
                    Processing...
                </Box>
            </Box>
        );
    }
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Error: {error}</Alert>
            </Box>
        );
    }

    return (
        <>
            <ButtonManager
                baseTableData={baseTableData}
                detailTableData={detailTableData}
                onSaveRequest={handleGlobalSaveChanges}
                isSaveDisabled={!isOverallDirty || isSaving || initialLoading} // 保存ボタンの有効/無効
                onRefreshRequest={handleDataRefresh}
                isProcessing={isSaving} // 統一的な処理中フラグ
                onDataRestoredAction={handleDataRestoredFromButtonManager} // コールバックを渡す
                isOverallDirty={isOverallDirty}
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
