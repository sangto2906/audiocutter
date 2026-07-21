import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));
  
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  
  console.log('Page loaded, checking content...');
  const content = await page.content();
  if (content.includes('Audio Chunker')) {
    console.log('Success: App rendered.');
  } else {
    console.log('Failed: App did not render.');
  }

  await browser.close();
})();
