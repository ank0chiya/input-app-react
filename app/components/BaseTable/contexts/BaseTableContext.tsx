import { Attribute, Param, Params, Product } from '@/app/types';
import { createContext, useContext, useCallback } from 'react';

interface BaseTableContextType {
    tableData: Product[];
    handleTestContext: (num1: number, num2: number) => void;
    onDataChange: (updatedRow: Product, rowIndex: number) => void;
    onAddRow: (rowIndex: number) => void;
    onDeleteRow: (rowIndex: number) => void;
    handleAddRow: (rowIndex: number) => void;
    handleDeleteRow: (rowIndex: number) => void;
    handleAddAttribute: (rowIndex: number, attributeIndex?: number) => void;
    handleDeleteAttribute: (rowIndex: number, attributeIndex: number) => void;
    handleMoveAttributeUp: (rowIndex: number, attributeIndex: number) => void;
    handleMoveAttributeDown: (rowIndex: number, attributeIndex: number) => void;
    handleProductCellChange: (
        rowIndex: number,
        columnId: keyof Pick<Product, 'prefix' | 'type' | 'cfgType'>,
        value: string,
    ) => void;
    handleAttributeCellChange: (
        rowIndex: number,
        attributeIndex: number,
        columnId: keyof Pick<
            Attribute,
            | 'attribute'
            | 'attributeJP'
            | 'attributeType'
            | 'attributeUnit'
            | 'paramHas'
            | 'contract'
            | 'masking'
            | 'public'
        >,
        value: string | boolean | number,
    ) => void;
}

const BaseTableContext = createContext<BaseTableContextType | undefined>(undefined);

interface BaseTableProviderProps {
    children: React.ReactNode;
    baseTableData: Product[];
    detailTableData: Params[];
    onDataChange: (updatedRow: Product, rowIndex: number) => void;
    onAddRow: (rowIndex: number) => void;
    onDeleteRow: (rowIndex: number) => void;
    setParamsData: React.Dispatch<React.SetStateAction<Params[]>>;
    onAddParamsDataRow: (
        targetRow: Product,
        updatedAttributes: Attribute[],
        attributeIndex: number,
    ) => void;
}

export function BaseTableProvider({
    children,
    baseTableData,
    detailTableData,
    onDataChange,
    onAddRow,
    onDeleteRow,
    setParamsData,
    onAddParamsDataRow
}: BaseTableProviderProps) {
    const handleTestContext = useCallback((num1: number, num2: number) => {
        console.log('test context', num1, num2);
        console.log('test context sum', num1 + num2);
    }, []);

    // 行追加ボタンが押された時のハンドラ (親コンポーネントの関数を呼び出す)
    const handleAddRow = useCallback((rowIndex: number) => onAddRow(rowIndex), [onAddRow]);

    // 行削除ボタンが押された時のハンドラ (親コンポーネントの関数を呼び出す)
    const handleDeleteRow = useCallback((rowIndex: number) => onDeleteRow(rowIndex), [onDeleteRow]);

    // 行データ全体の更新を親コンポーネントに通知する関数
    const handleRowUpdate = useCallback(
        (updatedRow: Product, rowIndex: number) => {
            onDataChange(updatedRow, rowIndex);
        },
        [onDataChange],
    );

    // Productのセル (ID, タイプ, 設定タイプ) の値が変更された時のハンドラ
    // 修正不可にすること TODO
    const handleProductCellChange = useCallback(
        (
            rowIndex: number,
            columnId: keyof Pick<Product, 'prefix' | 'type' | 'cfgType'>,
            value: string,
        ) => {
            const targetRow = baseTableData[rowIndex];
            const updatedRow = { ...targetRow, [columnId]: value };
            handleRowUpdate(updatedRow, rowIndex);
        },
        [baseTableData, handleRowUpdate],
    );

    const handleAttributeCellChange = useCallback(
        (
            rowIndex: number,
            attributeIndex: number,
            columnId: keyof Pick<
                Attribute,
                | 'attribute'
                | 'attributeJP'
                | 'attributeType'
                | 'attributeUnit'
                | 'paramHas'
                | 'contract'
                | 'masking'
                | 'public'
            >,
            value: string | boolean | number,
        ) => {
            const targetRow = baseTableData[rowIndex];
            if (!targetRow) {
                console.error(`Row not found at index ${rowIndex}`);
                return;
            }
            const updatedAttributes = targetRow.attributes.map((attribute, aIndex) =>
                aIndex === attributeIndex ? { ...attribute, [columnId]: value } : attribute,
            );
            const updatedRow = { ...targetRow, attributes: updatedAttributes };
            handleRowUpdate(updatedRow, rowIndex);
            onAddParamsDataRow(targetRow, updatedAttributes, attributeIndex)
        },
        [baseTableData, handleRowUpdate],
    );

    // 新しい属性を作成するヘルパー関数
    const createNewAttribute = (attributeId: number, sortOrder: number): Attribute => {
        return {
            attributeId: attributeId,
            attribute: '',
            attributeType: 'string',
            attributeJP: '',
            attributeUnit: '',
            paramHas: false,
            contract: '',
            public: false,
            masking: false,
            online: false,
            sortOrder: sortOrder,
        };
    };

    // 属性を指定位置の後に追加するハンドラ
    const handleAddAttribute = useCallback(
        (rowIndex: number, attributeIndex?: number) => {
            const targetRow = baseTableData[rowIndex];
            if (!targetRow) return;
            const maxId = Math.max(...targetRow.attributes.map((attr) => attr.attributeId), 0);

            const sortOrder = attributeIndex !== undefined ? attributeIndex + 1 : 0;
            const newAttribute = createNewAttribute(maxId + 1, sortOrder);

            let updatedAttributes;
            if (attributeIndex === undefined || attributeIndex === -1) {
                // 属性がない場合は最初のパラメータとして追加
                updatedAttributes = [newAttribute];
            } else {
                // 指定された属性の後に新しいパラメータを挿入
                updatedAttributes = [
                    ...targetRow.attributes.slice(0, attributeIndex + 1),
                    newAttribute,
                    ...targetRow.attributes.slice(attributeIndex + 1),
                ];
            }

            const updatedRow = {
                ...targetRow,
                attributes: updatedAttributes,
            };
            handleRowUpdate(updatedRow, rowIndex);
        },
        [baseTableData, handleRowUpdate],
    );

    // 属性を削除するハンドラ
    const handleDeleteAttribute = useCallback(
        (rowIndex: number, attributeIndex: number) => {
            const targetRow = baseTableData[rowIndex];
            if (!targetRow || targetRow.attributes.length <= 1) return; // 最後のパラメータは削除不可

            const updatedAttributes = targetRow.attributes.filter(
                (_, aIndex) => aIndex !== attributeIndex,
            );
            const updatedRow = { ...targetRow, attributes: updatedAttributes };
            handleRowUpdate(updatedRow, rowIndex);
        },
        [baseTableData, handleRowUpdate],
    );

    // 属性の順番を上に移動するハンドラ
    const handleMoveAttributeUp = useCallback(
        (rowIndex: number, attributeIndex: number) => {
            const targetRow = baseTableData[rowIndex];
            if (!targetRow || attributeIndex <= 0) return; // 最初のパラメータは上に移動できない

            const updatedAttributes = [...targetRow.attributes];
            // 選択したパラメータと1つ上のパラメータを入れ替え
            [updatedAttributes[attributeIndex], updatedAttributes[attributeIndex - 1]] = [
                updatedAttributes[attributeIndex - 1],
                updatedAttributes[attributeIndex],
            ];

            const updatedRow = { ...targetRow, attributes: updatedAttributes };
            handleRowUpdate(updatedRow, rowIndex);
        },
        [baseTableData, handleRowUpdate],
    );

    // 属性の順番を下に移動するハンドラ
    const handleMoveAttributeDown = useCallback(
        (rowIndex: number, attributeIndex: number) => {
            const targetRow = baseTableData[rowIndex];
            if (!targetRow || attributeIndex >= targetRow.attributes.length - 1) return; // 最後のパラメータは下に移動できない

            const updatedAttributes = [...targetRow.attributes];
            // 選択したパラメータと1つ下のパラメータを入れ替え
            [updatedAttributes[attributeIndex], updatedAttributes[attributeIndex + 1]] = [
                updatedAttributes[attributeIndex + 1],
                updatedAttributes[attributeIndex],
            ];

            const updatedRow = { ...targetRow, attributes: updatedAttributes };
            handleRowUpdate(updatedRow, rowIndex);
        },
        [baseTableData, handleRowUpdate],
    );

    const value = {
        tableData: baseTableData,
        onDataChange,
        onAddRow,
        onDeleteRow,
        handleTestContext,
        handleAddRow,
        handleDeleteRow,
        handleAddAttribute,
        handleDeleteAttribute,
        handleMoveAttributeUp,
        handleMoveAttributeDown,
        handleProductCellChange,
        handleAttributeCellChange,
    };

    return <BaseTableContext.Provider value={value}>{children}</BaseTableContext.Provider>;
}

export function usePattern() {
    const context = useContext(BaseTableContext);
    if (context === undefined) {
        throw new Error('usePattern must be used within a BaseTableProvider');
    }
    return context;
}
