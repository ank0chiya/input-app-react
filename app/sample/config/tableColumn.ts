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


// 2つ目のタブ (詳細情報) のテーブルカラム定義
// Column 型に dropdown と int を追加する必要があるかもしれない
// または DetailTable 内で type を解釈して適切なコンポーネントを表示する
export const secondTabTableColumns: Column[] = [
    { id: 'prefix', label: 'ID', type: 'text' },
    { id: 'type', label: 'タイプ', type: 'text' },
    { id: 'cfgType', label: '設定タイプ', type: 'text' },
    // itemType は Select で実装するため type: 'dropdown' とする (便宜上)
    { id: 'itemType', label: 'アイテムタイプ', type: 'dropdown' },
    { id: 'pattern1', label: 'パターン1', type: 'nested' }, // subColumns は DetailTable で使用
    { id: 'pattern2', label: 'パターン2', type: 'nested' }, // subColumns は DetailTable で使用
    { id: 'online', label: 'オンライン', type: 'checkbox' },
];
