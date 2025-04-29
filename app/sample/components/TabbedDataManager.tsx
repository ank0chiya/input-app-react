// components/TabbedDataManager.tsx
'use client';
import React, { useState, useCallback, JSX } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material'; // Typography はメッセージ表示用
import DataTable from './DataTable';        // 基本情報タブ用コンポーネント
import DetailTable from './DetailTable';    // 詳細情報タブ用コンポーネント
import { TableRowType, ParamType } from '../types'; // 型定義
import DownloadIcon from '@mui/icons-material/Download'; // アイコン
import SaveIcon from '@mui/icons-material/Save';         // アイコン
import CircularProgress from '@mui/material/CircularProgress'; // ローディング表示
import Button from '@mui/material/Button';             // ボタン

// --- タブパネル表示用ヘルパーコンポーネント ---
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
                // タブコンテンツの上部にパディングを追加
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
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

// 新しい行のデフォルトデータを作成する関数
const createNewRowData = (): TableRowType => {
    // prefix は本来ユニークであるべきだが、ここでは一時的な値を設定
    const uniquePrefix = `NEW_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
        prefix: uniquePrefix,
        type: '',
        cfgType: '',
        params: [], // 最初はパラメータなし
        // itemType: 'pattern1', // デフォルト値
        pattern1: [],
        pattern2: [],
        online: false,
    };
};

// --- Props のインターフェース定義 ---
interface TabbedDataManagerProps {
    initialData: TableRowType[]; // 初期データ
}

// --- 親コンポーネント本体 ---
const TabbedDataManager = ({ initialData }: TabbedDataManagerProps): JSX.Element => {
    // --- State 定義 ---
    // テーブル全体のデータ
    const [tableData, setTableData] = useState<TableRowType[]>(initialData);
    // 現在アクティブなタブのインデックス (0: 基本情報, 1: 詳細情報)
    const [activeTab, setActiveTab] = useState(0);
    // 登録処理中かどうかのフラグ (任意)
    const [isRegistering, setIsRegistering] = useState(false);

    // --- コールバック関数定義 ---

    // タブが変更されたときのハンドラ
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // 子コンポーネント (DataTable, DetailTable) から行データの変更通知を受け取るコールバック
    const handleDataUpdate = useCallback((updatedRowData: TableRowType, rowIndex: number) => {
        console.log("TabbedDataManager: handleDataUpdate received for row:", rowIndex, updatedRowData); // デバッグ用
        setTableData(prevData => {
            console.log("TabbedDataManager: Updating tableData state."); // デバッグ用
            // 指定されたインデックスの行データのみを更新した新しい配列を返す
            return prevData.map((row, index) =>
                index === rowIndex ? updatedRowData : row
            );
        });
    }, []); // 依存配列は空でOK (setTableData は安定しているため)

    // DataTable から行追加通知を受け取るコールバック
    const handleAddRowCallback = useCallback((rowIndex: number) => {
        const newRow = createNewRowData();
        setTableData(prevData => [
            ...prevData.slice(0, rowIndex + 1), // クリックされた行の直後に追加
            newRow,
            ...prevData.slice(rowIndex + 1)
        ]);
    }, []); // 依存配列は空でOK (setTableData は安定しているため)

    // DataTable から行削除通知を受け取るコールバック
    const handleDeleteRowCallback = useCallback((rowIndex: number) => {
        setTableData(prevData => {
            if (prevData.length <= 1) {
                console.warn("Cannot delete the last row."); // 最後の行は削除しない
                return prevData;
            }
            // 指定されたインデックスの行を除外した新しい配列を返す
            return prevData.filter((_, index) => index !== rowIndex);
        });
    }, []); // 依存配列は空でOK (setTableData は安定しているため)

    // JSONダウンロードボタンのハンドラ
    const handleDownloadJson = () => {
        if (isRegistering) return; // 登録処理中は無視
        const jsonString = JSON.stringify(tableData, null, 2); // 整形してJSON化
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table-data.json'; // ダウンロードファイル名
        document.body.appendChild(a); // Firefox対応
        a.click();
        document.body.removeChild(a); // 後処理
        URL.revokeObjectURL(url);      // 後処理
    };

    // 登録ボタンのハンドラ
    const handleRegister = async () => {
        setIsRegistering(true); // ローディング開始
        console.log('Registering data:', JSON.stringify(tableData, null, 2));

        // --- 将来のAPI連携処理 ---
        try {
            // ダミーの待機処理 (APIコールのシミュレーション)
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('（ダミー）Registration process finished.');
            alert('（ダミー）登録処理が完了しました。'); // ユーザーへのフィードバック

            /* // --- 実際のAPIコール例 (fetch) ---
            const apiUrl = '/api/your-endpoint'; // 要変更
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', // 必要なら認証ヘッダ等追加
               },
              body: JSON.stringify(tableData),
            });
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
            }
            const result = await response.json();
            console.log('Registration successful:', result);
            alert('データの登録に成功しました。');
            */

        } catch (error) {
            // エラー処理
            console.error('Registration failed:', error);
            alert(`データの登録に失敗しました。\n${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsRegistering(false); // ローディング終了
        }
        // --- API連携処理ここまで ---
    };

    // --- レンダリング ---
    return (
        <Box sx={{ width: '100%' }}>
            {/* ダウンロード・登録ボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadJson}
                    disabled={isRegistering}
                >
                    JSONダウンロード
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={isRegistering ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleRegister}
                    disabled={isRegistering}
                >
                    {isRegistering ? '登録中...' : '登録'}
                </Button>
            </Box>

            {/* タブヘッダー */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="Data manager tabs">
                    <Tab label="基本情報" {...a11yProps(0)} />
                    <Tab label="詳細情報" {...a11yProps(1)} />
                </Tabs>
            </Box>

            {/* 基本情報タブパネル */}
            <TabPanel value={activeTab} index={0}>
                <DataTable
                    tableData={tableData} // 現在のテーブルデータを渡す
                    onDataChange={handleDataUpdate}       // 行データ変更時のコールバック
                    onAddRow={handleAddRowCallback}       // 行追加時のコールバック
                    onDeleteRow={handleDeleteRowCallback} // 行削除時のコールバック
                />
            </TabPanel>

            {/* 詳細情報タブパネル */}
            <TabPanel value={activeTab} index={1}>
                {/* DetailTable に現在のテーブルデータと更新用コールバックを渡す */}
                {/* DetailTable 側で tableData から param.selected === true のものをフィルタリングして表示する */}
                {/* build用にコメントアウト */}
                {/* <DetailTable
                    tableData={tableData}
                    onDataChange={handleDataUpdate}
                /> */}
            </TabPanel>
        </Box>
    );
};

export default TabbedDataManager; // コンポーネントをエクスポート