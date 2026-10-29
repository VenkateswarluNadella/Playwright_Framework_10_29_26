import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { FlightBookingPage } from '../../pages/flightBookingPage';
import { required, type FrameworkWorld } from '../../hooks/frameworkWorld';
import { logger } from '../../utils/logger';

Given('I open the MakeMyTrip home page', async function (this: FrameworkWorld) {
  await required(this.homePage, 'homePage').open();
});

Then('the MakeMyTrip home page is ready', async function (this: FrameworkWorld) {
  const page = required(this.page, 'page');
  const homePage = required(this.homePage, 'homePage');
  await expect(page).toHaveURL(/makemytrip\.com/i);
  await expect(page).toHaveTitle(/MakeMyTrip/i);
  await expect(homePage.logo).toBeVisible();
  await expect(homePage.flightsTab).toBeVisible();
  await expect(homePage.flightsTab).toBeEnabled();
  await expect(required(this.flightSearchPage, 'flightSearchPage').sourceField).toBeVisible();
  await expect(required(this.flightSearchPage, 'flightSearchPage').destinationField).toBeVisible();
  await expect(required(this.flightSearchPage, 'flightSearchPage').searchButton).toBeVisible();
  await expect(required(this.flightSearchPage, 'flightSearchPage').searchButton).toBeEnabled();
});

When('I search flights using the configured itinerary', async function (this: FrameworkWorld) {
  const data = required(this.testData, 'testData').flight;
  const page = required(this.flightSearchPage, 'flightSearchPage');
  this.selectedFlightRoute = {
    source: data.source,
    sourceCode: data.sourceCode,
    destination: data.destination,
    destinationCode: data.destinationCode,
  };
  await page.selectCities(data.source, data.destination);
  this.selectedFlightDate = await page.selectJourneyDate(data.dateOffsetDays);
  await page.selectTravellers(data.adults, data.children);
  await expect(page.sourceField).toHaveValue(new RegExp(data.source, 'i'));
  await expect(page.destinationField).toHaveValue(new RegExp(data.destination, 'i'));
  await expect(page.travellerCount).toHaveValue(String(data.adults + data.children));
  await page.search();
  logger.info('Flight results displayed', { route: this.selectedFlightRoute });
});

Then('the flight search selections are correct', async function (this: FrameworkWorld) {
  const results = required(this.flightResultsPage, 'flightResultsPage');
  const page = required(this.page, 'page');
  const data = required(this.testData, 'testData').flight;
  const route = required(this.selectedFlightRoute, 'selectedFlightRoute');
  const date = required(this.selectedFlightDate, 'selectedFlightDate').split('-').reverse().join('/');
  await expect(page).toHaveURL(/\/flight\/search/i);

  const resultUrl = new URL(page.url());
  expect(resultUrl.searchParams.get('itinerary')).toBe(
    `${route.sourceCode}-${route.destinationCode}-${date}`,
  );
  expect(resultUrl.searchParams.get('paxType')).toBe(`A-${data.adults}_C-${data.children}_I-0`);

  await expect(results.flightCards.first()).toBeVisible();
  const resultCount = await results.flightCards.count();
  expect(resultCount).toBeGreaterThan(0);
  await expect(results.firstAirline).toBeVisible();
  await expect(results.firstAirline).toHaveText(/\S/);
  await expect(results.firstFare).toBeVisible();
  await expect(results.firstFare).toHaveText(/₹\s*[\d,]+/);
  logger.info('Flight results validated', {
    itinerary: resultUrl.searchParams.get('itinerary'),
    travellers: data.adults + data.children,
    resultCount,
    airline: await results.firstAirline.innerText(),
    fare: await results.firstFare.innerText(),
  });
});

When('I select the first available flight fare', async function (this: FrameworkWorld) {
  const results = required(this.flightResultsPage, 'flightResultsPage');
  const page = required(this.page, 'page');
  await results.openFirstFlightPrices();
  await expect(page.getByRole('button', { name: 'BOOK NOW', exact: true }).first()).toBeVisible();
  expect(await results.fareOptions.count()).toBeGreaterThan(0);
  await expect(results.firstFareType).toBeVisible();
  await expect(results.firstFareType).toHaveText(/\S/);
  await expect(results.firstFareOptionAmount).toHaveText(/₹\s*[\d,]+/);
  const reviewPagePromise = page.waitForEvent('popup');
  await results.bookFirstFare();
  const reviewPage = await reviewPagePromise;
  await reviewPage.waitForURL(/\/flight\/reviewDetails\//i);
  await reviewPage.waitForLoadState('load');
  this.page = reviewPage;
  this.flightBookingPage = new FlightBookingPage(reviewPage);
});

Then('the booking review shows the selected itinerary', async function (this: FrameworkWorld) {
  const booking = required(this.flightBookingPage, 'flightBookingPage');
  const page = required(this.page, 'page');
  const route = required(this.selectedFlightRoute, 'selectedFlightRoute');
  const selectedDate = required(this.selectedFlightDate, 'selectedFlightDate');
  const expectedDateText = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${selectedDate}T12:00:00`));
  await expect(booking.bookingHeading).toBeVisible();
  await expect(booking.itineraryHeading).toContainText(
    new RegExp(`${route.source}\\s*→\\s*${route.destination}`, 'i'),
  );
  await expect(booking.travellerSection).toBeVisible();
  await expect(booking.continueButton).toBeVisible();
  await expect(booking.fareSummary).toBeVisible();
  await expect(page.getByText(expectedDateText, { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/flight\/reviewDetails\//i);
});
