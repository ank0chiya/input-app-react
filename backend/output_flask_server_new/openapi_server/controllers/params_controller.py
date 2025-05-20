import connexion
from typing import Dict
from typing import Tuple
from typing import Union

from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.param_creation_input import ParamCreationInput  # noqa: E501
from openapi_server.models.param_input import ParamInput  # noqa: E501
from openapi_server.models.success_response import SuccessResponse  # noqa: E501
from openapi_server import util


def add_attribute_param(prod_id, attribute_code, body):  # noqa: E501
    """Add a parameter to an attribute

     # noqa: E501

    :param prod_id: ID of the product.
    :type prod_id: str
    :param attribute_code: Code of the attribute.
    :type attribute_code: str
    :param param_creation_input: Parameter object to add. Client specifies param_code.
    :type param_creation_input: dict | bytes

    :rtype: Union[SuccessResponse, Tuple[SuccessResponse, int], Tuple[SuccessResponse, int, Dict[str, str]]
    """
    param_creation_input = body
    if connexion.request.is_json:
        param_creation_input = ParamCreationInput.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'


def delete_attribute_param(prod_id, attribute_code, param_code):  # noqa: E501
    """Delete a parameter from an attribute

     # noqa: E501

    :param prod_id: ID of the product.
    :type prod_id: str
    :param attribute_code: Code of the attribute.
    :type attribute_code: str
    :param param_code: Code of the parameter to delete.
    :type param_code: str

    :rtype: Union[None, Tuple[None, int], Tuple[None, int, Dict[str, str]]
    """
    return 'do some magic!'


def update_attribute_param(prod_id, attribute_code, param_code, body):  # noqa: E501
    """Update a parameter of an attribute

     # noqa: E501

    :param prod_id: ID of the product.
    :type prod_id: str
    :param attribute_code: Code of the attribute.
    :type attribute_code: str
    :param param_code: Code of the parameter to update.
    :type param_code: str
    :param param_input: Parameter object to update (param_code is in path).
    :type param_input: dict | bytes

    :rtype: Union[SuccessResponse, Tuple[SuccessResponse, int], Tuple[SuccessResponse, int, Dict[str, str]]
    """
    param_input = body
    if connexion.request.is_json:
        param_input = ParamInput.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'
