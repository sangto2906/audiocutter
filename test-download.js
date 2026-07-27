import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  
  const fileInput = await page.$('input[type=file]');
  if (fileInput) {
    await fileInput.uploadFile('./input.mp3');
    console.log('File uploaded. Waiting 2 seconds...');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Clicking Download...');
    // Enable request interception to catch downloads or errors
    await page._client().send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: './' });
    
    const downloadBtns = await page.$$('button[title="Download"]');
    if (downloadBtns.length > 0) {
      await downloadBtns[0].click();
      console.log('Clicked. Waiting 10 seconds for FFmpeg to finish...');
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  await browser.close();
})();
