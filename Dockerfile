# ステージ 1: ビルダー (依存関係のインストールとアプリケーションのビルド)
FROM node:20 AS builder

# アプリケーションディレクトリを作成・設定
WORKDIR /app

# package.json と ロックファイルをコピー
COPY package*.json ./

# すべての依存関係をインストール (ビルドにdevDependenciesが必要なため)
RUN npm install

# アプリケーションコード全体をコピー
COPY . .

# 環境変数を本番モードに設定
ENV NODE_ENV=production

# アプリケーションをビルド (output: 'standalone' が有効になっている想定)
RUN npm run build

# ステージ 2: ランナー (軽量イメージでビルド成果物を実行)
FROM node:20-alpine AS runner

# アプリケーションディレクトリを作成・設定
WORKDIR /app

# 環境変数を本番モードに設定
ENV NODE_ENV=production
# 必要に応じて NEXT_TELEMETRY_DISABLED=1 を設定してテレメトリを無効化
# ENV NEXT_TELEMETRY_DISABLED 1

# 非ルートユーザーを作成・設定 (セキュリティ向上のため)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ビルダーステージから必要なファイルのみをコピー
# 1. standalone ディレクトリ (サーバー実行に必要なファイル群)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 2. public ディレクトリ (存在する場合)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# 3. static ディレクトリ (.next/static) (最適化された静的アセット)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ユーザーを切り替え
USER nextjs

# Next.js が使用するポートを開放
EXPOSE 3000

# ポートを環境変数で指定可能にする (任意)
ENV PORT 3000

# アプリケーションを実行 (standaloneモードのサーバーを実行)
CMD ["node", "server.js"]