import {
    Column,
    SubColumn,
    TransformedHeaderConfig,
    TransformedGroupedHeader,
    TransformedSimpleHeader
} from '../types'; // 調整後の型定義ファイルをインポート

// ヘッダー表示用にデータ構造を変換する関数
export function transformConfigForHeader(config: Column[]): TransformedHeaderConfig[] {
    const transformed: TransformedHeaderConfig[] = [];

    config.forEach((column) => {
        // params のネスト構造を特別扱い
        if (column.id === 'params' && column.type === 'nested' && column.subColumns && Array.isArray(column.subColumns)) {
            const nestedColumn = column; // 型推論で Column & { type: 'nested', subColumns: SubColumn[] } 相当

            // 'param' を含むサブカラムと含まないサブカラムに分割
            // sub.id は keyof ParamType なので includes は文字列として安全に使える
            const paramSubColumns = column.subColumns.filter(sub => (sub.id as string).includes('param'));
            const otherSubColumns = column.subColumns.filter(sub => !(sub.id as string).includes('param'));

            // 'param' を含むサブカラムが存在する場合のみ、グループ化された親要素を追加
            if (paramSubColumns.length > 0) {
                transformed.push({
                    // TransformedGroupedHeader 型に合わせる
                    id: nestedColumn.id,
                    label: nestedColumn.label,
                    type: 'nested', // 型を明示
                    subColumns: paramSubColumns, // 'param' を含むものだけ
                    isGroupedHeader: true,
                });
            }

            // 'param' を含まないサブカラム ('selected' など) を独立した要素として追加
            otherSubColumns.forEach((subCol: SubColumn) => {
                transformed.push({
                    // TransformedSimpleHeader 型に合わせる
                    id: subCol.id, // id は keyof ParamType だが string として扱う
                    label: subCol.label,
                    type: subCol.type, // サブカラムの type ('text' or 'checkbox')
                    isGroupedHeader: false,
                });
            });
        } else if (column.type !== 'nested') {
            // 'params' 以外のネストしていない要素はそのまま SimpleHeader として追加
            transformed.push({
                // TransformedSimpleHeader 型に合わせる
                id: column.id,
                label: column.label,
                type: column.type, // 元の type をそのまま使用
                isGroupedHeader: false,
            });
        }
        // 'params' 以外の 'nested' 型カラムはここでは考慮しない (必要なら別途処理を追加)
    });
    return transformed;
}