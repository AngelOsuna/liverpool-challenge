import { test, expect } from '@playwright/test';

test.use({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  extraHTTPHeaders: {
    'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
  }
});

test('Liverpool E2E: Search, Filter, and API Validation', async ({ page }) => {
  test.setTimeout(60000); 

  console.log('🚀 Step 1: Navigating to Liverpool...');
  await page.goto('https://www.liverpool.com.mx/');
  await page.keyboard.press('Escape');

  console.log('🔍 Step 2: Searching for PlayStation 5...');
  const searchBar = page.getByPlaceholder('Buscar').first();
  await searchBar.waitFor({ state: 'visible' });
  await searchBar.fill('playstation 5');
  await searchBar.press('Enter');

  console.log('⚙️ Step 3: Setting up API Interception & Filtering by Blanco...');
  
  // Wait for the filter to become visible.
  const colorFilter = page.getByTestId('Blanco~~#ffffff');
  await colorFilter.waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(1500); // Give React 1.5 seconds to attach the onClick handlers
  
  const apiResponsePromise = page.waitForResponse(response => 
    response.url().includes('/web-bff/product/search') && response.status() === 200
  );
  
  await colorFilter.click();
  
  const apiResponse = await apiResponsePromise;
  const apiData = await apiResponse.json();
  console.log('✅ API Intercepted Successfully!');

  console.log('📉 Step 4: Sorting by Lowest Price...');
  
  // Give the UI 2 seconds to paint the new Blanco products before trying to sort
  await page.waitForTimeout(2000); 

  const sortButton = page.getByTestId('dropdown-sorting-button');
  await sortButton.waitFor({ state: 'visible', timeout: 5000 });
  await sortButton.click();
  console.log('✅ Clicked sort button');

  const sortOption = page.locator('#sorting-options li').filter({ hasText: 'Menor precio' });
  await sortOption.waitFor({ state: 'visible', timeout: 5000 });

  const sortApiResponsePromise = page.waitForResponse(response => 
    response.url().includes('/web-bff/product/search') && response.status() === 200
  );
  
  await sortOption.click();

  const finalApiResponse = await sortApiResponsePromise;
  const finalApiData = await finalApiResponse.json();
  console.log('✅ Sorted API Intercepted Successfully!');
  
  await page.waitForTimeout(2000); 

  console.log('🖥️ Step 5: Extracting UI Results...');
  const titles = page.locator('h3.line-clamp-2'); 
  const prices = page.locator('span.text-price-primary'); 

  await titles.first().waitFor({ state: 'visible' });

  const uiProducts = [];
  const count = await titles.count();
  const limit = Math.min(count, 5);

  for (let i = 0; i < limit; i++) {
    const name = await titles.nth(i).innerText(); 
    const rawPrice = await prices.nth(i).innerText(); 

    const cleanPrice = rawPrice.replace(/[\n\r\s]+/g, '');

    uiProducts.push({ name: name.trim(), price: cleanPrice });
  }
  
  console.log('--- UI DATA ---');
  console.log(uiProducts);

  console.log('🌐 Step 6: Parsing Intercepted API Results...');

  const apiProducts = finalApiData.products.map((p: any) => ({
    name: p.recordTitle,
    price: p.promoPrice || p.listPrice || p.maximumListPrice || 'Unknown' 
  }));

  console.log('⚖️ Step 7: Cross-Validation Layer...');
  let matchCount = 0;
  const discrepancies: string[] = [];

  for (const uiProduct of uiProducts) {
    const cleanUiName = uiProduct.name.toLowerCase();
    
    // Advanced Fuzzy Matching: Check if the UI name contains at least 70% of the API name's words
    // Advanced Fuzzy Matching: Check if the UI name contains at least 70% of the API name's words
    const isMatch = apiProducts.some((apiProduct: any) => {
       const apiWords = apiProduct.name.toLowerCase().split(' ').filter((word: string) => word.length > 2);
       if (apiWords.length === 0) return false;
       
       const matchedWords = apiWords.filter((word: string) => cleanUiName.includes(word));
       const matchPercentage = matchedWords.length / apiWords.length;
       
       return matchPercentage >= 0.7; 
    });

    if (isMatch) {
      matchCount++;
      console.log(`✅ Match: ${uiProduct.name}`);
    } else {
      discrepancies.push(`UI Product missing in API: ${uiProduct.name}`);
    }
  }

  if (matchCount < 3) {
      console.log('--- API NAMES FOR DEBUGGING ---');
      apiProducts.forEach((p: any) => console.log(p.name));
  }

  // Requirement: Assert at least 3 out of 5 match
  expect(matchCount).toBeGreaterThanOrEqual(3);
});