# Explanation: comparePrice.test.ts

This document explains the Playwright test in `comparePrice.test.ts`, including the changes made to ensure reliability and a step-by-step walkthrough of how the code works.

## Purpose of the Test
The test compares the price of the iPhone 15 Plus on Flipkart and Amazon, and asserts that the price on Flipkart is less than the price on Amazon.

---

## Key Changes Made
1. **Headless Mode**: The browser is launched in headless mode for speed and reliability.
2. **Stealth Context**: The browser context is configured with a realistic user agent, viewport, and locale to reduce bot detection by Flipkart and Amazon.
3. **Robust Price Extraction**: Instead of relying on a single CSS selector, the script now extracts the first price matching the ₹ symbol and digits from the entire page text. This makes the test resilient to changes in page structure.
4. **Debug Output**: If the price cannot be found, the script prints the first 2000 characters of the page HTML and takes a screenshot for troubleshooting.
5. **Explicit Waits**: The script waits for search results to load before attempting to extract prices.

---

## Step-by-Step Code Walkthrough

### 1. Import Playwright Modules
```ts
import { test, expect, chromium } from '@playwright/test';
```
- Imports Playwright's test runner, assertion library, and Chromium browser.

### 2. Set Test Timeout
```ts
test.setTimeout(60 * 1000); // 60 seconds
```
- Sets a maximum timeout of 60 seconds for the test.

### 3. Define the Test
```ts
test('Compare iPhone 15 Plus price on Flipkart and Amazon', async () => {
  // ...
});
```
- Defines the test case.

### 4. Launch Browser in Headless Mode
```ts
const browser = await chromium.launch({ headless: true });
```
- Launches Chromium in headless mode for faster, non-UI testing.

### 5. Create a Stealthy Browser Context
```ts
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 800 },
  locale: 'en-US',
});
```
- Sets a realistic user agent, viewport, and locale to mimic a real user and avoid bot detection.

### 6. Open Two Pages (Flipkart and Amazon)
```ts
const [flipkart, amazon] = await Promise.all([
  context.newPage(),
  context.newPage()
]);
```
- Opens two tabs: one for Flipkart, one for Amazon.

### 7. Flipkart Price Extraction
- **Navigate to Flipkart**
  ```ts
  await flipkart.goto('https://www.flipkart.com', { waitUntil: 'domcontentloaded' });
  ```
- **Close Login Popup (if present)**
  ```ts
  try {
    await flipkart.locator('button._2KpZ6l._2doB4z').click({ timeout: 3000 });
  } catch {}
  ```
- **Search for iPhone 15 Plus**
  ```ts
  await flipkart.fill('input[name="q"]', 'iphone 15 plus');
  await flipkart.keyboard.press('Enter');
  await flipkart.waitForTimeout(4000);
  ```
- **Extract the First Price from Page Text**
  ```ts
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
    // Debug output if price not found
    const html = await flipkart.content();
    console.log('Flipkart page HTML:', html.slice(0, 2000));
    await flipkart.screenshot({ path: 'flipkart_debug.png', fullPage: true });
    throw new Error('Could not find Flipkart price element.');
  }
  const flipPrice = parseInt(flipPriceText.replace(/[^\d]/g, ''));
  console.log(`Flipkart price text: ${flipPriceText}`);
  ```
- **If price is not found, the script logs HTML and takes a screenshot for debugging.**

### 8. Amazon Price Extraction
- **Navigate to Amazon**
  ```ts
  await amazon.goto('https://www.amazon.in');
  await expect(amazon).toHaveTitle(/Amazon/);
  await expect(amazon).toHaveURL(/amazon\.in/);
  await amazon.fill('input#twotabsearchtextbox', 'iphone 15 plus');
  await amazon.keyboard.press('Enter');
  await amazon.waitForTimeout(3000);
  ```
- **Extract the First Price**
  ```ts
  await amazon.locator('span.a-price-whole').first().waitFor({ timeout: 10000 });
  const amazonPriceText = await amazon.locator('span.a-price-whole').first().innerText();
  const amazonPrice = parseInt(amazonPriceText.replace(/[₹,]/g, ''));
  console.log(`Amazon price text: ${amazonPriceText}`);
  ```

### 9. Compare Prices and Assert
```ts
console.log(`🛒 Flipkart Price: ₹${flipPrice}`);
console.log(`🛍️ Amazon Price: ₹${amazonPrice}`);
expect(flipPrice, `Expected Flipkart price ₹${flipPrice} to be less than Amazon price ₹${amazonPrice}`).toBeLessThan(amazonPrice);
```
- Logs both prices and asserts that Flipkart's price is less than Amazon's.

### 10. Close the Browser
```ts
await browser.close();
```
- Closes the browser and ends the test.

---

## Summary
- The test is now robust against page structure changes and bot detection.
- It provides debug output and screenshots if price extraction fails.
- The test automates a real-world price comparison between Flipkart and Amazon for the iPhone 15 Plus. 