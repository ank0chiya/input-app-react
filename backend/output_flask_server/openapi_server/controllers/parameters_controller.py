import connexion
from typing import Dict
from typing import Tuple
from typing import Union

from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.param_item import ParamItem  # noqa: E501
from openapi_server.models.param_item_input import ParamItemInput  # noqa: E501
from openapi_server import util

from flask import request, jsonify
from . import data


def _get_expected_param_type_from_contract(attribute_contract):
    """
    Attributeのcontract値から期待されるParamItemのtypeを決定するヘルパー関数。
    """
    if attribute_contract == "type1":
        return "type1"
    elif attribute_contract == "type2":
        return "type2"
    else:  # contractが 'type1', 'type2' 以外 (空文字列 '' を含む) の場合は 'type3'
        return "type3"


def add_param(product_id, attribute_id, body):  # noqa: E501
    """Add a new parameter to a specific attribute"""
    if product_id not in data.DB["products"]:
        return jsonify({"message": "Product not found"}), 404

    product_attributes = data.DB["products"][product_id].get("attributes", [])
    target_attribute = None
    for attr in product_attributes:
        if attr.get("attribute_id") == attribute_id:
            target_attribute = attr
            break

    if not target_attribute:
        return jsonify({"message": "Attribute not found"}), 404

    param_input = body  # connexion がバリデーション済みの辞書を渡す想定
    param_type_from_request = param_input.get("type")

    # Attribute.contract に基づく期待される ParamItem.type を決定
    attribute_contract = target_attribute.get("contract")
    expected_param_type = _get_expected_param_type_from_contract(attribute_contract)

    if param_type_from_request != expected_param_type:
        return (
            jsonify(
                {
                    "message": f"Parameter type '{param_type_from_request}' is not allowed for attribute with contract '{attribute_contract}'. Expected parameter type: '{expected_param_type}'."
                }
            ),
            409,
        )  # 409 Conflict (リソースの状態と矛盾)

    # --- ここから下は、param作成ロジック (前回と同様) ---
    new_param_id = data.get_next_param_id(product_id, attribute_id)

    new_param_data = {
        "param_id": new_param_id,
        "sort_order": param_input.get("sort_order"),
        "type": param_type_from_request,  # 検証済みなのでリクエストのtypeを使用
    }

    # type に応じたフィールド設定 (前回と同様)
    if param_type_from_request == "type1" or param_type_from_request == "type3":
        new_param_data["code"] = param_input.get("code")
        new_param_data["disp_name"] = param_input.get("disp_name")
    elif param_type_from_request == "type2":
        new_param_data["min"] = param_input.get("min")
        new_param_data["increment"] = param_input.get("increment")
    # ここでの else は不要 (expected_param_type との比較で既に型は絞られているはず)

    if "params" not in target_attribute:
        target_attribute["params"] = []
    target_attribute["params"].append(new_param_data)

    return jsonify(ParamItem.from_dict(new_param_data)), 201


def delete_param(product_id, attribute_id, param_id):  # noqa: E501
    """Delete a specific parameter"""
    if product_id not in data.DB["products"]:
        return jsonify({"message": "Product not found"}), 404

    product_attributes = data.DB["products"][product_id].get("attributes", [])
    target_attribute = None
    for attr in product_attributes:
        if attr.get("attribute_id") == attribute_id:
            target_attribute = attr
            break
    if not target_attribute:
        return jsonify({"message": "Attribute not found"}), 404

    original_len = len(target_attribute.get("params", []))
    target_attribute["params"] = [
        p_data
        for p_data in target_attribute.get("params", [])
        if p_data.get("param_id") != param_id
    ]

    if len(target_attribute["params"]) == original_len:
        return jsonify({"message": "Parameter not found"}), 404

    return "", 204


def update_param(product_id, attribute_id, param_id, body):  # noqa: E501
    """Update an existing parameter"""
    if product_id not in data.DB["products"]:
        return jsonify({"message": "Product not found"}), 404

    product_attributes = data.DB["products"][product_id].get("attributes", [])
    target_attribute = None
    for attr in product_attributes:
        if attr.get("attribute_id") == attribute_id:
            target_attribute = attr
            break
    if not target_attribute:
        return jsonify({"message": "Attribute not found"}), 404

    target_param = None
    param_idx = -1
    for i, p_data in enumerate(target_attribute.get("params", [])):
        if p_data.get("param_id") == param_id:
            target_param = p_data
            param_idx = i
            break

    if not target_param:
        return jsonify({"message": "Parameter not found"}), 404

    update_data = body  # connexion がバリデーション済みの辞書を渡す想定
    requested_new_param_type = update_data.get("type")

    # type がリクエストボディで指定され、かつ既存のtypeから変更しようとしている場合に検証
    if (
        requested_new_param_type is not None
        and requested_new_param_type != target_param.get("type")
    ):
        attribute_contract = target_attribute.get("contract")
        expected_param_type = _get_expected_param_type_from_contract(attribute_contract)

        if requested_new_param_type != expected_param_type:
            return (
                jsonify(
                    {
                        "message": f"Cannot change parameter type to '{requested_new_param_type}' for attribute with contract '{attribute_contract}'. Expected parameter type: '{expected_param_type}'."
                    }
                ),
                409,
            )  # 409 Conflict

    # --- ここから下は、param更新ロジック (前回と同様だが、typeの扱いに注意) ---
    # 更新後のtypeを決定 (リクエストで指定があればそれ、なければ既存のものを維持)
    final_param_type = (
        requested_new_param_type
        if requested_new_param_type is not None
        else target_param.get("type")
    )

    # 基本フィールドの更新
    target_param["sort_order"] = update_data.get(
        "sort_order", target_param.get("sort_order")
    )

    # typeが実際に変更されたか、あるいはリクエストで明示的に指定された場合、
    # 関連フィールドを適切に更新/クリアする
    if (
        final_param_type != target_param.get("type")
        or requested_new_param_type is not None
    ):
        # 既存の型特有フィールドをクリア (新しい型と異なる場合)
        current_internal_type = target_param.get("type")
        if current_internal_type in ["type1", "type3"] and final_param_type not in [
            "type1",
            "type3",
        ]:
            target_param.pop("code", None)
            target_param.pop("disp_name", None)
        elif current_internal_type == "type2" and final_param_type != "type2":
            target_param.pop("min", None)
            target_param.pop("increment", None)

        target_param["type"] = final_param_type  # 新しい型を設定 (または維持)

    # 新しい (または維持された) 型に基づいてフィールドを設定/更新
    if target_param["type"] == "type1" or target_param["type"] == "type3":
        target_param["code"] = update_data.get(
            "code",
            (
                target_param.get("code")
                if target_param["type"] == update_data.get("type", target_param["type"])
                else None
            ),
        )
        target_param["disp_name"] = update_data.get(
            "disp_name",
            (
                target_param.get("disp_name")
                if target_param["type"] == update_data.get("type", target_param["type"])
                else None
            ),
        )
    elif target_param["type"] == "type2":
        target_param["min"] = update_data.get(
            "min",
            (
                target_param.get("min")
                if target_param["type"] == update_data.get("type", target_param["type"])
                else None
            ),
        )
        target_param["increment"] = update_data.get(
            "increment",
            (
                target_param.get("increment")
                if target_param["type"] == update_data.get("type", target_param["type"])
                else None
            ),
        )

    target_attribute["params"][param_idx] = target_param
    return jsonify(ParamItem.from_dict(target_param)), 200
