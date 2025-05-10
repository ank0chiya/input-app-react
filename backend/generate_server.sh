#!/bin/bash

# スクリプトの途中でエラーが発生したら処理を中断する
set -e

# --- 設定項目 ---
# 入力となるOpenAPI仕様ファイル名
OPENAPI_SPEC_FILE="openapi.yaml"
# 生成されるPython-Flaskサーバーコードの出力先ディレクトリ名
OUTPUT_DIR_NAME="output_flask_server"
# 使用するOpenAPI Generatorのジェネレータ名
GENERATOR_NAME="python-flask"
# 使用するDockerイメージ
DOCKER_IMAGE="openapitools/openapi-generator-cli"

# --- 事前チェック ---
# OpenAPI仕様ファイルの存在確認
if [ ! -f "${OPENAPI_SPEC_FILE}" ]; then
  echo "エラー: OpenAPI仕様ファイル '${OPENAPI_SPEC_FILE}' がカレントディレクトリに見つかりません。"
  echo "このスクリプトと同じディレクトリに '${OPENAPI_SPEC_FILE}' を配置してください。"
  exit 1
fi

# Dockerコマンドが利用可能か確認 (簡易的なチェック)
if ! command -v docker &> /dev/null; then
    echo "エラー: Dockerコマンドが見つかりません。Dockerがインストールされ、パスが通っているか確認してください。"
    exit 1
fi

# --- メイン処理 ---
echo "-----------------------------------------------------------------------"
echo "Python-Flask モックサーバーコード生成スクリプト"
echo "-----------------------------------------------------------------------"
echo "入力ファイル: ${OPENAPI_SPEC_FILE}"
echo "出力ディレクトリ: ./${OUTPUT_DIR_NAME}"
echo "使用ジェネレータ: ${GENERATOR_NAME}"
echo "使用Dockerイメージ: ${DOCKER_IMAGE}"
echo ""

# 出力ディレクトリが既に存在する場合、ユーザーに確認 (任意)
if [ -d "${OUTPUT_DIR_NAME}" ]; then
  read -p "出力ディレクトリ '${OUTPUT_DIR_NAME}' は既に存在します。上書きしますか？ (y/N): " choice
  case "$choice" in
    y|Y ) echo "既存のディレクトリを上書きします。";;
    * ) echo "処理を中断しました。"; exit 0;;
  esac
fi

echo "Dockerコンテナを使用してサーバーコードを生成します..."

# Dockerコマンドの実行
# ${PWD} は多くのシェルでカレントディレクトリのフルパスに展開されますが、
# よりポータブルなのは $(pwd) です。
docker run --rm \
    -v "$(pwd):/local" \
    "${DOCKER_IMAGE}" generate \
    -i "/local/${OPENAPI_SPEC_FILE}" \
    -g "${GENERATOR_NAME}" \
    -o "/local/${OUTPUT_DIR_NAME}"

echo ""
echo "-----------------------------------------------------------------------"
echo "サーバーコードの生成が正常に完了しました。"
echo "出力先: $(pwd)/${OUTPUT_DIR_NAME}"
echo "-----------------------------------------------------------------------"
echo ""
echo "--- 次のステップ ---"
echo "1. 生成されたディレクトリに移動してください:"
echo "   cd ${OUTPUT_DIR_NAME}"
echo ""
echo "2. (推奨) Pythonの仮想環境を作成し、有効化してください:"
echo "   python3 -m venv venv"
echo "   source venv/bin/activate  # Linux/macOS の場合"
echo "   # .\\venv\\Scripts\\activate # Windows (PowerShell) の場合"
echo "   # venv\\Scripts\\activate    # Windows (コマンドプロンプト) の場合"
echo ""
echo "3. 必要なPythonライブラリをインストールしてください:"
echo "   pip install -r requirements.txt"
echo ""
echo "4. 生成されたコントローラーファイル (例: openapi_server/controllers/内) を編集し、"
echo "   各APIエンドポイントの関数にモックデータを返すロジックを実装してください。"
echo ""
echo "5. モックサーバーを起動してください (起動方法は生成されたREADME.mdやメインスクリプトによります):"
echo "   例: python3 main.py  または  python3 -m openapi_server"
echo ""
echo "詳細は、生成された '${OUTPUT_DIR_NAME}/README.md' ファイルも参照してください。"
echo "-----------------------------------------------------------------------"

exit 0