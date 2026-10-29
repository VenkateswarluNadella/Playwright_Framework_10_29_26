@api @product
Feature: Get product details
  As an API consumer
  I want to retrieve a product
  So that I can verify the product response contract

  Scenario: Retrieve product information
    When I request the configured product
    Then the product response is successful within 3000 milliseconds
    And the product details are complete
