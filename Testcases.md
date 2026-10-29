##Test Cases and Automation Requirements##

Current UI scope override: only the MakeMyTrip Flight End-to-End Flow is active. The hotel and bus sections and their corresponding page objects in this original requirements document are out of scope. The live destination is displayed as Bengaluru (BLR), and the booking-review page opens in a new tab when BOOK NOW is selected; only this expected booking tab is captured.

Read Playwright-context.md first.

Generate a complete Playwright + TypeScript + Cucumber BDD automation framework from scratch.

Framework must use:

Playwright
TypeScript
Cucumber BDD
Page Object Model
Fixtures
Hooks
Session Context
APIRequestContext
HTML Reporting
Screenshots
Traces
Videos
Generate production-ready code only.

UI AUTOMATION
Application URL

https://www.makemytrip.com

Create separate feature files, step definitions, page objects, fixtures, and hooks.

FEATURE 1: FLIGHT END-TO-END FLOW
Feature Name:

Flight Booking Flow

Scenario:

Search Flight and Validate Booking Review Details

Test Steps
Launch MakeMyTrip

Validate Home Page Loaded

Click Flights Tab

Enter Source City

Hyderabad

Enter Destination City

Bangalore

Select Future Journey Date

Select Travellers

Adults = 2

Children = 1

Click Apply

Click Search

Validate Search Results Page

Capture Search Information

Source
Destination
Journey Date
Traveller Count
Click View Prices for First Available Flight

Select Any Available Fare

Click Book Now

Click Continue

Navigate To Booking Review Page

Mandatory Assertions
Homepage Assertions
Validate:

✓ MakeMyTrip Logo Visible

✓ Flights Tab Visible

✓ Flights Tab Enabled

✓ Search Button Visible

✓ Search Button Enabled

✓ Source Field Visible

✓ Destination Field Visible

Search Selection Assertions
Validate:

✓ Hyderabad Displayed

✓ Bangalore Displayed

✓ Future Date Selected

✓ Adult Count = 2

✓ Child Count = 1

✓ Total Traveller Count = 3

Search Results Assertions
Validate:

✓ Search Result URL Contains Flight Search

✓ Results Section Visible

✓ Flight Count Greater Than Zero

✓ Flight Cards Visible

✓ Flight Name Visible

✓ Airline Information Visible

✓ Flight Price Visible

✓ Departure Time Visible

✓ Arrival Time Visible

✓ Duration Visible

Fare Selection Assertions
Validate:

✓ View Prices Button Clicked Successfully

✓ Fare Options Displayed

✓ Fare Amount Displayed

✓ Fare Type Displayed

✓ Book Now Displayed

Booking Review Assertions
Validate:

✓ Source City Matches Search Input

✓ Destination City Matches Search Input

✓ Travel Date Matches Search Input

✓ Adult Count = 2

✓ Child Count = 1

✓ Total Traveller Count = 3

✓ Flight Name Visible

✓ Airline Visible

✓ Departure Time Visible

✓ Arrival Time Visible

✓ Total Fare Visible

✓ Traveller Details Section Visible

✓ Contact Information Section Visible

✓ Continue Button Visible

FEATURE 2: HOTEL END-TO-END FLOW
Feature Name:

Hotel Booking Flow

Scenario:

Search Hotel and Validate Hotel Detail Page

Test Steps
Launch MakeMyTrip

Click Hotels

Enter City

Bangalore

Select Check-in Date

Select Check-out Date

Select Guests

Rooms = 1

Adults = 2

Click Apply

Click Search

Open First Available Hotel

Hotel Assertions
Search Page
Validate:

✓ Hotels Tab Selected

✓ City Displayed

✓ Check-in Date Displayed

✓ Check-out Date Displayed

✓ Room Count Correct

✓ Adult Count Correct

Hotel Results Page
Validate:

✓ Results Page Loaded

✓ Hotel Count Greater Than Zero

✓ Hotel Name Visible

✓ Rating Visible

✓ Price Visible

✓ Address Visible

✓ Hotel Images Visible

Hotel Detail Page
Validate:

✓ Hotel Name Displayed

✓ Rating Displayed

✓ Address Displayed

✓ Amenities Visible

✓ Room Section Visible

✓ Price Section Visible

✓ Hotel Images Visible

✓ Book Now Button Visible

✓ Property Description Visible

FEATURE 3: BUS END-TO-END FLOW
Feature Name:

Bus Search Flow

Scenario:

Search Buses and Validate Bus Details

Test Steps
Launch MakeMyTrip

Click Buses

Enter Source

Hyderabad

Enter Destination

Vijayawada

Select Future Journey Date

Click Search

Open First Bus

Bus Assertions
Search Page
Validate:

✓ Bus Tab Selected

✓ Source Displayed

✓ Destination Displayed

✓ Date Displayed

Results Page
Validate:

✓ Results Loaded

✓ Bus Count Greater Than Zero

✓ Bus Operator Visible

✓ Fare Visible

✓ Departure Time Visible

✓ Arrival Time Visible

✓ Duration Visible

✓ Seats Available Visible

Bus Detail Validation
Validate:

✓ Bus Operator Displayed

✓ Source Correct

✓ Destination Correct

✓ Boarding Point Available

✓ Dropping Point Available

✓ Fare Visible

✓ Available Seats Displayed

API AUTOMATION
Base URL

https://dummyjson.com

Create a separate API framework.

Keep API automation independent from UI automation.

Use:

APIRequestContext
Base API Client
Request Models
Response Validation
API SCENARIO 1
Feature Name:

Get Product Details

Scenario:

Retrieve Product Information

Request

GET

/products/1

Assertions

Validate:

✓ Status Code = 200

✓ Response Time < 3000 ms

✓ Product ID Exists

✓ Product Title Exists

✓ Category Exists

✓ Description Exists

✓ Price Greater Than Zero

✓ Rating Exists

✓ Stock Exists

✓ Thumbnail Exists

API SCENARIO 2
Feature Name:

User Login

Scenario:

Authenticate User

Request

POST

/auth/login

Payload

{ "username": "emilys", "password": "emilyspass" }

Assertions

Validate:

✓ Status Code = 200

✓ Access Token Exists

✓ Refresh Token Exists

✓ User Id Exists

✓ First Name Exists

✓ Last Name Exists

✓ Email Exists

✓ Username Exists

✓ No Null Values

API SCENARIO 3
Feature Name:

API Chaining

Scenario:

Login → Get User Profile → Get User Todos

Step 1

POST

/auth/login

Extract:

✓ Access Token

✓ User Id

Assertions:

✓ Status Code = 200

✓ Token Present

Step 2

GET

/auth/me

Pass:

Bearer Token

Extract:

✓ User Id

Assertions:

✓ Status Code = 200

✓ User Id Exists

✓ Username Exists

✓ Email Exists

✓ First Name Exists

✓ Last Name Exists

Step 3

GET

/todos/user/{userId}

Pass User Id from Step 2

Assertions:

✓ Status Code = 200

✓ Todo Array Exists

✓ Todo Count Greater Than Zero

Validate Every Todo Contains

✓ id

✓ todo

✓ completed

✓ userId

FOLDER STRUCTURE
src/

├── features/ │ ├── features/ui/ │ ├── flights.feature │ ├── hotels.feature │ └── buses.feature │ ├── features/api/ │ ├── getProduct.feature │ ├── login.feature │ └── apiChaining.feature │ ├── step-definitions/ │ ├── step-definitions/ui/ │ ├── flights.steps.ts │ ├── hotels.steps.ts │ └── buses.steps.ts │ ├── step-definitions/api/ │ ├── product.steps.ts │ ├── login.steps.ts │ └── apiChaining.steps.ts │ ├── pages/ │ ├── HomePage.ts │ ├── FlightSearchPage.ts │ ├── FlightResultsPage.ts │ ├── FlightBookingPage.ts │ ├── HotelSearchPage.ts │ ├── HotelResultsPage.ts │ ├── HotelDetailsPage.ts │ ├── BusSearchPage.ts │ ├── BusResultsPage.ts │ └── BusDetailsPage.ts │ ├── api/ │ ├── clients/ │ │ ├── BaseApiClient.ts │ │ ├── ProductApiClient.ts │ │ ├── AuthApiClient.ts │ │ └── TodoApiClient.ts │ │ │ ├── models/ │ └── validators/ │ ├── fixtures/ │ ├── baseFixture.ts │ ├── pageFixture.ts │ └── apiFixture.ts │ ├── hooks/ │ ├── hooks.ts │ └── world.ts │ ├── utils/ │ ├── ConfigManager.ts │ ├── Logger.ts │ ├── TestDataLoader.ts │ └── Helpers.ts │ ├── test-data/ │ ├── reports/ │ ├── screenshots/ │ ├── traces/ │ ├── videos/ │ ├── playwright.config.ts │ ├── cucumber.js │ ├── package.json │ ├── tsconfig.json │ └── Jenkinsfile

DELIVERABLES
Generate:

Complete Folder Structure

package.json

tsconfig.json

playwright.config.ts

cucumber.js

Fixtures

Hooks

Session Context Management

Utility Classes

Logger

Environment Management

Flight Feature Implementation

Hotel Feature Implementation

Bus Feature Implementation

API Client Framework

GET API Test

POST API Test

API Chaining Test

Reporting Configuration

Jenkinsfile

Generate implementation-ready code.

Do not generate pseudo code.

Generate file-by-file enterprise-ready Playwright framework.