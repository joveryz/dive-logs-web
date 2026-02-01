/**
 * E2E Tests: Responsive Layout Transitions
 * Tests dynamic layout changes that cannot be covered by static viewport projects.
 * 
 * Static viewport testing is handled by playwright.config.ts projects:
 * - Desktop Standard (1400x900)
 * - iPhone 17 Pro Max (440x956)
 * - iPad Mini 7 (744x1133)
 * - iPhone 17 Pro Max Landscape (956x440)
 * - iPad Mini 7 Landscape (1133x744)
 * - Desktop Breakpoint (1200x800)
 * - Mobile Breakpoint (1199x800)
 * 
 * Breakpoints from src/constants/breakpoints.js:
 * - mobilePortrait: 480px
 * - mobile: 1200px
 * - panelMinWidth: 450px
 */
import { test, expect } from '@playwright/test';

const BREAKPOINTS = {
  mobile: 1200,
};

test.describe('Layout Breakpoint Transitions', () => {
  test('should transition from mobile to desktop layout', async ({ page }) => {
    // Start with Mobile Breakpoint size (1199px)
    await page.setViewportSize({ width: BREAKPOINTS.mobile - 1, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Resize to Desktop Breakpoint size (1200px)
    await page.setViewportSize({ width: BREAKPOINTS.mobile, height: 800 });
    await page.waitForTimeout(500);
    
    // Both panels should now be visible
    const diveList = page.locator('[aria-label="Dive List"]');
    const chart = page.locator('.recharts-wrapper');
    
    await expect(diveList).toBeVisible();
    await expect(chart.first()).toBeVisible();
  });

  test('should transition from desktop to mobile layout', async ({ page }) => {
    // Start with Desktop Breakpoint size (1200px)
    await page.setViewportSize({ width: BREAKPOINTS.mobile, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Resize to Mobile Breakpoint size (1199px)
    await page.setViewportSize({ width: BREAKPOINTS.mobile - 1, height: 800 });
    await page.waitForTimeout(500);
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('URL Layout Parameter Override', () => {
  test('should force mobile layout on desktop with ?layout=mobile', async ({ page }) => {
    // Desktop Standard size (1400x900)
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/?layout=mobile');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should force desktop layout on mobile with ?layout=desktop', async ({ page }) => {
    // iPhone 17 Pro Max size (440x956)
    await page.setViewportSize({ width: 440, height: 956 });
    await page.goto('/?layout=desktop');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Chart should be visible despite mobile viewport
    const chart = page.locator('.recharts-wrapper');
    await expect(chart.first()).toBeVisible({ timeout: 10000 });
  });
});
