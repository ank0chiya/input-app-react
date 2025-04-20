// components/TabbedDataManager.tsx
'use client';
import React, { useState, useCallback } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import DataTable from './DataTable'; // DataTable コンポーネント
import DetailTable from './DetailTable'; // DetailTable コンポーネント (後で作成)
// import { firstTabTableColumns } from '../config/tableColumn';
import { TableRowType } from '../types';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}> {/* タブコンテンツの上部にパディング */}
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`,
    };
}

interface TabbedDataManagerProps {
    initialData: TableRowType[];
}

// ★ createNewRowData をこちらに移動 (DataTableと共有するため)
const createNewRowData = (): TableRowType => {
    const uniquePrefix = `NEW_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
        prefix: uniquePrefix, type: '', cfgType: '', params: [], selected: false, public: false,
        security: false, itemType: 'pattern1', pattern1: [], pattern2: [], online: false,
    };
};

const TabbedDataManager = ({ initialData }: TabbedDataManagerProps): JSX.Element => {
    const [tableData, setTableData] = useState<TableRowType[]>(initialData);
    const [activeTab, setActiveTab] = useState(0);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // DataTable または DetailTable からのデータ変更通知を受け取るコールバック
    const handleDataUpdate = useCallback((updatedRowData: TableRowType, rowIndex: number) => {
        setTableData(prevData => prevData.map((row, index) =>
            index === rowIndex ? updatedRowData : row
        ));
    }, []); // この関数は依存関係がないため一度だけ生成

    // DataTable からの行追加通知を受け取るコールバック
    const handleAddRowCallback = useCallback((rowIndex: number) => {
        const newRow = createNewRowData();
        setTableData(prevData => [
            ...prevData.slice(0, rowIndex + 1),
            newRow,
            ...prevData.slice(rowIndex + 1)
        ]);
    }, []);

    // DataTable からの行削除通知を受け取るコールバック
    const handleDeleteRowCallback = useCallback((rowIndex: number) => {
        setTableData(prevData => {
            if (prevData.length <= 1) {
                console.log("Cannot delete the last row."); // 最後の行は削除しない
                return prevData;
            }
            return prevData.filter((_, index) => index !== rowIndex);
        });
    }, []);

    // --- ダウンロードと登録ハンドラ ---
    const handleDownloadJson = () => {
        if (isRegistering) return;
        const jsonString = JSON.stringify(tableData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'table-data.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    const handleRegister = async () => {
        setIsRegistering(true);
        console.log('Registering data:', JSON.stringify(tableData, null, 2));
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // ダミー待機
            console.log('（ダミー）Registration process finished.');
            alert('（ダミー）登録処理が完了しました。');
        } catch (error) {
            console.error('Registration failed:', error);
            alert(`データの登録に失敗しました。\n${error instanceof Error ? error.message : String(error)}`);
        } finally { setIsRegistering(false); }
    };
    // --- ハンドラここまで ---

    return (
        <Box sx={{ width: '100%' }}>
            {/* ダウンロード・登録ボタン (変更なし) */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadJson} disabled={isRegistering}> JSONダウンロード </Button>
                <Button variant="contained" color="primary" startIcon={isRegistering ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} onClick={handleRegister} disabled={isRegistering}> {isRegistering ? '登録中...' : '登録'} </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="Data manager tabs">
                    <Tab label="基本情報" {...a11yProps(0)} />
                    {/* ★ 詳細タブの disabled 属性を削除 */}
                    <Tab label="詳細情報" {...a11yProps(1)} />
                </Tabs>
            </Box>

            {/* 基本情報タブ */}
            <TabPanel value={activeTab} index={0}>
                <DataTable
                    tableData={tableData}
                    // columns={firstTabTableColumns} // アクションカラムは DataTable 内で追加
                    onDataChange={handleDataUpdate}       // データ変更通知
                    onAddRow={handleAddRowCallback}       // 行追加通知
                    onDeleteRow={handleDeleteRowCallback} // 行削除通知
                />
            </TabPanel>

            {/* 詳細情報タブ */}
            <TabPanel value={activeTab} index={1}>
                {/* ★ DetailTable に tableData 全体と onDataChange を渡す */}
                <DetailTable
                    tableData={tableData}
                    onDataChange={handleDataUpdate} // データ変更を通知
                />
            </TabPanel>
        </Box>
    );
};

export default TabbedDataManager;
