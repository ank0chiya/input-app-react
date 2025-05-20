import unittest

from flask import json

from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.param_input import ParamInput  # noqa: E501
from openapi_server.models.success_response import SuccessResponse  # noqa: E501
from openapi_server.test import BaseTestCase


class TestParamsController(BaseTestCase):
    """ParamsController integration test stubs"""

    def test_add_attribute_param(self):
        """Test case for add_attribute_param

        Add a parameter to an attribute
        """
        param_input = {"order_stop_data":"order_stop_data","disp_name":"disp_name","sort_order":0}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/api/products/{prod_id}/attributes/{attribute_code}/params'.format(prod_id='prod_id_example', attribute_code='attribute_code_example'),
            method='POST',
            headers=headers,
            data=json.dumps(param_input),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_delete_attribute_param(self):
        """Test case for delete_attribute_param

        Delete a parameter from an attribute
        """
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/products/{prod_id}/attributes/{attribute_code}/params/{param_code}'.format(prod_id='prod_id_example', attribute_code='attribute_code_example', param_code='param_code_example'),
            method='DELETE',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_update_attribute_param(self):
        """Test case for update_attribute_param

        Update a parameter of an attribute
        """
        param_input = {"order_stop_data":"order_stop_data","disp_name":"disp_name","sort_order":0}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/api/products/{prod_id}/attributes/{attribute_code}/params/{param_code}'.format(prod_id='prod_id_example', attribute_code='attribute_code_example', param_code='param_code_example'),
            method='PUT',
            headers=headers,
            data=json.dumps(param_input),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
