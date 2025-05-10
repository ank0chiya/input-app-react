import unittest

from flask import json

from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.param_item import ParamItem  # noqa: E501
from openapi_server.models.param_item_input import ParamItemInput  # noqa: E501
from openapi_server.test import BaseTestCase


class TestParametersController(BaseTestCase):
    """ParametersController integration test stubs"""

    def test_add_param(self):
        """Test case for add_param

        Add a new parameter to a specific attribute
        """
        param_item_input = {"code":"code","sortOrder":0,"type":"type1","dispName":"dispName"}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/api/products/{product_id}/attributes/{attribute_id}/params'.format(product_id=56, attribute_id=56),
            method='POST',
            headers=headers,
            data=json.dumps(param_item_input),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_delete_param(self):
        """Test case for delete_param

        Delete a specific parameter from an attribute
        """
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/products/{product_id}/attributes/{attribute_id}/params/{param_id}'.format(product_id=56, attribute_id=56, param_id=56),
            method='DELETE',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_update_param(self):
        """Test case for update_param

        Update an existing parameter of a specific attribute
        """
        param_item_input = {"code":"code","sortOrder":0,"type":"type1","dispName":"dispName"}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/api/products/{product_id}/attributes/{attribute_id}/params/{param_id}'.format(product_id=56, attribute_id=56, param_id=56),
            method='PUT',
            headers=headers,
            data=json.dumps(param_item_input),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
