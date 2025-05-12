import connexion
from typing import Dict
from typing import Tuple
from typing import Union

from openapi_server.models.attribute import Attribute  # noqa: E501
from openapi_server.models.attribute_input import AttributeInput  # noqa: E501
from openapi_server.models.error import Error  # noqa: E501
from openapi_server import util

from flask import request, jsonify
from . import data


def add_attribute(product_id, body):  # noqa: E501
    """Add a new attribute to a specific product (without params)"""
    if product_id not in data.DB["products"]:
        return jsonify({"message": "Product not found"}), 404

    # bodyはconnexionによってバリデーションされ、辞書として渡される想定
    # AttributeInputスキーマにはparamsが含まれない
    attribute_input = body

    new_attr_id = data.get_next_attribute_id(product_id)
    new_attribute_data = {
        "attribute_id": new_attr_id,
        "code": attribute_input.get("code"),
        "data_type": attribute_input.get("data_type"),
        "disp_name": attribute_input.get("disp_name"),
        "unit": attribute_input.get("unit"),
        "contract": attribute_input.get("contract"),
        "public": attribute_input.get("public", False),  # デフォルト値の考慮
        "masking": attribute_input.get("masking", False),
        "online": attribute_input.get("online", False),
        "sort_order": attribute_input.get("sort_order", 0),
        "params": [],  # 新規作成時はparamsは空
    }

    data.DB["products"][product_id]["attributes"].append(new_attribute_data)
    return jsonify(Attribute.from_dict(new_attribute_data)), 201


def delete_attribute(product_id, attribute_id):  # noqa: E501
    """Delete a specific attribute from a product"""
    if product_id not in data.DB["products"]:
        return jsonify({"message": "Product not found"}), 404

    product_attributes = data.DB["products"][product_id].get("attributes", [])
    original_len = len(product_attributes)

    data.DB["products"][product_id]["attributes"] = [
        attr for attr in product_attributes if attr.get("attribute_id") != attribute_id
    ]

    if len(data.DB["products"][product_id]["attributes"]) == original_len:
        return jsonify({"message": "Attribute not found"}), 404

    return "", 204


def update_attribute(product_id, attribute_id, body):  # noqa: E501
    """Update an existing attribute (without managing params list directly)"""
    if product_id not in data.DB["products"]:
        return jsonify({"message": "Product not found"}), 404

    product_attributes = data.DB["products"][product_id].get("attributes", [])
    attr_to_update = None
    attr_idx = -1
    for i, attr in enumerate(product_attributes):
        if attr.get("attribute_id") == attribute_id:
            attr_to_update = attr
            attr_idx = i
            break

    if not attr_to_update:
        return jsonify({"message": "Attribute not found"}), 404

    # AttributeInputスキーマにはparamsが含まれない
    update_data = body

    # params以外のフィールドを更新
    attr_to_update["code"] = update_data.get("code", attr_to_update["code"])
    attr_to_update["data_type"] = update_data.get(
        "data_type", attr_to_update["data_type"]
    )
    attr_to_update["disp_name"] = update_data.get(
        "disp_name", attr_to_update["disp_name"]
    )
    attr_to_update["unit"] = update_data.get("unit", attr_to_update["unit"])
    attr_to_update["contract"] = update_data.get("contract", attr_to_update["contract"])
    attr_to_update["public"] = update_data.get("public", attr_to_update["public"])
    attr_to_update["masking"] = update_data.get("masking", attr_to_update["masking"])
    attr_to_update["online"] = update_data.get("online", attr_to_update["online"])
    attr_to_update["sort_order"] = update_data.get(
        "sort_order", attr_to_update["sort_order"]
    )
    # paramsリストはこのエンドポイントでは変更しない

    data.DB["products"][product_id]["attributes"][attr_idx] = attr_to_update
    return jsonify(Attribute.from_dict(attr_to_update)), 200
