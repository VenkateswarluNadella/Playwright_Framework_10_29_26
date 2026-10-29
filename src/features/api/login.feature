@api @auth
Feature: User login
  As an API consumer
  I want to authenticate with valid credentials
  So that I receive usable authentication tokens

  Scenario: Authenticate a configured user
    When I log in with the configured API account
    Then the login response contains valid tokens and user details
