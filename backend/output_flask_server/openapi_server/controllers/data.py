# data.py
import copy  # deepcopyを使用するためにインポート

# 初期データのスナップショット (この内容は変更されないようにする)
# このデータは、以前のやり取りで定義した初期データ構造に基づきます
_INITIAL_PRODUCTS_SNAPSHOT = [
    {
        "productId": 0,
        "prefix": "abc",
        "type": "abc00",
        "cfgType": "abcdef",
        "sortOrder": 0,
        "attributes": [
            {
                "attributeId": 0,
                "attribute": "attr1",
                "attributeType": "string",
                "attributeJP": "属性1",
                "attributeUnit": "",
                "contract": "type1",
                "public": True,
                "masking": False,
                "online": True,
                "sortOrder": 0,
                "params": [
                    {
                        "paramId": 0,
                        "code": "code1",
                        "dispName": "コード1",
                        "sortOrder": 0,
                        "type": "type1",
                    },
                    {
                        "paramId": 1,
                        "code": "code2",
                        "dispName": "コード2",
                        "sortOrder": 1,
                        "type": "type1",
                    },
                ],
            },
            {
                "attributeId": 1,
                "attribute": "attr2",
                "attributeType": "string",
                "attributeJP": "属性2",
                "attributeUnit": "",
                "contract": "type2",
                "public": False,
                "masking": True,
                "online": False,
                "sortOrder": 1,
                "params": [
                    {
                        "paramId": 0,
                        "min": 1,
                        "increment": 2,
                        "sortOrder": 0,
                        "type": "type2",
                    },
                ],
            },
            {  # ユーザーデータ例から contract: '' で params が type3 のケース
                "attributeId": 2,
                "attribute": "attr_type3_contract_empty",
                "attributeType": "string",
                "attributeJP": "属性3空契約",
                "attributeUnit": "",
                "contract": "",
                "public": False,
                "masking": True,
                "online": False,
                "sortOrder": 2,
                "params": [
                    {
                        "paramId": 0,
                        "code": "code_c_empty_p_t3",
                        "dispName": "コード空契約T3",
                        "sortOrder": 0,
                        "type": "type3",
                    },
                ],
            },
        ],
    },
    {
        "productId": 1,
        "prefix": "def",
        "type": "def00",
        "cfgType": "abcdef",
        "sortOrder": 1,
        "attributes": [
            {
                "attributeId": 0,
                "attribute": "attr1_prod1",
                "attributeType": "string",
                "attributeJP": "属性1製品1",
                "attributeUnit": "",
                "contract": "type1",
                "public": True,
                "masking": False,
                "online": True,
                "sortOrder": 0,
                "params": [],
            },
            {  # ユーザーデータ例から contract: '' で params が空のケース
                "attributeId": 1,
                "attribute": "attr_empty_contract_empty_params",
                "attributeType": "string",
                "attributeJP": "属性空契約空P",
                "attributeUnit": "",
                "contract": "type3",
                "public": False,
                "masking": True,
                "online": False,
                "sortOrder": 1,
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
    )  # Key: productId, Value: next attributeId for that product
    DB["next_param_id"] = {}  # Key: (productId, attributeId), Value: next paramId

    for product_template in _INITIAL_PRODUCTS_SNAPSHOT:
        # スナップショットが変更されないようにディープコピーを使用
        product_data = copy.deepcopy(product_template)

        pid = product_data["productId"]
        DB["products"][pid] = product_data

        # 次のProduct IDを更新 (初期データ内の最大ID + 1)
        DB["next_product_id"] = max(DB.get("next_product_id", 0), pid + 1)

        current_max_attr_id_for_product = -1
        if "attributes" in product_data and product_data["attributes"]:
            for attr_data in product_data["attributes"]:
                aid = attr_data["attributeId"]
                current_max_attr_id_for_product = max(
                    current_max_attr_id_for_product, aid
                )

                current_max_param_id_for_attr = -1
                if "params" in attr_data and attr_data["params"]:
                    for param_data in attr_data["params"]:
                        paramid_val = param_data["paramId"]
                        current_max_param_id_for_attr = max(
                            current_max_param_id_for_attr, paramid_val
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
        attr.get("attributeId") == attribute_id
        for attr in DB["products"][product_id].get("attributes", [])
    ):
        raise ValueError(
            f"Attribute {attribute_id} in product {product_id} not found for param ID generation."
        )

    paramid_val = DB["next_param_id"].get(key, 0)
    DB["next_param_id"][key] = paramid_val + 1
    return paramid_val


# モジュールロード時に一度初期データをロードする
initialize_data()
