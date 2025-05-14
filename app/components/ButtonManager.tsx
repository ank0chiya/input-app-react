'use client';
import React, { useState, useCallback, useRef } from 'react';
import { Params, Product } from '@/app/types';
import { Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download'; // アイコン
import SaveIcon from '@mui/icons-material/Save'; // アイコン
import CircularProgress from '@mui/material/CircularProgress'; // ローディング表示
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ButtonManagerProps {
    baseTableData: Product[];
    detailTableData: Params[];
    onSaveRequest: () => Promise<void>;
    isSaveDisabled: boolean; // 保存ボタンの有効/無効 (親がダーティ状態と保存中状態を考慮して渡す)
    onRefreshRequest: () => Promise<void>;
    isProcessing: boolean; // 保存中、リフレッシュ中、リストア中など、何らかの処理中を示すフラグ
    onDataRestoredAction: (restoredData: {
        baseTableData: Product[];
        detailTableData: Params[];
    }) => void; // リストアされたデータを親に渡すコールバック
    isOverallDirty?: boolean; // 変更があるかどうか (ダウンロード/リストア時の確認メッセージ用)
}

export default function ButtonManager({
    baseTableData,
    detailTableData,
    onSaveRequest,
    isSaveDisabled,
    onRefreshRequest,
    isProcessing, // 親から受け取る処理中フラグ
    onDataRestoredAction,
    isOverallDirty,
}: ButtonManagerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // JSONダウンロードボタンのハンドラ
    const handleDownloadJson = useCallback(() => {
        if (isOverallDirty) {
            if (!window.confirm('未保存の変更がありますが、現在の状態でダウンロードしますか？')) {
                return;
            }
        }
        const dataToSave = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            baseTableData: baseTableData,
            detailTableData: detailTableData,
        };
        try {
            const jsonString = JSON.stringify(dataToSave, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const timestampForFile = new Date()
                .toISOString()
                .replace(/[:.]/g, '-')
                .replace('T', '_')
                .slice(0, -5);
            link.download = `mock_data_backup_${timestampForFile}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            // alert("データがJSONファイルとしてダウンロードされました。"); // 親でメッセージを出すかここで出すか
        } catch (error) {
            console.error('JSONデータの作成またはダウンロードに失敗しました:', error);
            alert('データのダウンロードに失敗しました。');
        }
    }, [baseTableData, detailTableData, isOverallDirty]);

    const handleFileSelectedForRestore = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) {
                return;
            }
            // isProcessing を true にする処理は親が行う (もしローディング表示が必要なら)
            try {
                const fileContent = await file.text();
                const restoredObject = JSON.parse(fileContent);

                if (
                    !restoredObject ||
                    typeof restoredObject !== 'object' ||
                    !Array.isArray(restoredObject.baseTableData) ||
                    !Array.isArray(restoredObject.detailTableData)
                ) {
                    throw new Error('無効なファイル形式、または必要なデータが含まれていません。');
                }

                // _status を付与/上書きする処理 (リストアされたデータが常に 'synced' であるべきか、元の状態を保つか)
                // ここでは、元の _status を尊重しつつ、なければ 'synced' を付与する例
                const processedBaseData = (restoredObject.baseTableData as Product[]).map((p) => ({
                    ...p,
                    _status: p._status || 'synced',
                    attributes: (p.attributes || []).map((a) => ({
                        ...a,
                        _status: a._status || 'synced',
                        params: (a.params || []).map((param) => ({
                            ...param,
                            _status: param._status || 'synced',
                        })),
                    })),
                }));
                const processedDetailData = (restoredObject.detailTableData as Params[]).map(
                    (pl) => ({
                        ...pl,
                        param: (pl.param || []).map((p) => ({
                            ...p,
                            _status: p._status || 'synced',
                        })),
                    }),
                );

                onDataRestoredAction({
                    // 親コンポーネントに処理済みのデータを渡す
                    baseTableData: processedBaseData as Product[],
                    detailTableData: processedDetailData as Params[],
                });
                // alert("データがファイルからリストアされました。"); // 親でメッセージを出す
            } catch (err: any) {
                console.error('Failed to restore data from JSON:', err);
                alert(`エラー: ${err.message || 'データのリストアに失敗しました。'}`);
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // 同じファイルを選択できるようにリセット
                }
                // isProcessing を false にする処理は親が行う
            }
        },
        [onDataRestoredAction],
    );

    const triggerRestoreFileInput = useCallback(() => {
        if (isOverallDirty) {
            if (
                !window.confirm(
                    '未保存の変更がありますが、ファイルからデータをリストアしますか？現在の変更は失われます。',
                )
            ) {
                return;
            }
        } else {
            if (
                !window.confirm('現在の作業内容はファイルの内容で上書きされます。よろしいですか？')
            ) {
                return;
            }
        }
        fileInputRef.current?.click();
    }, [isOverallDirty]);

    return (
        <Box sx={{ width: '100%' }}>
            {/* ダウンロード・登録ボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadJson}
                    disabled={isProcessing}
                >
                    JSONダウンロード
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    onClick={triggerRestoreFileInput}
                    disabled={isProcessing}
                >
                    JSONリストア
                </Button>
                <input
                    type="file"
                    accept="application/json"
                    onChange={handleFileSelectedForRestore}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                />
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={onRefreshRequest}
                    disabled={isProcessing}
                >
                    リフレッシュ
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                        isProcessing ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />
                    }
                    onClick={onSaveRequest}
                    disabled={isSaveDisabled || isProcessing}
                >
                    {isProcessing ? '登録中...' : '登録'}
                </Button>
            </Box>
        </Box>
    );
}
