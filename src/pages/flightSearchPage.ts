import type { Locator, Page } from '@playwright/test';

/** Produces the site calendar label and URL date for the same local calendar day. */
function dateValues(date: Date): { calendarName: string; isoDate: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((value) => value.type === type)?.value ?? '';
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return {
    calendarName: [part('weekday'), part('month'), part('day'), part('year')].join(' '),
    isoDate: `${year}-${month}-${day}`,
  };
}

/** Locators and actions for entering a MakeMyTrip flight search. */
export class FlightSearchPage {
  readonly sourceField: Locator;
  readonly destinationField: Locator;
  readonly searchButton: Locator;
  readonly travellersControl: Locator;
  readonly departureDateControl: Locator;
  readonly sourceAutocomplete: Locator;
  readonly destinationAutocomplete: Locator;
  readonly travellerApplyButton: Locator;
  readonly travellerCount: Locator;

  constructor(private readonly page: Page) {
    this.sourceField = page.locator('#fromCity');
    this.destinationField = page.locator('#toCity');
    this.searchButton = page.getByRole('button', { name: /^search$/i });
    this.travellersControl = page.getByRole('button', { name: /^Travellers/ });
    this.departureDateControl = page.getByRole('button', { name: /^Departure/ });
    this.sourceAutocomplete = page.getByPlaceholder('From', { exact: true });
    this.destinationAutocomplete = page.getByPlaceholder('To', { exact: true });
    this.travellerApplyButton = page.locator('[data-cy="travellerApplyBtn"]');
    this.travellerCount = page.locator('#travellers');
  }

  /** Chooses matching airport suggestions for the source and destination. */
  async selectCities(source: string, destination: string): Promise<void> {
    await this.sourceField.click();
    await this.sourceAutocomplete.fill(source);
    await this.page.getByRole('option', { name: new RegExp(source, 'i') }).first().click();
    await this.destinationField.click();
    await this.destinationAutocomplete.fill(destination);
    await this.page.getByRole('option', { name: new RegExp(destination, 'i') }).first().click();
  }

  /** Selects a date relative to today and returns it in YYYY-MM-DD format. */
  async selectJourneyDate(offsetDays: number): Promise<string> {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offsetDays);
    const { calendarName, isoDate } = dateValues(date);
    await this.departureDateControl.click();
    await this.page.getByRole('gridcell', { name: calendarName, exact: true }).click();
    return isoDate;
  }

  /** Selects the requested adult and child counts and applies the selection. */
  async selectTravellers(adults: number, children: number): Promise<void> {
    await this.travellersControl.click();
    await this.page.locator(`[data-cy="adults-${adults}"]`).click();
    await this.page.locator(`[data-cy="children-${children}"]`).click();
    await this.travellerApplyButton.click();
  }

  /** Submits the search and waits until the flight results page has loaded. */
  async search(): Promise<void> {
    await this.searchButton.click();
    await this.page.waitForURL(/\/flight\/search/i);
    await this.page.waitForLoadState('load');
  }
}
