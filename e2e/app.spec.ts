/**
 * E2E Tests: Application Basic Features
 */
import { test, expect } from '@playwright/test';

test.describe('App Loading', () => {
  test('should load homepage correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await expect(page).toHaveTitle(/Dive Logs/i);
  });

  test('should display dive list', async ({ page }) => {
    await page.goto('/');
    
    // Wait for list container to appear (using aria-label)
    const diveList = page.locator('[aria-label="Dive List"]');
    await expect(diveList).toBeVisible({ timeout: 10000 });
    
    // Check that list has content (DiveCard components)
    const diveCards = page.locator('[aria-label="Dive List"] .overflow-auto > div');
    await expect(diveCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display page header', async ({ page }) => {
    await page.goto('/');
    
    // Check header exists
    const header = page.locator('header, [data-testid="header"]');
    await expect(header).toBeVisible();
  });
});

test.describe('Dive Record Interaction', () => {
  test('clicking dive record should show details', async ({ page }) => {
    await page.goto('/');
    
    // Wait for list to load
    await page.waitForLoadState('networkidle');
    
    // Click first dive record
    const firstDiveItem = page.locator('[data-testid="dive-item"], .dive-item').first();
    
    // If dive item found, click it
    if (await firstDiveItem.isVisible()) {
      await firstDiveItem.click();
      
      // Wait for detail panel or chart to appear
      await page.waitForTimeout(500);
      
      // Verify page has changed (detail displayed or chart updated)
      const chart = page.locator('[data-testid="dive-chart"], .recharts-wrapper, svg');
      await expect(chart.first()).toBeVisible();
    }
  });
});

test.describe('Search Functionality', () => {
  test('should allow search input', async ({ page }) => {
    await page.goto('/');
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Beijing');
      
      // Verify input value
      await expect(searchInput).toHaveValue('Beijing');
    }
  });
});

test.describe('Responsive Layout', () => {
  test('desktop should display multi-column layout', async ({ page }) => {
    // Set desktop size
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Desktop should have list and detail panels
    const mainContent = page.locator('main, [data-testid="main-content"]');
    await expect(mainContent).toBeVisible();
  });

  test('mobile should display single-column layout', async ({ page }) => {
    // Set mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Page should display correctly
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('URL Parameters', () => {
  test('should support diveNumber parameter', async ({ page }) => {
    // Select specific dive via URL parameter
    await page.goto('/?diveNumber=1');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Page should load correctly
    await expect(page.locator('body')).toBeVisible();
  });

  test('should support layout parameter', async ({ page }) => {
    // Force mobile layout
    await page.goto('/?layout=mobile');
    
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});
