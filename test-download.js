import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));
  
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  
  console.log('Page loaded, uploading file...');
  
  const fileInput = await page.$('input[type=file]');
  if (fileInput) {
    await fileInput.uploadFile('./input.mp3');
    console.log('File uploaded to input. Waiting for processing...');
    
    // wait for UI to update
    await new Promise(r => setTimeout(r, 4000));
    
    // click the download button on the first chunk
    const downloadBtns = await page.$$('button[title="Download"]');
    if (downloadBtns.length > 0) {
      console.log('Clicking download button for first chunk...');
      await downloadBtns[0].click();
      
      // wait to see if it throws error or finishes
      await new Promise(r => setTimeout(r, 6000));
      console.log('Test finished.');
    } else {
      console.log('No download button found.');
    }
  } else {
    console.log('File input not found.');
  }

  await browser.close();
})();
