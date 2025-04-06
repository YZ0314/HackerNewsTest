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
    // -----------------------------------------Arrange-----------------------------------------
    // Check if input is a valid positive integer
    desiredCount = parseInt(desiredCount, 10);
    if (isNaN(desiredCount) || desiredCount <= 0) {
      console.log('❌ Please provide a valid number (e.g., `node script.js 150`)');
      process.exit(1);
    }
  
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://news.ycombinator.com/newest');
    let allTimestamps = [];
    const startTime = Date.now();
  
    try {
      // -----------------------------------------Act-----------------------------------------
      while (allTimestamps.length < desiredCount) {
        const timestamps = await extractTimestamps(page);
        allTimestamps.push(...timestamps);
  
        if (allTimestamps.length >= desiredCount) break;
  
        if (Date.now() - startTime > timeoutMs) {
          throw new Error(`Timeout: Couldn't collect ${desiredCount} timestamps within ${timeoutMs / 1000}s.`);
        }
  
        const moreLink = page.locator('a.morelink');
        await Promise.all([
          page.waitForLoadState('load'),
          moreLink.click()
        ]);
      }
  
      const selected = allTimestamps.slice(0, desiredCount);
      fs.writeFileSync('timestamps.json', JSON.stringify(selected, null, 2));
  
      // -----------------------------------------Assert-----------------------------------------
      console.log(`✅ Collected ${selected.length} timestamps.`);
      console.log('📝 Saved to timestamps.json');
  
      if (isSortedNewestToOldest(selected)) {
        console.log(`✅ Sorted correctly (newest to oldest).`);
      } else {
        console.log(`❌ Not sorted correctly.`);
      }
  
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    } finally {
      await browser.close();
    }
  }
  

  (async () => {
    await sortHackerNewsArticles(process.argv[2]); //Allow user passing parameters to set their own amounts of articles
  })();
  
