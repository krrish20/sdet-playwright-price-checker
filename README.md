# 📦 Flipkart vs Amazon Price Comparator

This is an automation test built using **Playwright + TypeScript** that compares the price of **"iPhone 15 Plus"** between Flipkart and Amazon.

---

## ✅ What It Does

- Opens Flipkart and Amazon **in parallel**
- Searches for **"iPhone 15 Plus"**
- Extracts the first product's price from both sites
- Compares prices:
  - ✅ Passes if **Flipkart is cheaper**
  - ❌ Fails with a clear error message if not

---

## 💡 Features

- 🔁 Parallel browser execution
- 🔍 Title & URL validation
- 💬 Console logging of extracted prices
- 🚫 Popup handling (Flipkart login modal)
- ✅ Multiple assertions with custom error message

---

## 🛠️ Tech Stack

- [Playwright](https://playwright.dev/)
- TypeScript
- Node.js

---

## 🖥️ How to Run This Project

### Step 1: Clone the repo
```bash
git clone https://github.com/krrish20/sdet-playwright-price-checker.git
cd sdet-playwright-price-checker
