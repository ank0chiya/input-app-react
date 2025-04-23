// data/initialData.ts
import { TableRowType, PatternDataType } from '../types';

export const initialData: TableRowType[] = [
    {
        prefix: 'CFG001',
        type: 'タイプA',
        cfgType: '設定1',
        params: [
            { param: 'param1', paramType: 'string', paramJP: 'パラメータ1', selected: true, public: true, security: false, itemType: 'pattern1' },
            { param: 'param2', paramType: 'number', paramJP: 'パラメータ2', selected: true, public: false, security: true, itemType: 'pattern1' }
        ],
        online: true
    },
    {
        prefix: 'CFG002',
        type: 'タイプB',
        cfgType: '設定2',
        params: [{ param: 'param3', paramType: 'boolean', paramJP: 'パラメータ3', selected: true, public: false, security: false, itemType: 'pattern2' }],
        online: false
    }
];

export const patternData: PatternDataType[] = [
    {
        cfgType: '設定1',
        param: 'param1',
        itemType: 'pattern1',
        data: [
            { pattern1Value: '値A', pattern1JP: '説明A', pattern1Desc: '備考A' },
            { pattern1Value: '値B', pattern1JP: '説明B', pattern1Desc: '備考B' }],
    },
    {
        cfgType: '設定1',
        param: 'param2',
        itemType: 'pattern1',
        data: [
            { pattern1Value: '値C', pattern1JP: '説明C', pattern1Desc: '備考C' },
            { pattern1Value: '値D', pattern1JP: '説明D', pattern1Desc: '備考D' }],
    },
    {
        cfgType: '設定2',
        param: 'param3',
        itemType: 'pattern2',
        data: [
            { pattern2Min: 0, pattern2Max: 100, pattern2Increment: 5 },
            { pattern2Min: 10, pattern2Max: 200, pattern2Increment: 10 }],
    },
]
