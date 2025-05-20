# openapi_server/controllers/products_controller.py
import connexion
from typing import List, Dict, Tuple, Union

from openapi_server.models.error import Error
from openapi_server.models.product import Product
from openapi_server import util

# data.pyからライブデータから全製品を取得する関数をインポート
from .data import get_all_products_from_live_data  # MODIFIED


def list_products():  # noqa: E501
    """List all products"""
    print("Mock: list_products called")

    try:
        # ライブデータストアから全製品データのディープコピーを取得
        all_products_data_dicts = get_all_products_from_live_data()  # MODIFIED

        product_models = []
        if not isinstance(all_products_data_dicts, list):  # 念のため型チェック
            print(
                f"Mock: Warning - get_all_products_from_live_data did not return a list. Got: {type(all_products_data_dicts)}"
            )
            all_products_data_dicts = []

        for product_data_dict in all_products_data_dicts:
            if not isinstance(product_data_dict, dict):  # 念のため型チェック
                print(
                    f"Mock: Warning - product_data_dict is not a dict: {product_data_dict}"
                )
                continue
            try:
                product_model = Product.from_dict(product_data_dict)
                if product_model:
                    product_models.append(product_model)
                else:
                    print(
                        f"Mock: Warning - Product.from_dict returned None for data: {product_data_dict}"
                    )
            except Exception as e:
                print(
                    f"Mock: Error deserializing a product item: {product_data_dict} - Error: {e}"
                )

        print(f"Mock: Returning {len(product_models)} products from live data.")
        return product_models  # Connexionが200 OKでシリアライズ

    except Exception as e:
        print(f"Mock: Unexpected error in list_products: {e}")
        return (
            Error(
                code=500,
                message="An unexpected error occurred while retrieving products.",
            ).to_dict(),
            500,
        )
