# openapi_server/data.py
import copy

# ユーザー提供のサンプルデータ
_SAMPLE_DATA_LIST_TEMPLATE = [
    {
        "prod_id": "11",
        "components": [
            {
                "components_type": "abcdef",
                "component_name": "abcdef",
                "deliv_flg": True,
                "label_cls": "0",
                "attributes": [
                    {
                        "attribute_code": "acodeg",
                        "disp_name": "attrcodeg",
                        "unit": "G",
                        "type": "type1",
                        "type1_number": 1,
                        "required_flg": False,
                        "params": [
                            {
                                "param_code": "pcode1",
                                "disp_name": "paramcode1",
                                "sort_order": 0,
                                "order_stop_data": "20200920",
                            },
                            {
                                "param_code": "pcode2",
                                "disp_name": "paramcode2",
                                "sort_order": 1,
                                "order_stop_data": "20200920",
                            },
                        ],
                    },
                    {
                        "attribute_code": "acoder",
                        "disp_name": "attrcoder",
                        "unit": "R",
                        "type": "type2",
                        "type2_number": 1,
                        "max": 100,
                        "min": 10,
                        "increment": 5,
                        # type2にはparamsがないサンプル
                    },
                    {
                        "attribute_code": "acodec",
                        "disp_name": "attrcodec",
                        "unit": "C",
                        "type": "type3",
                        "data_type": "string",
                        "setting_type": "select",
                        "mgmt_flg": True,
                        "sec_mask": True,
                        "input_format": "",
                        "width": 100,
                        "max": 10,
                        "min": 1,
                        "required_flg": False,
                        "list_flg": False,
                        "ui_flg": False,
                        "api_cls": "0",
                        "edit_cls": "0",
                        "cont_cls": "0",
                        "sort_order": 1,
                        "init_online": "0",
                        "init_paper": "0",
                        "check": "",
                        "params": [
                            {
                                "param_code": "pcode1",  # type3のparam_codeはtype1のparam_codeと重複しても良いと仮定
                                "disp_name": "paramcode1_type3",
                                "sort_order": 0,
                                # order_stop_dataなしのサンプル
                            },
                            {
                                "param_code": "pcode2",
                                "disp_name": "paramcode2_type3",
                                "sort_order": 1,
                            },
                        ],
                    },
                ],
            }
        ],
    },
    # テスト用の追加データ
    {"prod_id": "product_empty_components", "components": []},
    {
        "prod_id": "12",
        "components": [
            {
                "components_type": "test_comp_empty_attr",
                "component_name": "Test Component Empty Attributes",
                "deliv_flg": True,
                "label_cls": "1",
                "attributes": [],
            }
        ],
    },
]

# prod_idをキーとする辞書のテンプレート
_INITIAL_PRODUCTS_DATA_TEMPLATE = {
    item["prod_id"]: item for item in _SAMPLE_DATA_LIST_TEMPLATE
}

# --- ライブデータストア ---
# mockサーバーの実行中に変更が保持されるデータストア
# 起動時に初期データのディープコピーで初期化される
_live_mock_data = copy.deepcopy(_INITIAL_PRODUCTS_DATA_TEMPLATE)
# -------------------------


def get_live_data_instance():
    """
    現在のライブデータストア（辞書）への参照を返します。
    この参照を介して行われた変更は、サーバーの実行中保持されます。
    """
    return _live_mock_data


def reset_live_data():
    """
    ライブデータストアを初期状態にリセットします。
    """
    global _live_mock_data  # グローバル変数を変更するために宣言
    _live_mock_data = copy.deepcopy(_INITIAL_PRODUCTS_DATA_TEMPLATE)
    print("Mock data store has been reset to its initial state.")


def get_all_products_from_live_data():
    """
    ライブデータストアから全製品データのリストの「ディープコピー」を返します。
    読み取り操作での意図しない変更を防ぐため。
    """
    live_data = get_live_data_instance()
    return copy.deepcopy(list(live_data.values()))


if __name__ == "__main__":
    # 簡単なテストとリセットのデモ
    print("--- Initial Live Data (prod_id: 11, first attr name) ---")
    product_11_initial = get_live_data_instance().get("11")
    if (
        product_11_initial
        and product_11_initial["components"]
        and product_11_initial["components"][0]["attributes"]
    ):
        print(product_11_initial["components"][0]["attributes"][0]["disp_name"])

    # データを変更するシミュレーション
    live_data = get_live_data_instance()
    if (
        "11" in live_data
        and live_data["11"]["components"]
        and live_data["11"]["components"][0]["attributes"]
    ):
        live_data["11"]["components"][0]["attributes"][0][
            "disp_name"
        ] = "MODIFIED IN LIVE DATA"
        print("\n--- After Modifying Live Data (prod_id: 11, first attr name) ---")
        print(live_data["11"]["components"][0]["attributes"][0]["disp_name"])

    # 別の関数がライブデータを取得すると、変更が反映されている
    print("\n--- Accessing Live Data Again (prod_id: 11, first attr name) ---")
    product_11_again = get_live_data_instance().get("11")
    if (
        product_11_again
        and product_11_again["components"]
        and product_11_again["components"][0]["attributes"]
    ):
        print(product_11_again["components"][0]["attributes"][0]["disp_name"])

    # データをリセット
    reset_live_data()
    print("\n--- After Resetting Live Data (prod_id: 11, first attr name) ---")
    product_11_after_reset = get_live_data_instance().get("11")
    if (
        product_11_after_reset
        and product_11_after_reset["components"]
        and product_11_after_reset["components"][0]["attributes"]
    ):
        print(product_11_after_reset["components"][0]["attributes"][0]["disp_name"])

    all_prods = get_all_products_from_live_data()  # これはコピーを返す
    if all_prods and all_prods[0]["components"][0]["attributes"]:
        all_prods[0]["components"][0]["attributes"][0][
            "disp_name"
        ] = "MODIFIED IN COPY"  # コピーを変更

    print(
        "\n--- Live Data after modifying copy from get_all_products_from_live_data ---"
    )
    # 元のライブデータは影響を受けないはず
    product_11_final_check = get_live_data_instance().get("11")
    if (
        product_11_final_check
        and product_11_final_check["components"]
        and product_11_final_check["components"][0]["attributes"]
    ):
        print(product_11_final_check["components"][0]["attributes"][0]["disp_name"])
