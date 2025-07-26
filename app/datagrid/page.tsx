'use client';

import * as React from 'react';
import {
    DataGrid,
    GridActionsCellItem,
    GridRowModes,
    GridRowModesModel,
    GridColDef,
    GridRowId,
    GridRowParams,
    MuiEvent,
    GridCallbackDetails,
    GridRow,
    GridRowProps,
} from '@mui/x-data-grid';
import { Box, Button, Typography, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, InputLabel, FormControl, Chip, type SelectChangeEvent, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

// dnd-kitのインポート
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


import type { Row, EditToolbarProps } from './type';
import { getSampleInitialRows } from './data';
// Zustandストアをインポート
import { useStore } from './store';
// 修正: Zustandの汎用useStoreフックをインポート
import { useStore as useZustandStore } from 'zustand';

// ツールバーのPropsを拡張
interface ControlToolbarProps {
    allGroups: string[];
    selectedGroups: string[];
    onGroupChange: (event: SelectChangeEvent<string[]>) => void;
}

// フィルタリング機能を持つControlToolbarを作成
function ControlToolbar(props: ControlToolbarProps) {
    const { allGroups, selectedGroups, onGroupChange } = props;
    // 修正: zundoの状態を正しく購読する
    const { undo, redo, futureStates, pastStates } = useZustandStore(useStore.temporal);

    return (
        <Box
            sx={{
                borderBottom: 1,
                borderColor: 'divider',
                p: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="group-select-label">Groups</InputLabel>
                <Select
                    labelId="group-select-label"
                    id="group-select"
                    multiple
                    value={selectedGroups}
                    onChange={onGroupChange}
                    input={<OutlinedInput label="Groups" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip key={value} label={value} />
                            ))}
                        </Box>
                    )}
                >
                    {allGroups.map((group) => (
                        <MenuItem key={group} value={group}>
                            <Checkbox checked={selectedGroups.indexOf(group) > -1} />
                            <ListItemText primary={group} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {/* Undo/Redoボタン */}
            <Box>
                <Tooltip title="Undo">
                    <span>
                        <IconButton onClick={() => undo()} disabled={pastStates.length === 0}>
                            <UndoIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title="Redo">
                     <span>
                        <IconButton onClick={() => redo()} disabled={futureStates.length === 0}>
                            <RedoIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        </Box>
    );
}

// AddRecordボタン用のフッターコンポーネント
interface AddRecordFooterProps extends EditToolbarProps {
    allGroups: string[];
    selectedGroups: string[];
}

function AddRecordFooter(props: AddRecordFooterProps) {
    const { setRows, setRowModesModel, allGroups, selectedGroups } = props;

    const handleAddClick = () => {
        const id = crypto.randomUUID();
        const targetGroup = selectedGroups.length > 0 ? selectedGroups[0] : allGroups[0];
        if (!targetGroup) return;
        setRows((oldRows) => [...oldRows, { id, name: '', age: '', job: '', group: targetGroup, isNew: true }]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    return (
        <Box
            sx={{
                borderTop: 1,
                borderColor: 'divider',
                p: 1,
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <Button color="primary" startIcon={<AddIcon />} onClick={handleAddClick} disabled={allGroups.length === 0}>
                Add record
            </Button>
        </Box>
    );
}


// listenersを渡すためのContextを作成
const SortableRowContext = React.createContext<{ listeners?: ReturnType<typeof useSortable>['listeners'] }>({});

// SortableRowコンポーネント
interface SortableRowProps extends GridRowProps {
    firstInGroupMap: Map<GridRowId, boolean>;
}

function SortableRow(props: SortableRowProps) {
    const { firstInGroupMap, ...other } = props;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.rowId });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 'auto',
        position: 'relative',
    };
    
    const isNewGroup = firstInGroupMap.get(other.rowId);

    return (
        <Box
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
             {isNewGroup && !isDragging && (
                <Box
                    sx={{
                        backgroundColor: 'grey.200',
                        p: 1,
                        pl: 2,
                        fontWeight: 'bold',
                        width: '100%',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="subtitle2" component="div">{other.row.group}</Typography>
                </Box>
            )}
            <SortableRowContext.Provider value={{ listeners }}>
                <GridRow 
                    {...other} 
                />
            </SortableRowContext.Provider>
        </Box>
    );
}


export default function FullFeaturedCrudGrid() {
    // useStateをZustandストアに置き換え
    const { 
        rows, setRows, 
        rowModesModel, setRowModesModel,
        allGroups, setAllGroups,
        selectedGroups, setSelectedGroups
    } = useStore();

    React.useEffect(() => {
        const clientInitialRows = getSampleInitialRows();
        setRows(clientInitialRows);
        const uniqueGroups = [...new Set(clientInitialRows.map(r => r.group).filter(Boolean))] as string[];
        setAllGroups(uniqueGroups);
        setSelectedGroups(uniqueGroups);
    }, [setRows, setAllGroups, setSelectedGroups]);

    const filteredRows = React.useMemo(() => {
        return rows.filter(row => selectedGroups.includes(row.group || ''));
    }, [rows, selectedGroups]);

    const firstInGroupMap = React.useMemo(() => {
        const map = new Map<GridRowId, boolean>();
        if (filteredRows.length === 0) return map;
        map.set(filteredRows[0].id, true);
        for (let i = 1; i < filteredRows.length; i++) {
            if (filteredRows[i].group !== filteredRows[i - 1].group) {
                map.set(filteredRows[i].id, true);
            }
        }
        return map;
    }, [filteredRows]);

    const handleGroupChange = (event: SelectChangeEvent<string[]>) => {
        const {
          target: { value },
        } = event;
        setSelectedGroups(
          typeof value === 'string' ? value.split(',') : value,
        );
      };

    const handleRowEditStart = (
        params: GridRowParams,
        event: MuiEvent,
        details: GridCallbackDetails,
    ) => {
        event.defaultMuiPrevented = true;
    };

    const handleRowEditStop = (
        params: GridRowParams,
        event: MuiEvent,
        details: GridCallbackDetails,
    ) => {
        event.defaultMuiPrevented = true;
    };


    const handleEditClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow?.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow: Row, oldRow: Row): Promise<Row> => {
        const updatedRow = { ...newRow, isNew: false };
        
        if (updatedRow.group && !allGroups.includes(updatedRow.group)) {
            setAllGroups((prev) => [...prev, updatedRow.group!]);
        }
        
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        
        console.log('Row updated:', updatedRow);

        return Promise.resolve(updatedRow);
    };

    const handleProcessRowUpdateError = (error: any) => {
        console.error(error);
    };
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }

        setRows((currentRows) => {
            const activeRow = currentRows.find((row) => row.id === active.id);
            const overRow = currentRows.find((row) => row.id === over.id);

            if (!activeRow || !overRow) {
                return currentRows;
            }

            const oldIndex = currentRows.findIndex((row) => row.id === active.id);
            const newIndex = currentRows.findIndex((row) => row.id === over.id);
            
            let newRows: Row[];

            if (activeRow.isNew) {
                newRows = arrayMove(currentRows, oldIndex, newIndex);
                const movedRowIndex = newRows.findIndex(row => row.id === active.id);
                newRows[movedRowIndex] = { ...newRows[movedRowIndex], group: overRow.group };
            } else if (activeRow.group !== overRow.group) {
                return currentRows;
            } else {
                newRows = arrayMove(currentRows, oldIndex, newIndex);
            }
            
            console.log('Rows reordered:', newRows);
            return newRows;
        });
    };
    
    const DragHandle = () => {
        const { listeners } = React.useContext(SortableRowContext);
        return (
            <Button
                variant="text"
                sx={{ cursor: 'grab', minWidth: 'auto', padding: '4px', margin: '-4px' }}
                {...listeners}
            >
                <DragIndicatorIcon />
            </Button>
        );
    };

    const columns: GridColDef<Row>[] = [
        {
            field: 'drag-handle',
            headerName: '',
            width: 60,
            align: 'center',
            sortable: false,
            renderCell: () => <DragHandle />,
        },
        { field: 'name', headerName: 'Name', width: 200, editable: true },
        { field: 'age', headerName: 'Age', type: 'number', editable: true, align: 'left', headerAlign: 'left' },
        { field: 'job', headerName: 'Job', width: 220, editable: true },
        { field: 'group', headerName: 'Group' }, 
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: (params: GridRowParams) => {
                const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            key="save"
                            icon={<SaveIcon />}
                            label="Save"
                            onClick={handleSaveClick(params.id)}
                            color="primary"
                        />,
                        <GridActionsCellItem
                            key="cancel"
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(params.id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        key="edit"
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(params.id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        key="delete"
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(params.id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Box sx={{ height: 500, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <ControlToolbar 
                    allGroups={allGroups}
                    selectedGroups={selectedGroups}
                    onGroupChange={handleGroupChange}
                />
                <Box sx={{ flexGrow: 1 }}>
                    <SortableContext items={filteredRows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            editMode="row"
                            rowModesModel={rowModesModel}
                            onRowModesModelChange={setRowModesModel}
                            onRowEditStart={handleRowEditStart}
                            onRowEditStop={handleRowEditStop}
                            processRowUpdate={processRowUpdate}
                            onProcessRowUpdateError={handleProcessRowUpdateError}
                            slots={{
                                row: (props) => <SortableRow {...props} firstInGroupMap={firstInGroupMap} />,
                            }}
                            columnVisibilityModel={{
                                group: false,
                            }}
                            hideFooter
                            showCellVerticalBorder={false}
                            showColumnVerticalBorder={false}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-row, & .MuiDataGrid-cell': {
                                    border: 'none',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                },
                                '--DataGrid-rowBorderColor': 'transparent',
                            }}
                        />
                    </SortableContext>
                </Box>
                <AddRecordFooter
                    setRows={setRows}
                    setRowModesModel={setRowModesModel}
                    allGroups={allGroups}
                    selectedGroups={selectedGroups}
                />
            </Box>
        </DndContext>
    );
}
