import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import FirstTabTable from './FirstTabTable';
import SecondTabTable from './SecondTabTable';
import { TableRowType, Column } from '../data';

interface TabPanelProps {
  data: TableRowType[];
  firstTabColumns: Column[];
  secondTabColumns: Column[];
  activeTab: number;
  onTabChange: (newValue: number) => void;
  onDataChange: (rowId: string, fieldId: string, value: any) => void;
  onSubItemChange: (rowId: string, subItemIndex: number, fieldId: string, value: any) => void;
  onAddSubItem: (rowId: string, tabIndex: number) => void;
  onRemoveSubItem: (rowId: string, subItemIndex: number, tabIndex: number) => void;
}

interface TabContentProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabContent: React.FC<TabContentProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const TabPanel: React.FC<TabPanelProps> = ({
  data,
  firstTabColumns,
  secondTabColumns,
  activeTab,
  onTabChange,
  onDataChange,
  onSubItemChange,
  onAddSubItem,
  onRemoveSubItem
}) => {
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    onTabChange(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="入力テーブルタブ">
          <Tab label="基本情報" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="詳細情報" id="tab-1" aria-controls="tabpanel-1" />
        </Tabs>
      </Box>
      <TabContent value={activeTab} index={0}>
        <FirstTabTable
          data={data}
          columns={firstTabColumns}
          onDataChange={onDataChange}
          onSubItemChange={onSubItemChange}
          onAddSubItem={(rowId) => onAddSubItem(rowId, 0)}
          onRemoveSubItem={(rowId, index) => onRemoveSubItem(rowId, index, 0)}
        />
      </TabContent>
      <TabContent value={activeTab} index={1}>
        <SecondTabTable
          data={data}
          columns={secondTabColumns}
          onDataChange={onDataChange}
          onSubItemChange={onSubItemChange}
          onAddSubItem={(rowId) => onAddSubItem(rowId, 1)}
          onRemoveSubItem={(rowId, index) => onRemoveSubItem(rowId, index, 1)}
        />
      </TabContent>
    </Box>
  );
};

export default TabPanel;
