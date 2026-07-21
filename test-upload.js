import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  console.log('Page loaded, uploading file...');
  
  const fileInput = await page.$('input[type=file]');
  if (fileInput) {
    await fileInput.uploadFile('./input.mp3');
    console.log('File uploaded to input.');
    
    await new Promise(r => setTimeout(r, 2000));
    const content = await page.content();
    if (content.includes('input.mp3')) {
      console.log('Success: File name found in DOM.');
    } else {
      console.log('Failed: File name not found in DOM.');
    }
  } else {
    console.log('File input not found.');
  }

  await browser.close();
})();
