import connexion
from typing import Dict
from typing import Tuple
from typing import Union

from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.refresh_mock_data200_response import (
    RefreshMockData200Response,
)  # noqa: E501
from openapi_server import util

from flask import request, jsonify
from . import data

def refresh_mock_data():  # noqa: E501
    """
    POST /refresh
    Reset all mock data to its initial state
    """
    try:
        data.initialize_data()  # data.pyの初期化関数を呼び出す
        response_message = {"message": "Mock data has been reset to the initial state."}
        return jsonify(response_message), 200
    except Exception as e:
        # 実際のエラーハンドリングでは、より詳細なログ出力やエラー構造を検討
        error_message = {
            "message": "An error occurred while resetting data.",
            "error": str(e),
        }
        return jsonify(error_message), 500
