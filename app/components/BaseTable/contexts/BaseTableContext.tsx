import { Attribute, Product } from '@/app/types';
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
}

const BaseTableContext = createContext<BaseTableContextType | undefined>(undefined);

interface BaseTableProviderProps {
    children: React.ReactNode;
    baseTableData: Product[];
    onDataChange: (updatedRow: Product, rowIndex: number) => void;
    onAddRow: (rowIndex: number) => void;
    onDeleteRow: (rowIndex: number) => void;
}

export function BaseTableProvider({
    children,
    baseTableData,
    onDataChange,
    onAddRow,
    onDeleteRow,
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
    // パラメータを指定位置の後に追加するハンドラ
    const handleAddAttribute = useCallback(
        (rowIndex: number, attributeIndex?: number) => {
            const targetRow = baseTableData[rowIndex];
            if (!targetRow) return;
            const maxId = Math.max(...targetRow.attributes.map((attr) => attr.attributeId), 0);

            const sortOrder = attributeIndex !== undefined ? attributeIndex + 1 : 0;
            const newAttribute = createNewAttribute(maxId + 1, sortOrder);

            let updatedAttributes;
            if (attributeIndex === undefined || attributeIndex === -1) {
                // パラメータがない場合は最初のパラメータとして追加
                updatedAttributes = [newAttribute];
            } else {
                // 指定されたパラメータの後に新しいパラメータを挿入
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

    const value = {
        tableData: baseTableData,
        onDataChange,
        onAddRow,
        onDeleteRow,
        handleTestContext,
        handleAddRow,
        handleDeleteRow,
        handleAddAttribute
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
