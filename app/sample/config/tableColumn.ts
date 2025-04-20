// config/tableColumns.ts
import { Column } from '../types'; // パスは適宜調整してください

// 1つ目のタブのテーブルカラム定義（新）
export const firstTabTableColumns: Column[] = [
    { id: 'prefix', label: 'ID', type: 'text' },
    { id: 'type', label: 'タイプ', type: 'text' },
    { id: 'cfgType', label: '設定タイプ', type: 'text' },
    {
        id: 'params', // TableRowType のキーに合わせる
        label: 'パラメータ一覧',
        type: 'nested',
        subColumns: [
            { id: 'param', label: 'パラメータ', type: 'text' },
            { id: 'paramType', label: 'データ型', type: 'text' },
            { id: 'paramJP', label: '日本語名', type: 'text' }
        ]
    },
    { id: 'selected', label: '選択', type: 'checkbox' },
    { id: 'public', label: '公開', type: 'checkbox' },
    { id: 'security', label: 'セキュリティ', type: 'checkbox' },
];