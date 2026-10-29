import type { Locator, Page } from '@playwright/test';

/** Selectors and booking actions for MakeMyTrip flight search results. */
export class FlightResultsPage {
  readonly flightCards: Locator;
  readonly fareOptions: Locator;

  constructor(private readonly page: Page) {
    this.flightCards = page.locator('[data-test="component-clusterSingleCardBody"]');
    this.fareOptions = page.locator('.fareFamilyCardWrapper');
  }

  get firstFlightCard(): Locator {
    return this.flightCards.first();
  }

  get firstAirline(): Locator {
    return this.firstFlightCard.locator('.flightCard__airlineHeading');
  }

  get firstFare(): Locator {
    return this.firstFlightCard.locator('.fareBlock__fareValue');
  }

  get firstFareOption(): Locator {
    return this.fareOptions.first();
  }

  get firstFareType(): Locator {
    return this.firstFareOption.locator('p.fontSize12.capText');
  }

  get firstFareOptionAmount(): Locator {
    return this.firstFareOption.locator('.fontSize18.blackFont');
  }

  /** Expands the first flight card to show available fare options. */
  async openFirstFlightPrices(): Promise<void> {
    await this.firstFlightCard.getByRole('button', { name: 'VIEW PRICES', exact: true }).click();
  }

  /** Opens booking review for the first available fare. */
  async bookFirstFare(): Promise<void> {
    await this.page.getByRole('button', { name: 'BOOK NOW', exact: true }).first().click();
  }
}
