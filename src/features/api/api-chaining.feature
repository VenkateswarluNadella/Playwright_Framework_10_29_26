@api @auth @chaining
Feature: API chaining
  As an authenticated API consumer
  I want to retrieve my profile and todos
  So that the authenticated user id is reused across requests

  Scenario: Login then get the current user and user todos
    When I log in with the configured API account
    Then the login response contains valid tokens and user details
    When I request the current user using the access token
    Then the current user response matches the authenticated user
    When I request todos for the authenticated user
    Then the todos response is valid for that user
