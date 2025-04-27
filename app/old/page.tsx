'use client';

import React, { useState } from 'react';
import { Container, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './components/Header';
import ActionButtons from './components/ActionButtons';
import TabPanel from './components/TabPanel';
import { 
  TableRowType, 
  firstTabTableColumns, 
  secondTabTableColumns, 
  initialData, 
  ParamItem, 
  Pattern1Item,
  Pattern2Item
} from './data';

// テーマの作成
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function Home() {
  // 状態管理
  const [data, setData] = useState<TableRowType[]>(initialData);
  const [activeTab, setActiveTab] = useState(0);

  // データ変更ハンドラー
  const handleDataChange = (rowId: string, fieldId: string, value: any) => {
    setData(prevData => 
      prevData.map(row => {
        if (row.prefix === rowId) {
          // アイテムタイプが変更された場合、適切なパターンのデータを初期化
          if (fieldId === 'itemType') {
            if (value === 'pattern1') {
              // pattern1に変更された場合、pattern1を初期化し、pattern2を空にする
              return { 
                ...row, 
                itemType: value,
                pattern1: row.pattern1.length > 0 ? row.pattern1 : [{ 
                  pattern1Value: '', 
                  pattern1JP: '', 
                  pattern1Desc: '' 
                }],
                pattern2: []
              };
            } else if (value === 'pattern2') {
              // pattern2に変更された場合、pattern2を初期化し、pattern1を空にする
              return { 
                ...row, 
                itemType: value,
                pattern1: [],
                pattern2: row.pattern2.length > 0 ? row.pattern2 : [{ 
                  pattern2Min: 0, 
                  pattern2Max: 100, 
                  pattern2Increment: 10 
                }]
              };
            }
          }
          // 通常のフィールド変更
          return { ...row, [fieldId]: value };
        }
        return row;
      })
    );
  };

  // サブアイテム変更ハンドラー
  const handleSubItemChange = (rowId: string, subItemIndex: number, fieldId: string, value: any) => {
    setData(prevData => 
      prevData.map(row => {
        if (row.prefix === rowId) {
          if (activeTab === 0) {
            // 1つ目のタブのパラメータ
            const newParams = [...row.params];
            newParams[subItemIndex] = { 
              ...newParams[subItemIndex], 
              [fieldId]: value 
            };
            return { ...row, params: newParams };
          } else {
            // 2つ目のタブのパターン
            if (fieldId.startsWith('pattern1')) {
              const newPattern1 = [...row.pattern1];
              newPattern1[subItemIndex] = { 
                ...newPattern1[subItemIndex], 
                [fieldId]: value 
              };
              return { ...row, pattern1: newPattern1 };
            } else if (fieldId.startsWith('pattern2')) {
              const newPattern2 = [...row.pattern2];
              newPattern2[subItemIndex] = { 
                ...newPattern2[subItemIndex], 
                [fieldId]: value 
              };
              return { ...row, pattern2: newPattern2 };
            }
          }
        }
        return row;
      })
    );
  };

  // サブアイテム追加ハンドラー
  const handleAddSubItem = (rowId: string, tabIndex: number) => {
    setData(prevData => 
      prevData.map(row => {
        if (row.prefix === rowId) {
          if (tabIndex === 0) {
            // 1つ目のタブのパラメータ追加
            const newParam: ParamItem = { 
              param: '', 
              paramType: '', 
              paramJP: '' 
            };
            return { ...row, params: [...row.params, newParam] };
          } else {
            // 2つ目のタブのパターン追加
            if (row.itemType === 'pattern1') {
              const newPattern1Item: Pattern1Item = { 
                pattern1Value: '', 
                pattern1JP: '', 
                pattern1Desc: '' 
              };
              return { ...row, pattern1: [...row.pattern1, newPattern1Item] };
            } else {
              const newPattern2Item: Pattern2Item = { 
                pattern2Min: 0, 
                pattern2Max: 100, 
                pattern2Increment: 10 
              };
              return { ...row, pattern2: [...row.pattern2, newPattern2Item] };
            }
          }
        }
        return row;
      })
    );
  };

  // サブアイテム削除ハンドラー
  const handleRemoveSubItem = (rowId: string, subItemIndex: number, tabIndex: number) => {
    setData(prevData => {
      const updatedData = prevData.map(row => {
        if (row.prefix === rowId) {
          if (tabIndex === 0) {
            // 1つ目のタブのパラメータ削除
            const newParams = [...row.params];
            newParams.splice(subItemIndex, 1);
            
            // パラメータが空になった場合はnullを返し、後でフィルタリング
            if (newParams.length === 0) {
              return null;
            }
            
            return { ...row, params: newParams };
          } else {
            // 2つ目のタブのパターン削除
            if (row.itemType === 'pattern1') {
              const newPattern1 = [...row.pattern1];
              newPattern1.splice(subItemIndex, 1);
              
              if (newPattern1.length === 0) {
                return null;
              }
              
              return { ...row, pattern1: newPattern1 };
            } else {
              const newPattern2 = [...row.pattern2];
              newPattern2.splice(subItemIndex, 1);
              
              if (newPattern2.length === 0) {
                return null;
              }
              
              return { ...row, pattern2: newPattern2 };
            }
          }
        }
        return row;
      });
      
      // nullの行（サブアイテムが空になった行）を除外
      return updatedData.filter(row => row !== null) as TableRowType[];
    });
  };

  // JSONダウンロードハンドラー
  const handleDownload = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'table-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // データ登録ハンドラー（モック）
  const handleRegister = () => {
    // 実際のAPIエンドポイントが決まったら置き換え
    console.log('データを登録します:', data);
    alert('データが正常に登録されました');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth={false} disableGutters sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2 }}>
            <ActionButtons
              data={data} 
              onDownload={handleDownload} 
              onRegister={handleRegister} 
            />
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <TabPanel
              data={data}
              firstTabColumns={firstTabTableColumns}
              secondTabColumns={secondTabTableColumns}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onDataChange={handleDataChange}
              onSubItemChange={handleSubItemChange}
              onAddSubItem={handleAddSubItem}
              onRemoveSubItem={handleRemoveSubItem}
            />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
