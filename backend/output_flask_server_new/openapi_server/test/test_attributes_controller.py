import unittest

from flask import json

from openapi_server.models.attribute_input import AttributeInput  # noqa: E501
from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.success_response import SuccessResponse  # noqa: E501
from openapi_server.test import BaseTestCase


class TestAttributesController(BaseTestCase):
    """AttributesController integration test stubs"""

    def test_add_product_attribute(self):
        """Test case for add_product_attribute

        Add an attribute to a product's component
        """
        attribute_input = {"required_flg":True,"unit":"unit","disp_name":"disp_name","type1_number":0,"type":"type1"}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/api/products/{prod_id}/attributes'.format(prod_id='prod_id_example'),
            method='POST',
            headers=headers,
            data=json.dumps(attribute_input),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_delete_product_attribute(self):
        """Test case for delete_product_attribute

        Delete an attribute from a product's component
        """
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/products/{prod_id}/attributes/{attribute_code}'.format(prod_id='prod_id_example', attribute_code='attribute_code_example'),
            method='DELETE',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_update_product_attribute(self):
        """Test case for update_product_attribute

        Update an attribute of a product's component
        """
        attribute_input = {"required_flg":True,"unit":"unit","disp_name":"disp_name","type1_number":0,"type":"type1"}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/api/products/{prod_id}/attributes/{attribute_code}'.format(prod_id='prod_id_example', attribute_code='attribute_code_example'),
            method='PUT',
            headers=headers,
            data=json.dumps(attribute_input),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
