import connexion
from typing import Dict, Tuple, Union

from openapi_server.models.attribute_creation_input import AttributeCreationInput
from openapi_server.models.attribute_input import AttributeInput
from openapi_server.models.error import Error
from openapi_server.models.success_response import SuccessResponse
from openapi_server import util

# data.pyからライブデータアクセス関数をインポート
from .data import get_live_data_instance  # 直接ライブデータを取得


def _get_modifiable_product_component_attributes_from_live(prod_id: str):
    """
    指定されたprod_idの製品の最初のコンポーネントの属性リスト（直接参照）と
    属性コードをキーとする属性辞書（現在のスナップショット）をライブデータから返します。
    見つからない場合は (None, None, Error_Object, status_code) を返します。
    返された属性リストへの変更はライブデータに直接反映されます。
    """
    live_data_store = get_live_data_instance()  # 共有ライブデータを取得
    product = live_data_store.get(prod_id)

    if not product:
        error_msg = f"Product with ID {prod_id} not found in live data."
        print(f"Mock: {error_msg}")
        return None, None, Error(code=404, message=error_msg), 404

    # コンポーネントリストが存在し、空でないことを確認
    if (
        "components" not in product
        or not isinstance(product["components"], list)
        or len(product["components"]) == 0
    ):
        # 属性追加のために、存在しない場合はデフォルトコンポーネントを作成する
        print(
            f"Mock: Product {prod_id} has no components. Creating a default component with an empty attributes list."
        )
        product["components"] = [
            {
                "components_type": "default_mock_comp",
                "component_name": "Default Mock Component",
                "deliv_flg": True,
                "label_cls": "0",
                "attributes": [],  # 空の属性リストで初期化
            }
        ]

    # 最初のコンポーネントを対象とする
    component = product["components"][0]

    # 属性リストが存在することを確認 (リストでなければ初期化)
    if "attributes" not in component or not isinstance(component["attributes"], list):
        print(
            f"Mock: First component of product {prod_id} has no 'attributes' list. Initializing."
        )
        component["attributes"] = []

    attributes_list_ref = component[
        "attributes"
    ]  # これはライブデータ内のリストへの直接参照
    # attributes_dict は現在の状態のスナップショットとして便利
    attributes_dict = {
        attr.get("attribute_code"): attr
        for attr in attributes_list_ref
        if isinstance(attr, dict) and attr.get("attribute_code")
    }

    return attributes_list_ref, attributes_dict, None, None


def add_product_attribute(prod_id, body):  # noqa: E501
    """Add an attribute to a product's component"""
    print(f"Mock: add_product_attribute called for prod_id: {prod_id}")

    attribute_creation_input = None
    if connexion.request.is_json:
        try:
            attribute_creation_input = AttributeCreationInput.from_dict(
                connexion.request.get_json()
            )
            if not attribute_creation_input:
                raise ValueError("Deserialized input is None")
            print(
                f"Mock: Received attribute_creation_input: {attribute_creation_input.to_dict()}"
            )
        except Exception as e:
            print(
                f"Mock: Error deserializing AttributeCreationInput or invalid data: {e}"
            )
            return Error(code=400, message=f"Invalid request body: {e}").to_dict(), 400

    if not attribute_creation_input:
        return (
            Error(
                code=400,
                message="Request body is missing, not valid JSON, or failed to deserialize.",
            ).to_dict(),
            400,
        )

    # ライブデータから変更可能な属性リストを取得
    attributes_list_ref, attributes_dict, error_obj, status_code = (
        _get_modifiable_product_component_attributes_from_live(prod_id)
    )
    if error_obj:
        return error_obj.to_dict(), status_code

    attr_code = attribute_creation_input.attribute_code

    if not attr_code:  # AttributeCreationInputでattribute_codeは必須のはず
        return Error(code=400, message="attribute_code is required.").to_dict(), 400

    if attr_code in attributes_dict:
        error_msg = (
            f"Attribute with code {attr_code} already exists for product {prod_id}."
        )
        print(f"Mock: {error_msg}")
        return Error(code=409, message=error_msg).to_dict(), 409

    # 新しい属性データを作成
    new_attribute_data = {
        "attribute_code": attr_code,
        "disp_name": attribute_creation_input.disp_name,
        "unit": attribute_creation_input.unit,
        "type": attribute_creation_input.type,
        "required_flg": getattr(attribute_creation_input, "required_flg", False),
        "params": [],  # paramsは別エンドポイントで管理するので空で初期化
    }

    # タイプ固有のプロパティを追加
    if attribute_creation_input.type == "type1":
        if not hasattr(
            attribute_creation_input, "type1_number"
        ):  # CreationInputで必須のはず
            return (
                Error(
                    code=400, message="type1_number is required for type1 attribute."
                ).to_dict(),
                400,
            )
        new_attribute_data["type1_number"] = attribute_creation_input.type1_number
    elif attribute_creation_input.type == "type2":
        # CreationInputで必須のはず
        if not all(
            hasattr(attribute_creation_input, f)
            for f in ["type2_number", "max", "min", "increment"]
        ):
            return (
                Error(
                    code=400,
                    message="type2_number, max, min, increment are required for type2 attribute.",
                ).to_dict(),
                400,
            )
        new_attribute_data.update(
            {
                "type2_number": attribute_creation_input.type2_number,
                "max": attribute_creation_input.max,
                "min": attribute_creation_input.min,
                "increment": attribute_creation_input.increment,
            }
        )
    elif attribute_creation_input.type == "type3":
        type3_fields = [
            "data_type",
            "setting_type",
            "mgmt_flg",
            "sec_mask",
            "input_format",
            "width",
            "max",
            "min",
            "list_flg",
            "ui_flg",
            "api_cls",
            "edit_cls",
            "cont_cls",
            "sort_order",
            "init_online",
            "init_paper",
            "check",
        ]  # required_flgは共通で取得済み
        # CreationInputで必須なものは存在チェックを強化すべき
        for field in type3_fields:
            if (
                hasattr(attribute_creation_input, field)
                and getattr(attribute_creation_input, field) is not None
            ):
                new_attribute_data[field] = getattr(attribute_creation_input, field)
    else:
        return (
            Error(
                code=400,
                message=f"Unknown attribute type: {attribute_creation_input.type}",
            ).to_dict(),
            400,
        )

    attributes_list_ref.append(new_attribute_data)  # ライブデータを直接変更
    print(f"Mock: Attribute {attr_code} added to product {prod_id} in live data.")

    return SuccessResponse(message="Attribute added successfully.").to_dict(), 201


def delete_product_attribute(prod_id, attribute_code):  # noqa: E501
    """Delete an attribute from a product's component"""
    print(
        f"Mock: delete_product_attribute called for prod_id: {prod_id}, attribute_code: {attribute_code}"
    )

    attributes_list_ref, attributes_dict, error_obj, status_code = (
        _get_modifiable_product_component_attributes_from_live(prod_id)
    )
    if error_obj:
        return error_obj.to_dict(), status_code

    if attribute_code not in attributes_dict:
        error_msg = (
            f"Attribute with code {attribute_code} not found for product {prod_id}."
        )
        print(f"Mock: {error_msg}")
        return Error(code=404, message=error_msg).to_dict(), 404

    # ライブデータ内のリストを直接変更
    original_len = len(attributes_list_ref)
    for i in range(len(attributes_list_ref) - 1, -1, -1):
        if (
            isinstance(attributes_list_ref[i], dict)
            and attributes_list_ref[i].get("attribute_code") == attribute_code
        ):
            del attributes_list_ref[i]
            break

    if len(attributes_list_ref) < original_len:
        print(
            f"Mock: Attribute {attribute_code} deleted from product {prod_id} in live data."
        )
        return "", 204
    else:  # Should not happen if found in attributes_dict
        return (
            Error(
                code=500,
                message=f"Internal error: Attribute {attribute_code} found but not deleted.",
            ).to_dict(),
            500,
        )


def update_product_attribute(prod_id, attribute_code, body):  # noqa: E501
    """Update an attribute of a product's component"""
    print(
        f"Mock: update_product_attribute called for prod_id: {prod_id}, attribute_code: {attribute_code}"
    )

    attribute_input = None
    if connexion.request.is_json:
        try:
            attribute_input = AttributeInput.from_dict(connexion.request.get_json())
            if not attribute_input:
                raise ValueError("Deserialized input is None")
            print(f"Mock: Received attribute_input: {attribute_input.to_dict()}")
        except Exception as e:
            print(f"Mock: Error deserializing AttributeInput or invalid data: {e}")
            return Error(code=400, message=f"Invalid request body: {e}").to_dict(), 400

    if not attribute_input:
        return (
            Error(
                code=400,
                message="Request body is missing, not valid JSON, or failed to deserialize.",
            ).to_dict(),
            400,
        )

    attributes_list_ref, attributes_dict, error_obj, status_code = (
        _get_modifiable_product_component_attributes_from_live(prod_id)
    )
    if error_obj:
        return error_obj.to_dict(), status_code

    if attribute_code not in attributes_dict:
        error_msg = (
            f"Attribute with code {attribute_code} not found for product {prod_id}."
        )
        print(f"Mock: {error_msg}")
        return Error(code=404, message=error_msg).to_dict(), 404

    attr_to_update = attributes_dict[
        attribute_code
    ]  # これはライブデータ内の辞書への参照

    if attribute_input.type != attr_to_update.get("type"):
        error_msg = f"Attribute type mismatch. Cannot change type from {attr_to_update.get('type')} to {attribute_input.type}."
        print(f"Mock: {error_msg}")
        return Error(code=400, message=error_msg).to_dict(), 400

    # 共通フィールドの更新 (ライブデータを直接変更)
    attr_to_update["disp_name"] = attribute_input.disp_name
    attr_to_update["unit"] = attribute_input.unit
    attr_to_update["required_flg"] = getattr(
        attribute_input, "required_flg", attr_to_update.get("required_flg", False)
    )

    # type別フィールドの更新
    if attribute_input.type == "type1":
        if hasattr(attribute_input, "type1_number"):  # AttributeInputで必須のはず
            attr_to_update["type1_number"] = attribute_input.type1_number
    elif attribute_input.type == "type2":
        # AttributeInputで必須のはず
        for field in ["type2_number", "max", "min", "increment"]:
            if hasattr(attribute_input, field):
                attr_to_update[field] = getattr(attribute_input, field)
    elif attribute_input.type == "type3":
        type3_fields_to_update = [
            "data_type",
            "setting_type",
            "mgmt_flg",
            "sec_mask",
            "input_format",
            "width",
            "max",
            "min",
            "list_flg",
            "ui_flg",
            "api_cls",
            "edit_cls",
            "cont_cls",
            "sort_order",
            "init_online",
            "init_paper",
            "check",
        ]
        for field in type3_fields_to_update:
            if (
                hasattr(attribute_input, field)
                and getattr(attribute_input, field) is not None
            ):  # Noneでない値でのみ更新
                attr_to_update[field] = getattr(attribute_input, field)

    print(
        f"Mock: Attribute {attribute_code} updated for product {prod_id} in live data. New data: {attr_to_update}"
    )
    return SuccessResponse(message="Attribute updated successfully.").to_dict(), 200
