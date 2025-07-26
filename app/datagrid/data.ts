// データからランダムなID生成を分離
const sampleData = [
    {
        group: 'IT',
        Users: [
            { name: 'Taro Yamada', age: 28, job: 'Developer' },
            { name: 'Hanako Suzuki', age: 34, job: 'Designer' },
            { name: 'Jiro Sato', age: 42, job: 'Project Manager' },
        ],
    },
    {
        group: 'Marketing',
        Users: [
            { name: 'Keiko Tanaka', age: 30, job: 'Marketing Specialist' },
            { name: 'Hiroshi Watanabe', age: 45, job: 'Marketing Director' },
        ],
    },
    {
        group: 'Sales',
        Users: [
            { name: 'Yuki Ito', age: 25, job: 'Sales Representative' },
            { name: 'Takeshi Kobayashi', age: 38, job: 'Sales Manager' },
        ],
    },
];

/**
 * クライアントサイドで呼び出されると、
 * 一意のIDを持つフラットな行データを生成して返す関数
 */
export const getSampleInitialRows = () => {
    return sampleData.flatMap(groupData => 
        groupData.Users.map(user => ({
            ...user,
            id: crypto.randomUUID(), // IDは関数呼び出し時にクライアントで生成
            group: groupData.group,
        }))
    );
};
