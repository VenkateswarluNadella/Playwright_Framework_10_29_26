@ui @flights
Feature: Flight booking flow
  As a traveller
  I want to search flights and review a booking
  So that I can verify the selected itinerary before purchase

  Scenario: Search flights and validate booking review details
    Given I open the MakeMyTrip home page
    Then the MakeMyTrip home page is ready
    When I search flights using the configured itinerary
    Then the flight search selections are correct
    When I select the first available flight fare
    Then the booking review shows the selected itinerary
