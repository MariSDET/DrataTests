# Take-home assignments solution

## Assignment 1
For assignment 1, we use the Playwright framework.
To test every page we rely on sitemap.xml to provide a list of pages. Then, we create a test case per page.
Each test is fairly generic; it tests a number of console errors, page title and the presence of a link to the site's root page.

```
Assumptions

Known Errors in Drata Project:

Access to Documentation: We currently do not have access to comprehensive Drata documentation. Consequently, our understanding of the system and its potential issues might be incomplete.
Existence of Known Errors: We are operating under the assumption that there are known errors within the Drata project. These errors have presumably been identified and documented in prior audits or reports.
Testing Scope and Expectations:

Catching New Errors: Our primary objective is to catch any new errors that arise. The test suite is designed to identify deviations and issues not previously cataloged as known errors.
Evolution of Known Errors: If known errors evolve or manifest in new ways due to changes in the system, our tests aim to detect these variations as well.
The entry point to the code is at: ```tests/dynamic-tests.spec.ts`
```

to initialize the project, run once:
```bash
cd assignment1
npm install
```
you might need to install Playwright and Playwright browsers:
```bash
npm init playwright@latest
```
then, to run tests:
```bash
npx playwright test
```
Once the tests run complete, Playwright should start a web server to serve test results and point the browser to it. Test results can also be accessed at:
```bash
playwright-report/index.html
```
Many test cases will fail, some of them because it seems that some website pages have flopping console errors, others don't meet the page title check criteria. I didn't try to make it so that every test will succeed; this is just an example of how to dynamically test pages. 

Currently, to save time, the project is configured to run tests only in the Chrome browser. More browsers can be enabled in ```playwright.config.ts```

## Assignment 2
For assignment 2, we use the Jest framework.

I created a simple service class to serve some of Github's public API endpoints for users. I use Axios for actual network calls. For more details, check ```src/users/users.service.ts```

Tests located in ```src/users/users.test.ts```

Depending on command line arguments, the test suite will either mock network calls with data stored in ```mock_data/``` or will test the service with actual network calls.

to initialize the project, run once:
```bash
cd assignment2
npm install
```
tests can be run in two modes:
 * without mocks:
```bash
npm run test
```
* with mocks:
```bash
npm run testWithMocks
```

