import unittest

from flask import json

from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.product import Product  # noqa: E501
from openapi_server.test import BaseTestCase


class TestProductsController(BaseTestCase):
    """ProductsController integration test stubs"""

    def test_list_products(self):
        """Test case for list_products

        List all products
        """
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/products',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
