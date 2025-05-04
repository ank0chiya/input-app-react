// src/components/Body.tsx
import React from 'react';
import { TableBody } from '@mui/material';
import BodyRow from './BodyRow'; // 作成した BodyRow コンポーネントをインポート
// types.ts から必要な型をインポート (パスを環境に合わせて調整)
import type { TableBodyProps } from '@/app/types';

const Body: React.FC<TableBodyProps> = ({
    products,
    paramsMap,
    handleAttributeChange,
    handleParamChange,
    handleAddParam,
    handleDeleteParam,
    handleMoveParamUp,   // 上へ移動ハンドラを受け取る
    handleMoveParamDown, // 下へ移動ハンドラを受け取る
}) => {
    return (
        <TableBody>
            {products
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((product) =>
                    product.attributes
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .filter((attribute) => attribute.paramHas)
                        .map((attribute) => {
                            const relatedParams = paramsMap.get(
                                `${product.productId}-${attribute.attributeId}`,
                            );
                            const params =
                                attribute.paramHas && relatedParams
                                    ? [...relatedParams.param].sort(
                                          (a, b) => a.sortOrder - b.sortOrder,
                                      )
                                    : [];
                            const rowSpanCount = Math.max(params.length, 1);

                            // Array.from でループし、各反復で BodyRow を呼び出す
                            return Array.from({ length: rowSpanCount }).map((_, paramIndex) => {
                                const paramDetail = params[paramIndex];
                                const isFirstRowOfAttribute = paramIndex === 0;

                                // BodyRow に必要な props を渡す
                                return (
                                    <BodyRow
                                        // key は BodyRow 内で設定されるのでここでは不要かもしれないが念のため設定
                                        key={`${product.productId}-${attribute.attributeId}-${paramDetail?.paramId ?? 'attr-only'}-${paramIndex}`}
                                        product={product}
                                        attribute={attribute}
                                        paramDetail={paramDetail}
                                        rowSpanCount={rowSpanCount}
                                        isFirstRowOfAttribute={isFirstRowOfAttribute}
                                        // すべてのハンドラを BodyRow に渡す
                                        handleAttributeChange={handleAttributeChange}
                                        handleParamChange={handleParamChange}
                                        handleAddParam={handleAddParam}
                                        handleDeleteParam={handleDeleteParam}
                                        handleMoveParamUp={handleMoveParamUp}
                                        handleMoveParamDown={handleMoveParamDown}
                                    />
                                );
                            });
                        }),
                )}
        </TableBody>
    );
};

export default Body;
