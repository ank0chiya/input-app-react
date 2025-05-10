'use client';

import React, { useState } from 'react';
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
