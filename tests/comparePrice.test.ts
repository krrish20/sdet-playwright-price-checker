import { test, expect, chromium } from '@playwright/test';

test.setTimeout(60 * 1000); // 60 seconds

test('Compare iPhone 15 Plus price on Flipkart and Amazon', async () => {
  const browser = await chromium.launch({ headless: true }); // changed to headless for speed
  // Use context options to reduce bot detection
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  });
  
  const [flipkart, amazon] = await Promise.all([
    context.newPage(),
    context.newPage()
  ]);

  // Flipkart
  await flipkart.goto('https://www.flipkart.com', { waitUntil: 'domcontentloaded' });
  try {
    await flipkart.locator('button._2KpZ6l._2doB4z').click({ timeout: 3000 });
  } catch {}
  await expect(flipkart).toHaveTitle(/Online Shopping Site/);
  await expect(flipkart).toHaveURL(/flipkart\.com/);
  await flipkart.fill('input[name="q"]', 'iphone 15 plus');
  await flipkart.keyboard.press('Enter');
  await flipkart.waitForTimeout(4000);
  // Try to extract the first price from the page text
  let flipPriceText;
  try {
    const pageText = await flipkart.textContent('body');
    const priceMatch = pageText && pageText.match(/₹\s?([\d,]+)/);
    if (priceMatch) {
      flipPriceText = priceMatch[0];
    } else {
      throw new Error('No price found in page text');
    }
  } catch (e1) {
    console.log('Price not found in page text. Dumping HTML and taking screenshot.');
    const html = await flipkart.content();
    console.log('Flipkart page HTML:', html.slice(0, 2000));
    await flipkart.screenshot({ path: 'flipkart_debug.png', fullPage: true });
    throw new Error('Could not find Flipkart price element.');
  }
  const flipPrice = parseInt(flipPriceText.replace(/[^\d]/g, ''));
  console.log(`Flipkart price text: ${flipPriceText}`);

  // Amazon
  await amazon.goto('https://www.amazon.in');
  await expect(amazon).toHaveTitle(/Amazon/);
  await expect(amazon).toHaveURL(/amazon\.in/);
  await amazon.fill('input#twotabsearchtextbox', 'iphone 15 plus');
  await amazon.keyboard.press('Enter');
  await amazon.waitForTimeout(3000);
  // Wait for price element to appear
  await amazon.locator('span.a-price-whole').first().waitFor({ timeout: 10000 });
  const amazonPriceText = await amazon.locator('span.a-price-whole').first().innerText();
  const amazonPrice = parseInt(amazonPriceText.replace(/[₹,]/g, ''));
  console.log(`Amazon price text: ${amazonPriceText}`);

  console.log(`🛒 Flipkart Price: ₹${flipPrice}`);
  console.log(`🛍️ Amazon Price: ₹${amazonPrice}`);

  expect(flipPrice, `Expected Flipkart price ₹${flipPrice} to be less than Amazon price ₹${amazonPrice}`).toBeLessThan(amazonPrice);

  await browser.close();
});
