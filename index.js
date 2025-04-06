const { chromium } = require('playwright');
const fs = require('fs');

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
async function sortHackerNewsArticles(desiredCount = 100, timeoutMs = 60000) {
    // ----------------------------------------- Arrange -----------------------------------------
  
    // Convert desiredCount to an integer and validate it's a positive number
    desiredCount = parseInt(desiredCount, 10);
    if (isNaN(desiredCount) || desiredCount <= 0) {
      console.log('❌ Please provide a valid number (e.g., `node script.js 150`)');
      process.exit(1);
    }
  
    // Launch a headless browser and open a new page
    const browser = await chromium.launch();
    const page = await browser.newPage();
  
    // Navigate to the "newest" page of Hacker News
    await page.goto('https://news.ycombinator.com/newest');
  
    // Initialize array to hold timestamps and record start time
    let allTimestamps = [];
    const startTime = Date.now();
  
    try {
      // ----------------------------------------- Act -----------------------------------------
  
      // Keep collecting timestamps until we reach the desired count or hit timeout
      while (allTimestamps.length < desiredCount) {
        const timestamps = await extractTimestamps(page);
        allTimestamps.push(...timestamps);
  
        // Break early if we already have enough
        if (allTimestamps.length >= desiredCount) break;
  
        // Throw an error if time exceeds the allowed timeout
        if (Date.now() - startTime > timeoutMs) {
          throw new Error(`Timeout: Couldn't collect ${desiredCount} timestamps within ${timeoutMs / 1000}s.`);
        }
  
        // Click the "more" link to load more articles and wait for the next page to load
        const moreLink = page.locator('a.morelink');
        await Promise.all([
          page.waitForLoadState('load'),
          moreLink.click()
        ]);
      }
  
      // Slice the first N timestamps as required
      const selected = allTimestamps.slice(0, desiredCount);
  
      // Save the result to a JSON file
      fs.writeFileSync('timestamps.json', JSON.stringify(selected, null, 2));
  
      // ----------------------------------------- Assert -----------------------------------------
  
      console.log(`✅ Collected ${selected.length} timestamps.`);
      console.log('📝 Saved to timestamps.json');
  
      // Check if the timestamps are sorted from newest to oldest
      if (isSortedNewestToOldest(selected)) {
        console.log(`✅ Sorted correctly (newest to oldest).`);
      } else {
        console.log(`❌ Not sorted correctly.`);
      }
  
    } catch (error) {
      // Handle any errors during scraping or timeout
      console.error(`❌ Error: ${error.message}`);
    } finally {
      // ----------------------------------------- Cleanup -----------------------------------------
  
      // Close the browser no matter what
      await browser.close();
    }
  }
  
  

  (async () => {
    await sortHackerNewsArticles(process.argv[2]); //Allow user passing parameters to set their own amounts of articles
  })();
  
