import unittest

from flask import json

from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.refresh_mock_data200_response import RefreshMockData200Response  # noqa: E501
from openapi_server.test import BaseTestCase


class TestUtilitiesController(BaseTestCase):
    """UtilitiesController integration test stubs"""

    def test_refresh_mock_data(self):
        """Test case for refresh_mock_data

        Reset all mock data to its initial state
        """
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/refresh',
            method='POST',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
