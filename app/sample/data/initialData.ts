// data/initialData.ts
import { TableRowType } from '../types';

export const initialData: TableRowType[] = [
    {
        prefix: 'CFG001',
        type: 'タイプA',
        cfgType: '設定1',
        params: [
            { param: 'param1', paramType: 'string', paramJP: 'パラメータ1', selected: false, public: true, security: false },
            { param: 'param2', paramType: 'number', paramJP: 'パラメータ2', selected: false, public: false, security: true }
        ],
        // selected: false, // 削除
        // public: true,   // 削除
        // security: false,// 削除
        itemType: 'pattern1',
        pattern1: [{ pattern1Value: '値A', pattern1JP: '説明A', pattern1Desc: '備考A' }],
        pattern2: [],
        online: true
    },
    {
        prefix: 'CFG002',
        type: 'タイプB',
        cfgType: '設定2',
        params: [{ param: 'param3', paramType: 'boolean', paramJP: 'パラメータ3', selected: false, public: false, security: false }],
        // selected: false, // 削除
        // public: false,  // 削除
        // security: true, // 削除
        itemType: 'pattern2',
        pattern1: [],
        pattern2: [{ pattern2Min: 0, pattern2Max: 100, pattern2Increment: 5 }],
        online: false
    }
];