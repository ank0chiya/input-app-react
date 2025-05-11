#!/bin/bash

# --- 設定 ---
# あなたのOpenAPI仕様ファイルへのパス (ホストマシン上のパス)
# 例: ./openapi.yaml または ./openapi.json
OPENAPI_SPEC_FILE="./openapi.yaml"

# 生成されるクライアントコードの出力先ディレクトリ (ホストマシン上のパス)
# このスクリプトを実行するディレクトリからの相対パスを推奨します。
# 例: ./src/api
OUTPUT_DIR="./api"

# 使用するジェネレータ
GENERATOR="typescript-fetch"

# 生成オプション (必要に応じて調整)
# カンマ区切りで指定
# modelPropertyNaming=camelCase: モデルのプロパティ名をcamelCaseにする
# supportsES6=true: ES6をサポートするコードを生成する
# typescriptThreePlus=true: TypeScript 3+ の機能を利用する
# useSingleRequestParameter=true: 各APIエンドポイントの引数を単一のオブジェクトにまとめる
ADDITIONAL_PROPERTIES="modelPropertyNaming=camelCase,supportsES6=true,typescriptThreePlus=true,useSingleRequestParameter=true"

# 使用するDockerイメージのタグ (stable を推奨)
DOCKER_IMAGE="openapitools/openapi-generator-cli" # バージョンは適宜変更してください

# --- スクリプト本体 ---

echo "使用するDockerイメージ: ${DOCKER_IMAGE}"
echo "OpenAPI仕様 (ホスト): ${OPENAPI_SPEC_FILE}"
echo "出力先ディレクトリ (ホスト): ${OUTPUT_DIR}"
echo "ジェネレータ: ${GENERATOR}"
echo "生成オプション: ${ADDITIONAL_PROPERTIES}"
echo "Dockerコンテナ内でAPIクライアントコードの生成を開始します..."

# 出力ディレクトリが存在しない場合は作成 (ホストマシン上)
mkdir -p "${OUTPUT_DIR}"

# Dockerコンテナを実行してコードを生成
# -v $(pwd):/local : 現在のホストディレクトリをコンテナ内の /local にマウント
# -w /local : コンテナ内の作業ディレクトリを /local に設定
# generate ... : コンテナ内で openapi-generator-cli の generate コマンドを実行
#               パスはコンテナ内の /local を基準にする
docker run --rm \
  -v "$(pwd):/local" \
  -w /local \
  "${DOCKER_IMAGE}" generate \
  -i "${OPENAPI_SPEC_FILE}" \
  -g "${GENERATOR}" \
  -o "${OUTPUT_DIR}" \
  --additional-properties "${ADDITIONAL_PROPERTIES}" \
  --skip-validate-spec # 必要に応じて仕様のバリデーションをスキップ

# 生成結果の確認
# Dockerコマンドの終了ステータスを確認
if [ $? -eq 0 ]; then
  echo "APIクライアントコードの生成が完了しました: ${OUTPUT_DIR}"
else
  echo "APIクライアントコードの生成に失敗しました。"
  exit 1
fi

exit 0