'use client';
import React, { useState } from 'react';
import { Product } from '@/app/types';
import { Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download'; // アイコン
import SaveIcon from '@mui/icons-material/Save'; // アイコン
import CircularProgress from '@mui/material/CircularProgress'; // ローディング表示

export default function DataTableManager({ tableData }: { tableData: Product[] }) {
    // 登録処理中かどうかのフラグ (任意)
    const [isRegistering, setIsRegistering] = useState(false);

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
        URL.revokeObjectURL(url); // 後処理
    };

    // 登録ボタンのハンドラ
    const handleRegister = async () => {
        setIsRegistering(true); // ローディング開始
        console.log('Registering data:', JSON.stringify(tableData, null, 2));

        // --- 将来のAPI連携処理 ---
        try {
            // ダミーの待機処理 (APIコールのシミュレーション)
            await new Promise((resolve) => setTimeout(resolve, 1500));
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
            alert(
                `データの登録に失敗しました。\n${error instanceof Error ? error.message : String(error)}`,
            );
        } finally {
            setIsRegistering(false); // ローディング終了
        }
        // --- API連携処理ここまで ---
    };

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
                    startIcon={
                        isRegistering ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            <SaveIcon />
                        )
                    }
                    onClick={handleRegister}
                    disabled={isRegistering}
                >
                    {isRegistering ? '登録中...' : '登録'}
                </Button>
            </Box>
        </Box>
    );
}
