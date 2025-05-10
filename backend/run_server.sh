#!/bin/bash

# スクリプトの途中でエラーが発生したら処理を中断する
set -e

# --- 設定項目 ---
# OpenAPI Generator で生成されたサーバーコードがあるディレクトリ名
SERVER_CODE_DIR_NAME="output_flask_server"

# Docker イメージに関する設定
DOCKER_IMAGE_NAME="my-flask-mock-server" # ビルドするDockerイメージの名前
DOCKER_IMAGE_TAG="latest"                # イメージのタグ

# Docker コンテナに関する設定
CONTAINER_NAME="flask-mock-container"    # 起動するコンテナの名前
HOST_PORT="8080"                         # ホストマシンで公開するポート番号
# コンテナ内でFlaskアプリケーションがリッスンするポート番号
# (生成されたDockerfileやFlaskアプリの設定によります。通常8080か5000)
CONTAINER_INTERNAL_PORT="8080"

# --- 事前チェック ---
# サーバーコードディレクトリの存在確認
if [ ! -d "${SERVER_CODE_DIR_NAME}" ]; then
  echo "エラー: サーバーコードディレクトリ '${SERVER_CODE_DIR_NAME}' がカレントディレクトリに見つかりません。"
  echo "OpenAPI Generatorでサーバーコードを生成したディレクトリでこのスクリプトを実行するか、"
  echo "SERVER_CODE_DIR_NAME変数を正しいディレクトリ名に設定してください。"
  exit 1
fi

# Dockerfileの存在確認
if [ ! -f "${SERVER_CODE_DIR_NAME}/Dockerfile" ]; then
  echo "エラー: '${SERVER_CODE_DIR_NAME}/Dockerfile' が見つかりません。"
  echo "指定されたディレクトリにDockerfileが存在することを確認してください。"
  exit 1
fi

# Dockerコマンドが利用可能か確認 (簡易的なチェック)
if ! command -v docker &> /dev/null; then
    echo "エラー: Dockerコマンドが見つかりません。Dockerがインストールされ、パスが通っているか確認してください。"
    exit 1
fi

# --- メイン処理 ---
echo "-----------------------------------------------------------------------"
echo "Python-Flask モックサーバー (Docker) 起動スクリプト"
echo "-----------------------------------------------------------------------"
echo "サーバーコード ディレクトリ: ./${SERVER_CODE_DIR_NAME}"
echo "ビルドするイメージ名: ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
echo "起動するコンテナ名: ${CONTAINER_NAME}"
echo "ポートマッピング (ホスト:コンテナ): ${HOST_PORT}:${CONTAINER_INTERNAL_PORT}"
echo ""

# --- 1. Dockerイメージのビルド ---
echo "[ステップ1/3] Dockerイメージをビルドします (タグ: ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG})..."
# Dockerfile があるディレクトリをビルドコンテキストとして指定
docker build -t "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" "${SERVER_CODE_DIR_NAME}"
echo "Dockerイメージのビルドが完了しました。"
echo ""

# --- 2. 既存の同名コンテナがあれば停止・削除 ---
# `docker ps -a --format '{{.Names}}'` で全コンテナ名を取得し、grepで完全一致検索
if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}$"; then
  echo "[ステップ2/3] 既存のコンテナ '${CONTAINER_NAME}' が見つかりました。停止・削除します..."
  docker stop "${CONTAINER_NAME}" >/dev/null # エラーメッセージを抑制し、存在しない場合の失敗を防ぐ
  docker rm "${CONTAINER_NAME}" >/dev/null   # 同上
  echo "既存のコンテナ '${CONTAINER_NAME}' を停止・削除しました。"
else
  echo "[ステップ2/3] 既存のコンテナ '${CONTAINER_NAME}' は見つかりませんでした。スキップします。"
fi
echo ""

# --- 3. Dockerコンテナの起動 ---
echo "[ステップ3/3] Dockerコンテナ '${CONTAINER_NAME}' を起動します..."
docker run -d \
    -p "${HOST_PORT}:${CONTAINER_INTERNAL_PORT}" \
    --name "${CONTAINER_NAME}" \
    "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"

echo ""
echo "-----------------------------------------------------------------------"
echo "コンテナ '${CONTAINER_NAME}' がバックグラウンドで起動しました。"
echo "-----------------------------------------------------------------------"
echo ""
echo "--- サーバーへのアクセス方法 ---"
echo "Webブラウザやcurlコマンドなどで、以下のURLにアクセスして動作を確認してください。"
echo "ベースURL (例): http://localhost:${HOST_PORT}/"
echo "（具体的なAPIエンドポイントは、OpenAPI仕様や生成されたサーバーのルーティングによります）"
echo ""
echo "--- コンテナログの確認 ---"
echo "サーバーのログを確認するには、以下のコマンドを実行してください:"
echo "  docker logs ${CONTAINER_NAME}"
echo "リアルタイムでログを追跡するには '-f' オプションを追加します:"
echo "  docker logs -f ${CONTAINER_NAME}"
echo ""
echo "--- コンテナの停止 ---"
echo "起動したコンテナを停止するには、以下のコマンドを実行してください:"
echo "  docker stop ${CONTAINER_NAME}"
echo ""
echo "--- コンテナの削除 (停止後) ---"
echo "停止したコンテナを削除するには、以下のコマンドを実行してください:"
echo "  docker rm ${CONTAINER_NAME}"
echo "-----------------------------------------------------------------------"

exit 0