import { useState } from 'react';

import { Box, Tabs, Tab } from '@mui/material';
import { Product, Params } from '../types';
import { sample_products, sample_params } from '../data/data'; // サンプルデータをインポート

import BaseTable from './BaseTable';
import DetailTable from './DetailTable';

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
            {value === index && (
                <Box sx={{ pt: 3 }}>{children}</Box>
            )}
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

export default function TabbedDataManager() {
    const [activeTab, setActiveTab] = useState(0); // タブの状態を管理

    // タブが変更されたときのハンドラ
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="Data manager tabs">
                    <Tab label="基本情報" {...a11yProps(0)} />
                    <Tab label="詳細情報" {...a11yProps(1)} />
                </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
                <BaseTable />
            </TabPanel>
            <TabPanel value={activeTab} index={1} />
        </Box>
    );
}
