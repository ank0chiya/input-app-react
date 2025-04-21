|header1|header2|header3|
|:------|:-----:|------:|
|hoge   |fuga   |piyo   |
|hoge   |^      |^      |
|hoge   |fuga   |^      |

| ID | 名前 | カテゴリ | サブアイテム | 選択 |
| --- | --- | --- | 

# tableの修正要望
1. id: selectedのcheckboxが選択されていた場合、詳細情報タブでその行の詳細な入力ができるようになります。
2. アイテムタイプにpattern1を選択した場合、パターン１の入力項目がアクティブになり、入力できるようになり、pattern2を選択した場合、パターン２の入力項目がアクティブになり、入力できるようになります。逆のパターンは、非アクティブになります。
つまり、詳細情報タブのテーブルのヘッダは以下のようになります。  
| ID | タイプ | 設定タイプ | アイテムタイプ | パターン１ 値 | パターン1 説明 | パターン1 備考 | パターン2 最小値 | パターン2 最大値 | パターン2 間隔 | オンライン |  
データも対応する順番に表示されます。
3. 基本情報タブのテーブルのデータはヘッダに対応する入力手段に変更してください。  
例えば、typeがtextの場合は、textboxが表示されるようにしてください。  
パラメータ一覧の id: paramはtypeがtextなのでtextboxが表示されるようにしてください  
現在の表示は、id: paramの表示がcheckboxとなっているので修正してください


// 1つ目のタブのテーブルカラム定義（新）
export const firstTabTableColumns = [
  { id: 'prefix', label: 'ID', type: 'text' },
  { id: 'type', label: 'タイプ', type: 'text' },
  { id: 'cfgType', label: '設定タイプ', type: 'text' },
  { id: 'params', label: 'パラメータ一覧', type: 'nested',
    subColumns: [
        { id: 'param', label: 'パラメータ', type: 'text' },
        { id: 'paramType', label: 'データ型', type: 'text' },
        { id: 'paramJP', label: '日本語名', type: 'text' },
        { id: 'selected', label: '選択', type: 'checkbox' },
        { id: 'public', label: '公開', type: 'checkbox' },
        { id: 'security', label: 'セキュリティ', type: 'checkbox' },
    ]
  },
];

// 2つ目のタブのテーブルカラム定義
export const secondTabTableColumns: Column[] = [
    { id: 'prefix', label: 'ID', type: 'text' },
    { id: 'type', label: 'タイプ', type: 'text' },
    { id: 'cfgType', label: '設定タイプ', type: 'text' },
    { id: 'param', label: 'パラメータ', type: 'text' },
    { id: 'paramType', label: 'データ型', type: 'text' },
    { id: 'paramJP', label: '日本語名', type: 'text' },
    { id: 'itemType', label: 'アイテムタイプ', type: 'dropdown' },
    { id: 'pattern1', label: 'パターン1', type: 'nested' }, // subColumns は DetailTable で使用
    { id: 'pattern2', label: 'パターン2', type: 'nested' }, // subColumns は DetailTable で使用
    { id: 'online', label: 'オンライン', type: 'checkbox' },
];
