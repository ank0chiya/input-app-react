'use client';

import React, { useState } from 'react';
import { Container, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './old/components/Header';
import ActionButtons from './old/components/ActionButtons';
import TabPanel from './old/components/TabPanel';
import TabbedDataManager from './components/TabbedDataManager';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>設定テーブル</h1>
      <div>
        <TabbedDataManager />
      </div>
    </div>
  );
};

export default HomePage;