const { chromium } = require('playwright');

// Helper function: Extract all article timestamps from the page
async function extractTimestamps(page) {
  return await page.$$eval('tr td.subtext span.age', elements =>
    elements.map(el => el.getAttribute('title'))
  );
}

// Helper function: Check if timestamps are sorted from newest to oldest
function isSortedNewestToOldest(timestamps) {
  const dates = timestamps.map(t => new Date(t));
  for (let i = 0; i < dates.length - 1; i++) {
    if (dates[i] < dates[i + 1]) {
      return false;
    }
  }
  return true;
}

(async () => {
  // Arrange: Launch browser and new page, then navigate to the target URL
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://news.ycombinator.com/newest');
  let allTimestamps = [];

  // Act: Click the "more" link repeatedly until at least 100 timestamps are collected
  while (allTimestamps.length < 100) {
    const timestamps = await extractTimestamps(page);
    allTimestamps.push(...timestamps);

    // If less than 100 timestamps are collected, click the "more" link to load more articles
    if (allTimestamps.length < 100) {
      const moreLink = page.locator('a.morelink');
      await Promise.all([
        page.waitForLoadState('load'), // Wait for the page to load
        moreLink.click()                 // Click on the "more" link
      ]);
    }
  }

  const first100 = allTimestamps.slice(0, 100);
  console.log(first100);
  console.log(`Number of collected timestamps: ${first100.length}`);

  // Assert: Verify that exactly 100 timestamps are collected and they are sorted correctly
  if (first100.length !== 100) {
    console.log(`❌ Only collected ${first100.length} timestamps.`);
    process.exit(1);
  }
  if (isSortedNewestToOldest(first100)) {
    console.log('✅ Successfully verified: 100 articles are sorted from newest to oldest.');
  } else {
    console.log('❌ The articles are NOT sorted from newest to oldest.');
  }

  // Cleanup: Close the browser
  await browser.close();
})();
