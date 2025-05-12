# data.py
import copy  # deepcopyを使用するためにインポート

# 初期データのスナップショット (この内容は変更されないようにする)
# このデータは、以前のやり取りで定義した初期データ構造に基づきます
_INITIAL_PRODUCTS_SNAPSHOT = [
    {
        "prod_id": 0,
        "prefix": "abc",
        "prd_type": "abc00",
        "cfg_type": "abcdef",
        "sort_order": 0,
        "attributes": [
            {
                "attribute_id": 0,
                "code": "attr1",
                "data_type": "string",
                "disp_name": "属性1",
                "unit": "",
                "contract": "type1",
                "public": True,
                "masking": False,
                "online": True,
                "sort_order": 0,
                "params": [
                    {
                        "param_id": 0,
                        "code": "code1",
                        "disp_name": "コード1",
                        "sort_order": 0,
                        "type": "type1",
                    },
                    {
                        "param_id": 1,
                        "code": "code2",
                        "disp_name": "コード2",
                        "sort_order": 1,
                        "type": "type1",
                    },
                ],
            },
            {
                "attribute_id": 1,
                "code": "attr2",
                "data_type": "string",
                "disp_name": "属性2",
                "unit": "",
                "contract": "type2",
                "public": False,
                "masking": True,
                "online": False,
                "sort_order": 1,
                "params": [
                    {
                        "param_id": 0,
                        "min": 1,
                        "increment": 2,
                        "sort_order": 0,
                        "type": "type2",
                    },
                ],
            },
            {  # ユーザーデータ例から contract: '' で params が type3 のケース
                "attribute_id": 2,
                "code": "attr_type3_contract_empty",
                "data_type": "string",
                "disp_name": "属性3空契約",
                "unit": "",
                "contract": "",
                "public": False,
                "masking": True,
                "online": False,
                "sort_order": 2,
                "params": [
                    {
                        "param_id": 0,
                        "code": "code_c_empty_p_t3",
                        "disp_name": "コード空契約T3",
                        "sort_order": 0,
                        "type": "type3",
                    },
                ],
            },
        ],
    },
    {
        "prod_id": 1,
        "prefix": "def",
        "prd_type": "def00",
        "cfg_type": "abcdef",
        "sort_order": 1,
        "attributes": [
            {
                "attribute_id": 0,
                "code": "attr1_prod1",
                "data_type": "string",
                "disp_name": "属性1製品1",
                "unit": "",
                "contract": "type1",
                "public": True,
                "masking": False,
                "online": True,
                "sort_order": 0,
                "params": [],
            },
            {  # ユーザーデータ例から contract: '' で params が空のケース
                "attribute_id": 1,
                "code": "attr_empty_contract_empty_params",
                "data_type": "string",
                "disp_name": "属性空契約空P",
                "unit": "",
                "contract": "type3",
                "public": False,
                "masking": True,
                "online": False,
                "sort_order": 1,
                "params": [],
            },
        ],
    },
]

# データストア (インメモリ)
DB = {}  # このDBはinitialize_data()によって初期化/リセットされます


def initialize_data():
    """
    データを初期状態にリセットします。
    DBをクリアし、_INITIAL_PRODUCTS_SNAPSHOTからデータを再ロードします。
    IDカウンターも初期データに基づいてリセットします。
    """
    global DB  # グローバル変数DBを変更することを明示
    DB.clear()  # まず既存のデータをすべてクリア

    DB["products"] = {}
    DB["next_product_id"] = 0
    DB["next_attribute_id"] = (
        {}
    )  # Key: prod_id, Value: next attribute_id for that product
    DB["next_param_id"] = {}  # Key: (prod_id, attribute_id), Value: next param_id

    for product_template in _INITIAL_PRODUCTS_SNAPSHOT:
        # スナップショットが変更されないようにディープコピーを使用
        product_data = copy.deepcopy(product_template)

        pid = product_data["prod_id"]
        DB["products"][pid] = product_data

        # 次のProduct IDを更新 (初期データ内の最大ID + 1)
        DB["next_product_id"] = max(DB.get("next_product_id", 0), pid + 1)

        current_max_attr_id_for_product = -1
        if "attributes" in product_data and product_data["attributes"]:
            for attr_data in product_data["attributes"]:
                aid = attr_data["attribute_id"]
                current_max_attr_id_for_product = max(
                    current_max_attr_id_for_product, aid
                )

                current_max_param_id_for_attr = -1
                if "params" in attr_data and attr_data["params"]:
                    for param_data in attr_data["params"]:
                        param_id_val = param_data["param_id"]
                        current_max_param_id_for_attr = max(
                            current_max_param_id_for_attr, param_id_val
                        )
                DB["next_param_id"][(pid, aid)] = current_max_param_id_for_attr + 1
        DB["next_attribute_id"][pid] = current_max_attr_id_for_product + 1


# ID採番ヘルパー関数 (DBのカウンターを使用)
def get_next_product_id():
    pid = DB["next_product_id"]
    DB["next_product_id"] += 1
    DB["next_attribute_id"][pid] = 0  # 新規ProductのAttribute IDカウンターを初期化
    return pid


def get_next_attribute_id(product_id):
    if product_id not in DB["products"]:  # 念のためProduct存在確認
        raise ValueError(
            f"Product with id {product_id} not found for attribute ID generation."
        )
    aid = DB["next_attribute_id"].get(product_id, 0)
    DB["next_attribute_id"][product_id] = aid + 1
    DB["next_param_id"][
        (product_id, aid)
    ] = 0  # 新規AttributeのParam IDカウンターを初期化
    return aid


def get_next_param_id(product_id, attribute_id):
    key = (product_id, attribute_id)
    # 念のため親リソースの存在確認
    if product_id not in DB["products"] or not any(
        attr.get("attribute_id") == attribute_id
        for attr in DB["products"][product_id].get("attributes", [])
    ):
        raise ValueError(
            f"Attribute {attribute_id} in product {product_id} not found for param ID generation."
        )

    param_id_val = DB["next_param_id"].get(key, 0)
    DB["next_param_id"][key] = param_id_val + 1
    return param_id_val


# モジュールロード時に一度初期データをロードする
initialize_data()
