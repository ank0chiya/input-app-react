import connexion
from typing import Dict
from typing import Tuple
from typing import Union

from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.product import Product  # noqa: E501
from openapi_server import util

from flask import request, jsonify

from . import data


def get_product_by_id(product_id):  # noqa: E501
    """Get a specific product by its ID"""
    product_data = data.DB["products"].get(product_id)
    if product_data:
        return jsonify(Product.from_dict(product_data)), 200
    else:
        return jsonify({"message": "Product not found"}), 404


def list_products():  # noqa: E501
    """List all products"""
    # data.DB["products"] の値をリストにして返す
    products_list = [
        Product.from_dict(p_data) for p_data in data.DB["products"].values()
    ]
    return jsonify(products_list), 200
