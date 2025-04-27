import React from 'react';
import { Box, Button } from '@mui/material';
import { TableRowType } from '../data';

interface ActionButtons2Props {
  data: TableRowType[];
  onDownload: () => void;
  onRegister: () => void;
}

const ActionButtons2: React.FC<ActionButtons2Props> = ({ data, onDownload, onRegister }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={onDownload}
      >
        JSONダウンロード
      </Button>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={onRegister}
      >
        データ登録
      </Button>
      {/* 後から追加するボタンのためのスペース */}
    </Box>
  );
};

export default ActionButtons2;
