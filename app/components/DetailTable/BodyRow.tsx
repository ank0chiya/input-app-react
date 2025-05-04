// src/components/BodyRow.tsx
import React from 'react';
import { TableRow, TableCell, Box, IconButton, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // パラメータ追加アイコン
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // パラメータ削除アイコン
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // 上矢印アイコンをインポート
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // 下矢印アイコンをインポート
import EditableTableCell from './EditableTableCell';

// types.ts から必要な型をインポート (パスを環境に合わせて調整)
import type { BodyRowProps, ParamType1, ParamType2, ParamType3 } from '@/app/types';

const BodyRow: React.FC<BodyRowProps> = ({
    product,
    attribute,
    paramDetail,
    rowSpanCount,
    isFirstRowOfAttribute,
    handleAttributeChange,
    handleParamChange,
    handleAddParam,
    handleDeleteParam,
    handleMoveParamUp,
    handleMoveParamDown,
}) => {
    // ユニークキー (paramDetailが存在しない場合も考慮)
    const uniqueKey = `${product.productId}-${attribute.attributeId}-${paramDetail?.paramId ?? 'attr-only'}-${isFirstRowOfAttribute ? 'first' : 'other'}`;

    return (
        <TableRow key={uniqueKey} sx={{ '& > td': { border: '1px solid #e0e0e0' } }}>
            {/* --- Product & Attribute Cells (最初の行のみ表示 & rowspan) --- */}
            {isFirstRowOfAttribute && (
                <>
                    <TableCell rowSpan={rowSpanCount} valign="top">
                        <EditableTableCell
                            value={product.prefix}
                            onChange={() => {}}
                            editable={false}
                        />
                    </TableCell>
                    <TableCell rowSpan={rowSpanCount} valign="top">
                        <EditableTableCell
                            value={product.type}
                            onChange={() => {}}
                            editable={false}
                        />
                    </TableCell>
                    <TableCell rowSpan={rowSpanCount} valign="top">
                        <EditableTableCell
                            value={product.cfgType}
                            onChange={() => {}}
                            editable={false}
                        />
                    </TableCell>
                    <TableCell rowSpan={rowSpanCount} valign="top">
                        {attribute.attribute}
                    </TableCell>
                    <TableCell rowSpan={rowSpanCount} valign="top">
                        <EditableTableCell
                            value={attribute.attributeJP}
                            onChange={() => {}}
                            editable={false}
                        />
                    </TableCell>
                    <TableCell rowSpan={rowSpanCount} valign="top">
                        <EditableTableCell
                            value={attribute.contract}
                            onChange={() => {}}
                            editable={false}
                        />
                    </TableCell>
                </>
            )}

            {/* --- Parameter Cells (各行に表示) --- */}
            {/* code */}
            <TableCell>
                {paramDetail && (paramDetail.type === 'type1' || paramDetail.type === 'type3') ? (
                    <EditableTableCell
                        value={paramDetail.code}
                        onChange={(v) =>
                            handleParamChange(
                                product.productId,
                                attribute.attributeId,
                                paramDetail.paramId,
                                'code',
                                v,
                            )
                        }
                    />
                ) : isFirstRowOfAttribute && !paramDetail ? (
                    <span style={{ color: 'grey' }}></span>
                ) : null}
            </TableCell>
            {/* dispName */}
            <TableCell>
                {paramDetail && (paramDetail.type === 'type1' || paramDetail.type === 'type3') ? (
                    <EditableTableCell
                        value={(paramDetail as ParamType1 | ParamType3).dispName}
                        onChange={(v) =>
                            handleParamChange(
                                product.productId,
                                attribute.attributeId,
                                paramDetail.paramId,
                                'dispName',
                                v,
                            )
                        }
                    />
                ) : isFirstRowOfAttribute && !paramDetail ? (
                    <span style={{ color: 'grey' }}></span>
                ) : null}
            </TableCell>
            {/* min */}
            <TableCell>
                {paramDetail && paramDetail.type === 'type2' ? (
                    <EditableTableCell
                        value={(paramDetail as ParamType2).min}
                        onChange={(v) =>
                            handleParamChange(
                                product.productId,
                                attribute.attributeId,
                                paramDetail.paramId,
                                'min',
                                v,
                            )
                        }
                        type="number"
                    />
                ) : isFirstRowOfAttribute && !paramDetail ? (
                    <span style={{ color: 'grey' }}></span>
                ) : null}
            </TableCell>
            {/* increment */}
            <TableCell>
                {paramDetail && paramDetail.type === 'type2' ? (
                    <EditableTableCell
                        value={(paramDetail as ParamType2).increment}
                        onChange={(v) =>
                            handleParamChange(
                                product.productId,
                                attribute.attributeId,
                                paramDetail.paramId,
                                'increment',
                                v,
                            )
                        }
                        type="number"
                    />
                ) : isFirstRowOfAttribute && !paramDetail ? (
                    <span style={{ color: 'grey' }}></span>
                ) : null}
            </TableCell>

            {/* --- online Cell (最初の行のみ表示 & rowspan) --- */}
            {isFirstRowOfAttribute && (
                <TableCell rowSpan={rowSpanCount} valign="top" align="center">
                    <EditableTableCell
                        value={attribute.online}
                        onChange={(v) =>
                            handleAttributeChange(
                                product.productId,
                                attribute.attributeId,
                                'online',
                                v,
                            )
                        }
                        type="boolean"
                    />
                </TableCell>
            )}

            {/* --- Action Cell (各行に表示) --- */}
            <TableCell align="center" sx={{ minWidth: 100 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 0.5,
                    }}
                >
                    {/* --- 上へ移動ボタン --- */}
                    {/* paramDetail が存在する場合のみ（パラメータ行にのみ）表示 */}
                    {paramDetail && (
                        <Tooltip title="Move Up">
                            {/* onClick で handleMoveParamUp を呼び出す */}
                            {/* disabled 属性はハンドラ側で制御するため、ここでは設定しない */}
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                    handleMoveParamUp(
                                        product.productId,
                                        attribute.attributeId,
                                        paramDetail.paramId,
                                    )
                                }
                            >
                                <ArrowUpwardIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* --- 下へ移動ボタン --- */}
                    {/* paramDetail が存在する場合のみ表示 */}
                    {paramDetail && (
                        <Tooltip title="Move Down">
                            {/* onClick で handleMoveParamDown を呼び出す */}
                            {/* disabled 属性はハンドラ側で制御するため、ここでは設定しない */}
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                    handleMoveParamDown(
                                        product.productId,
                                        attribute.attributeId,
                                        paramDetail.paramId,
                                    )
                                }
                            >
                                <ArrowDownwardIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* --- 追加ボタン --- */}
                    {/* 常に表示し、クリックされた行の下に追加 (paramDetailがない場合は最初の要素として追加) */}
                    {attribute.paramHas && ( // paramHasがtrueの場合のみ追加を許可
                        <Tooltip
                            title={paramDetail ? 'Insert Parameter Below' : 'Add First Parameter'}
                        >
                            {/* paramDetail?.paramId が存在すればそれを afterParamId として渡す */}
                            <IconButton
                                size="small"
                                color="success"
                                onClick={() =>
                                    handleAddParam(
                                        product.productId,
                                        attribute.attributeId,
                                        paramDetail?.paramId,
                                    )
                                }
                            >
                                <AddCircleOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* --- 削除ボタン --- */}
                    {/* paramDetail が存在する場合のみ表示 */}
                    {paramDetail && (
                        <Tooltip title="Delete Parameter">
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                    handleDeleteParam(
                                        product.productId,
                                        attribute.attributeId,
                                        paramDetail.paramId,
                                    )
                                }
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
};

export default BodyRow;
