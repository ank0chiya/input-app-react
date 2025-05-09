import React from 'react';
import DataTable from './components/DataTable'; // パスは適宜調整
import { initialData } from './data/initialData'; // パスは適宜調整
import TabbedDataManager from './components/TabbedDataManager'; // パス調整
import { firstTabTableColumns } from './config/tableColumn'; // パスは適宜調整

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>設定テーブル</h1>
      <div>
        <TabbedDataManager initialData={initialData}/>
      </div>
    </div>
  );
};

export default HomePage;