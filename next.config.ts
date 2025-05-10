import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    output: 'standalone',
    reactStrictMode: false,
    // 開発用設定（CORS回避）
    async rewrites() {
        return [
            {
                source: '/api-proxy/:path*', // フロントエンドがアクセスするパス
                // 実際のAPIサーバーのURL (ポート番号やベースパスを環境に合わせてください)
                destination: 'http://localhost:8080/api/:path*',
                // もしAPIサーバーのベースパスが /api なら destination: 'http://localhost:8080/api/:path*'
            },
        ];
    },
};

export default nextConfig;
