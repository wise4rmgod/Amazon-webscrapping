const puppeteer = require("puppeteer");
const fs = require("fs");
const Papa = require("papaparse");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to Amazon and login
  await page.goto(
    "https://www.amazon.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fcart%2Fadd-to-cart%2Fref%3Dnav_custrec_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0"
  );

  // Fill in login details and click the login button
  await page.waitForSelector("#ap_email");
  await page.type("#ap_email", ""); // Replace with your Amazon email
  await page.click("#continue-announce");

  await page.waitForSelector("#ap_password");
  await page.type("#ap_password", ""); // Replace with your Amazon password
  await page.click("#auth-signin-button");
  // Wait for the login to complete
  await page.waitForNavigation();

  // Navigate to the product page for which you want to scrape reviews
  await page.goto(
    "https://www.amazon.com/ENHANCE-Headphone-Customizable-Lighting-Flexible/dp/B07DR59JLP/",
    { timeout: 60000 }
  ); // Replace with the product URL

  // Retrieve the full HTML content of the page
  const pageContent = await page.content();

  // Output the HTML to the console
  console.log(pageContent);

  // Wait for reviews to load (you may need to adjust the selector)
  await page.waitForSelector(".review");
  const reviews = await page.$$eval(".review", (reviewElements) => {
    return reviewElements.slice(0, 10).map((review) => {
      const author = review.querySelector(".a-profile-name").textContent;
      const text = review.querySelector(".a-row.review-data").textContent;
      const date = review.querySelector(".review-date").textContent;
      return { author, text, date };
    });
  });

  // Export the data to a CSV file
  const csvData = Papa.unparse(reviews);
  fs.writeFileSync("amazon_reviews.csv", csvData);

  // Capture a screenshot of the page
  await page.screenshot({ path: "screenshot.png" });

  // Close the browser when done
  await browser.close();
})();
