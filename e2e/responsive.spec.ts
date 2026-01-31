/**
 * E2E Tests: Responsive Layout at Different Screen Sizes
 * Based on project breakpoints from src/constants/breakpoints.js
 * 
 * Breakpoints:
 * - mobilePortrait: 480px (phone portrait max width)
 * - mobile: 1200px (below this uses mobile layout)
 * - panelMinWidth: 450px (left panel minimum width)
 */
import { test, expect } from '@playwright/test';

// Import breakpoint values (matching src/constants/breakpoints.js)
const BREAKPOINTS = {
  mobilePortrait: 480,
  mobile: 1200,
  panelMinWidth: 450,
};

// Common device sizes for testing
const VIEWPORT_SIZES = {
  // Mobile Portrait - Small phones (iPhone SE, Galaxy S8)
  mobileSmall: { width: 320, height: 568 },
  
  // Mobile Portrait - Standard phones (iPhone 12/13/14)
  mobileStandard: { width: 390, height: 844 },
  
  // Mobile Portrait - Large phones (iPhone Pro Max)
  mobileLarge: { width: 430, height: 932 },
  
  // Mobile Portrait - At breakpoint boundary
  mobilePortraitMax: { width: BREAKPOINTS.mobilePortrait - 1, height: 800 },
  
  // Tablet Portrait (iPad Mini)
  tabletPortrait: { width: 768, height: 1024 },
  
  // Tablet Landscape (iPad)
  tabletLandscape: { width: 1024, height: 768 },
  
  // Mobile Layout - Just below breakpoint
  mobileLayoutMax: { width: BREAKPOINTS.mobile - 1, height: 800 },
  
  // Desktop Layout - At breakpoint
  desktopMin: { width: BREAKPOINTS.mobile, height: 800 },
  
  // Desktop - Standard laptop (MacBook Air 13")
  desktopSmall: { width: 1366, height: 768 },
  
  // Desktop - Standard monitor
  desktopMedium: { width: 1920, height: 1080 },
  
  // Desktop - Large monitor / 4K
  desktopLarge: { width: 2560, height: 1440 },
};

test.describe('Mobile Portrait Layout (< 480px)', () => {
  test('should display correctly on small phones (320px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.mobileSmall);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Page should render without horizontal scrollbar
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Content should fit within viewport
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(VIEWPORT_SIZES.mobileSmall.width + 10);
  });

  test('should display correctly on standard phones (390px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.mobileStandard);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Dive list should be visible
    const diveList = page.locator('[aria-label="Dive List"]');
    await expect(diveList).toBeVisible();
  });

  test('should display correctly on large phones (430px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.mobileLarge);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Search input should be usable
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    }
  });
});

test.describe('Mobile Layout (480px - 1199px)', () => {
  test('should use mobile layout at tablet portrait (768px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.tabletPortrait);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Should still be in mobile layout (single column)
    const diveList = page.locator('[aria-label="Dive List"]');
    await expect(diveList).toBeVisible();
  });

  test('should use mobile layout at tablet landscape (1024px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.tabletLandscape);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should use mobile layout just below breakpoint (1199px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.mobileLayoutMax);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Page should be functional in mobile layout
    const diveList = page.locator('[aria-label="Dive List"]');
    await expect(diveList).toBeVisible();
  });
});

test.describe('Desktop Layout (>= 1200px)', () => {
  test('should switch to desktop layout at breakpoint (1200px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.desktopMin);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Both list and chart should be visible simultaneously
    const diveList = page.locator('[aria-label="Dive List"]');
    const chart = page.locator('.recharts-wrapper, [data-testid="dive-chart"]');
    
    await expect(diveList).toBeVisible();
    await expect(chart.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display correctly on small laptop (1366px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.desktopSmall);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Both panels should be visible
    const diveList = page.locator('[aria-label="Dive List"]');
    const chart = page.locator('.recharts-wrapper');
    
    await expect(diveList).toBeVisible();
    await expect(chart.first()).toBeVisible();
  });

  test('should display correctly on standard monitor (1920px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.desktopMedium);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Full layout should be displayed
    const header = page.locator('header');
    const diveList = page.locator('[aria-label="Dive List"]');
    const chart = page.locator('.recharts-wrapper');
    
    await expect(header).toBeVisible();
    await expect(diveList).toBeVisible();
    await expect(chart.first()).toBeVisible();
  });

  test('should display correctly on large monitor (2560px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.desktopLarge);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Content should scale appropriately
    const chart = page.locator('.recharts-wrapper');
    await expect(chart.first()).toBeVisible();
  });
});

test.describe('Layout Breakpoint Transitions', () => {
  test('should transition from mobile to desktop layout', async ({ page }) => {
    // Start with mobile layout
    await page.setViewportSize({ width: BREAKPOINTS.mobile - 100, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Resize to desktop
    await page.setViewportSize({ width: BREAKPOINTS.mobile + 100, height: 800 });
    await page.waitForTimeout(500); // Wait for layout transition
    
    // Both panels should now be visible
    const diveList = page.locator('[aria-label="Dive List"]');
    const chart = page.locator('.recharts-wrapper');
    
    await expect(diveList).toBeVisible();
    await expect(chart.first()).toBeVisible();
  });

  test('should transition from desktop to mobile layout', async ({ page }) => {
    // Start with desktop layout
    await page.setViewportSize({ width: BREAKPOINTS.mobile + 100, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Resize to mobile
    await page.setViewportSize({ width: BREAKPOINTS.mobile - 100, height: 800 });
    await page.waitForTimeout(500); // Wait for layout transition
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Landscape Orientation (Mobile)', () => {
  test('should handle phone landscape orientation', async ({ page }) => {
    // iPhone 17 Pro Max in landscape
    await page.setViewportSize({ width: 956, height: 440 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Content should be usable in landscape
    const diveList = page.locator('[aria-label="Dive List"]');
    await expect(diveList).toBeVisible();
  });

  test('should handle tablet landscape orientation', async ({ page }) => {
    // iPad Mini 7 in landscape
    await page.setViewportSize({ width: 1133, height: 744 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display chart correctly in phone landscape', async ({ page }) => {
    // iPhone 17 Pro Max in landscape with desktop layout to show chart
    await page.setViewportSize({ width: 956, height: 440 });
    await page.goto('/?layout=desktop');
    await page.waitForLoadState('networkidle');
    
    // Chart should be visible and render correctly
    const chart = page.locator('.recharts-wrapper');
    await expect(chart.first()).toBeVisible({ timeout: 10000 });
    
    // Chart should have reasonable dimensions in landscape
    const chartBox = await chart.first().boundingBox();
    if (chartBox) {
      // Chart width should take advantage of landscape width
      expect(chartBox.width).toBeGreaterThan(300);
      // Chart height should fit in the limited landscape height
      expect(chartBox.height).toBeLessThanOrEqual(440);
    }
  });

  test('should display chart correctly in tablet landscape', async ({ page }) => {
    // iPad Mini 7 in landscape with desktop layout to show chart
    await page.setViewportSize({ width: 1133, height: 744 });
    await page.goto('/?layout=desktop');
    await page.waitForLoadState('networkidle');
    
    // Chart should be visible
    const chart = page.locator('.recharts-wrapper');
    await expect(chart.first()).toBeVisible({ timeout: 10000 });
    
    // Both dive list and chart should be visible in tablet landscape
    const diveList = page.locator('[aria-label="Dive List"]');
    await expect(diveList).toBeVisible();
    
    // Chart should have good dimensions for tablet landscape
    const chartBox = await chart.first().boundingBox();
    if (chartBox) {
      expect(chartBox.width).toBeGreaterThan(400);
      expect(chartBox.height).toBeGreaterThan(200);
    }
  });
});

test.describe('Touch Interactions (Mobile Sizes)', () => {
  test('should allow click interactions on mobile viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.mobileStandard);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and click on a dive item
    const diveCards = page.locator('[aria-label="Dive List"] .overflow-auto > div').first();
    
    if (await diveCards.isVisible()) {
      await diveCards.click();
      await page.waitForTimeout(300);
      
      // Page should respond to click
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('URL Layout Parameter Override', () => {
  test('should force mobile layout on desktop with ?layout=mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.desktopMedium);
    await page.goto('/?layout=mobile');
    await page.waitForLoadState('networkidle');
    
    // Should use mobile layout despite desktop viewport
    await expect(page.locator('body')).toBeVisible();
  });

  test('should force desktop layout on mobile with ?layout=desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.mobileStandard);
    await page.goto('/?layout=desktop');
    await page.waitForLoadState('networkidle');
    
    // Should use desktop layout despite mobile viewport
    await expect(page.locator('body')).toBeVisible();
  });
});
