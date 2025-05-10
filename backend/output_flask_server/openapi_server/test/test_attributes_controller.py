import unittest

from flask import json

from openapi_server.models.attribute import Attribute  # noqa: E501
from openapi_server.models.attribute_input import AttributeInput  # noqa: E501
from openapi_server.models.error import Error  # noqa: E501
from openapi_server.test import BaseTestCase


class TestAttributesController(BaseTestCase):
    """AttributesController integration test stubs"""

    def test_add_attribute(self):
        """Test case for add_attribute

        Add a new attribute to a specific product (without params)
        """
        attribute_input = {"attributeUnit":"attributeUnit","masking":True,"public":True,"attributeJP":"attributeJP","attributeType":"attributeType","contract":"contract","sortOrder":0,"online":True,"attribute":"attribute"}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/api/products/{product_id}/attributes'.format(product_id=56),
            method='POST',
            headers=headers,
            data=json.dumps(attribute_input),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_delete_attribute(self):
        """Test case for delete_attribute

        Delete a specific attribute from a product
        """
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/products/{product_id}/attributes/{attribute_id}'.format(product_id=56, attribute_id=56),
            method='DELETE',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_update_attribute(self):
        """Test case for update_attribute

        Update an existing attribute of a specific product (without managing params list directly)
        """
        attribute_input = {"attributeUnit":"attributeUnit","masking":True,"public":True,"attributeJP":"attributeJP","attributeType":"attributeType","contract":"contract","sortOrder":0,"online":True,"attribute":"attribute"}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/api/products/{product_id}/attributes/{attribute_id}'.format(product_id=56, attribute_id=56),
            method='PUT',
            headers=headers,
            data=json.dumps(attribute_input),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
