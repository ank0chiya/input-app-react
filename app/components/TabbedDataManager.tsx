'use client';

import { useState, useCallback, useEffect } from 'react';

import { Box, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import {
    Product,
    Params,
    Attribute,
    ApiProduct,
    ParamType1,
    ParamType2,
    ParamType3,
} from '../types';
import { sample_products, sample_params } from '../data/data'; // サンプルデータをインポート

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

// データ変換関数 (APIレスポンスの形式に合わせて調整が必要な場合があります)
// この関数は、このファイル内またはインポート可能な場所に定義されている必要があります。
// ユーザー提供の最新のsample_dataの構造に合わせて 'params' フィールドを参照します。
function transformData(apiData: ApiProduct[]): { products: Product[]; paramsList: Params[] } {
    const products: Product[] = [];
    const paramsList: Params[] = [];

    apiData.forEach((apiProduct) => {
        const productAttributes: Attribute[] = [];
        apiProduct.attributes.forEach((apiAttribute) => {
            const attribute: Attribute = {
                attributeId: apiAttribute.attributeId,
                attribute: apiAttribute.attribute,
                attributeType: apiAttribute.attributeType,
                attributeJP: apiAttribute.attributeJP,
                attributeUnit: apiAttribute.attributeUnit,
                paramHas: apiAttribute.params && apiAttribute.params.length > 0, // 'params' を参照
                contract: apiAttribute.contract,
                public: apiAttribute.public,
                masking: apiAttribute.masking,
                online: apiAttribute.online,
                sortOrder: apiAttribute.sortOrder,
            };
            productAttributes.push(attribute);

            // apiAttribute.params が存在し、要素があれば Params オブジェクトを作成
            if (apiAttribute.params && apiAttribute.params.length > 0) {
                const paramsEntry: Params = {
                    productId: apiProduct.productId,
                    attributeId: apiAttribute.attributeId,
                    // apiAttribute.params が ParamType1[] | ParamType2[] | ParamType3[] の形式であることを想定
                    param: apiAttribute.params as ParamType1[] | ParamType2[] | ParamType3[],
                };
                paramsList.push(paramsEntry);
            } else if (attribute.paramHas) {
                // paramHas が true で、実際の params 配列が空または存在しない場合、
                // detailTable 用に空の Params エントリを作成することも検討できます。
                // もしくは、APIレスポンスで paramHas が true なら必ず空の params 配列 [] を返すようにする。
                // ここでは、apiAttribute.params がなければ作らない元のロジックを維持。
                // handleAddParamsRow が後でこのケースを処理する想定。
            }
        });

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

export default function TabbedDataManager() {
    // const [baseTableData, setProductData] = useState<Product[]>(sample_products);
    // const [detailTableData, setParamsData] = useState<Params[]>(sample_params);
    const [baseTableData, setProductData] = useState<Product[]>([]); // 初期値を空配列に
    const [detailTableData, setParamsData] = useState<Params[]>([]); // 初期値を空配列に
    const [loading, setLoading] = useState<boolean>(true); // ローディング状態を追加
    const [error, setError] = useState<string | null>(null); // エラー状態を追加

    const [activeTab, setActiveTab] = useState(0); // タブの状態を管理

    // タブが変更されたときのハンドラ
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // APIからデータを取得
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // APIエンドポイントURL (モックサーバーに合わせてください)
                // 例: Next.js API Routes なら '/api/products'
                // 例: 外部サーバーなら 'http://localhost:8080/products' (OpenAPI仕様のservers.url + path)
                const response = await fetch('/api-proxy/products'); // ★要確認・修正★
                console.log(response);
                if (!response.ok) {
                    throw new Error(
                        `API request failed with status ${response.status}: ${response.statusText}`,
                    );
                }
                const apiData: ApiProduct[] = await response.json();

                const { products, paramsList } = transformData(apiData);

                setProductData(products);
                setParamsData(paramsList);
            } catch (e: any) {
                console.error('Failed to fetch data from API:', e);
                setError(e.message || 'データの取得中にエラーが発生しました。');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // 空の依存配列で、マウント時に1回だけ実行

    const handleAddParamsRow = useCallback(
        (targetRow: Product, updatedAttributes: Attribute[], attributeIndex: number) => {
            const productId = targetRow.productId;
            const attributeId = updatedAttributes[attributeIndex].attributeId;

            const hasParm = detailTableData.some(
                (data) => data.productId === productId && data.attributeId === attributeId,
            );
            if (hasParm) {
                return;
            }
            if (updatedAttributes[attributeIndex].paramHas) {
                setParamsData((prev) => {
                    const productId = targetRow.productId;
                    const attributeId = updatedAttributes[attributeIndex].attributeId;
                    const newParam: Params = {
                        productId: productId,
                        attributeId: attributeId,
                        param: [],
                    };
                    return [...prev, newParam];
                });
            }
        },
        [],
    );

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '80vh',
                }}
            >
                <CircularProgress />
                <Box component="span" sx={{ ml: 2 }}>
                    Loading data...
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">データの読み込みに失敗しました: {error}</Alert>
            </Box>
        );
    }

    return (
        <>
            <ButtonManager baseTableData={baseTableData} detailTableData={detailTableData} />
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
                        handleAddParamsRow={handleAddParamsRow}
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
