import { test, expect } from "@playwright/test";
import _fetch from "sync-fetch";
import JSDOM from "jsdom";

//list of known errors that almost every page contain, so not every test will fail, these are compiled into regex and must be escaped
let KNOWN_ERRORS_ARRAY = [
  "\\[pageError\\] \\[SyntaxError\\]\\: Unexpected token '&'.*",
  "\\[console\\] \\[error\\] \\[https:\\/\\/epsilon.6sense.com\\/v3\\/company\\/details]: Failed to load resource: the server responded with a status of 401 \\(\\)",
  "\\[pageError\\] \\[ReferenceError\\]: err is not defined",
  "\\[console\\] \\[error\\] \\[https\\:\\/\\/cmp.osano.com\\/169lUZSfKQQcQ14YC\\/63035086-29a9-402b-882a-aceb63943afe\\/osano.js\\]\\: Refused to load the script 'https\\:\\/\\/js.hsadspixel.net\\/fb.js' because it violates the following Content Security Policy directive\\:.*",
  "\\[console\\] \\[error\\] \\[https\\:\\/\\/x\\.clearbitjs\\.com\\/v1\\/pk_7c8bb4b437ff676d6b6301139e4976e3\\/forms\\.js\\?page_path\\=.*\\]\\: Failed to load resource\\: the server responded with a status of 404 \\(\\)"
];

const KNOWN_ERRORS_REGEX = new RegExp(KNOWN_ERRORS_ARRAY.join("|"), "i");
const TITLE_REGEX = new RegExp(/\\| Drata/);
const SITEMAP_URL = "https://drata.com/en-US-page-sitemap.xml";

//load sitemap.xml
let xmlStr = _fetch(SITEMAP_URL, {
  headers: {
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0",
  },
}).text();

//parse sitemap.xml
const dom = new JSDOM.JSDOM("");
const DOMParser = dom.window.DOMParser;
const parser = new DOMParser;
const xmlDoc = parser.parseFromString(xmlStr, "text/xml");

const sitemapNodes = xmlDoc.getElementsByTagName("loc");

//prepare list of site urls extracted from sitemap.xml
let urls: string[] = [];
for (let i = 0; i < sitemapNodes.length; i++) {
  //@ts-ignore
  urls.push(sitemapNodes[i].textContent);
}

//uncomment this line to run shorter, manually managed list of urls:
//urls = ["https://drata.com/", "https://drata.com/contact", "https://drata.com/platform/startup"];

//console.log(`fetched ${urls.length} urls`);

//the function decides is provided error known or unknown and adds it into a corresponding array
function processError(error: string, errors: string[], knownErrors: string[]) {
  if (KNOWN_ERRORS_REGEX.test(error)) {
    knownErrors.push(error);
  } else {
    errors.push(error);
  }
}

//iterate over list of urls and create a test case for every url
for (let i = 0; i < urls.length; i++) {
  let url = urls[i];
  //actual test case starts here:
  test(`Page: ${url}`, async ({ page }) => {
    let errors = []
    let knownErrors = []
    //register callback to receive console errors        
    page.on("console", (message) => {
      if (message.type() === "error") {
        let error = `[console] [${message.type()}] [${message.location().url}]: ${message.text()}`;
        processError(error, errors, knownErrors)
      }
    });
    //register callback to receive page errors
    page.on("pageerror", (err) => {
      let error = `[pageError] [${err.name}]: ${err.message}`;
      processError(error, errors, knownErrors)
    });

    //load page
    await page.goto(url);
    let title = await page.title();

    //write debugging details into logs
    console.log(`The page [${url}] has title [${title}]`)
    console.log(`The page produced ${knownErrors.length} known errors:`)
    for (let err of knownErrors) {
      console.log(err)
    }
    console.log(`The page produced ${errors.length} unexpected errors:`)
    for (let err of errors) {
      console.log(err)
    }

    //assertion tests start here

    //test that page contains Contact Sales:
    let contactSales = page.getByText("Contact Sales")
    // let signIn = page.getByAltText("Sign In")
    await expect(contactSales).toBeVisible()

    //test that page title contains "| Drata"
    expect(TITLE_REGEX.test(title), "Page title must contain the company name: 'Drata'").toBeTruthy()

    //test that there is no unexpected errors
    expect(errors.length).toEqual(0);
  });
}
