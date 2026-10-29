import type { Locator, Page } from '@playwright/test';

/** Selectors for validating the itinerary on the booking review page. */
export class FlightBookingPage {
  readonly bookingHeading: Locator;
  readonly itineraryHeading: Locator;
  readonly travellerSection: Locator;
  readonly continueButton: Locator;
  readonly fareSummary: Locator;

  constructor(page: Page) {
    this.bookingHeading = page.getByRole('heading', { name: 'Complete your booking', exact: true });
    this.itineraryHeading = page.getByRole('heading', { name: /.+\s→\s.+/ });
    this.travellerSection = page.getByRole('heading', { name: 'Traveller Details', exact: true });
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    this.fareSummary = page.getByText('Fare Summary', { exact: true });
  }
}
