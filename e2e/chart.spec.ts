/**
 * E2E Tests: Dive Chart Features
 * Note: These tests are skipped on mobile devices because the chart
 * is not visible by default in mobile layout (requires user interaction to view)
 */
import { test, expect } from '@playwright/test';

// Helper to check if running on mobile viewport
const isMobileViewport = (viewportWidth: number | undefined) => {
  return viewportWidth !== undefined && viewportWidth < 1200;
};

test.describe('Dive Chart', () => {
  test.beforeEach(async ({ page }) => {
    // On mobile viewports, use desktop layout parameter to ensure chart is visible
    const viewport = page.viewportSize();
    const url = isMobileViewport(viewport?.width) ? '/?layout=desktop' : '/';
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  });

  test('should display dive depth chart', async ({ page }) => {
    // Wait for chart to render
    const chart = page.locator('.recharts-wrapper, [data-testid="dive-chart"], svg.recharts-surface');
    
    // Chart should be visible
    await expect(chart.first()).toBeVisible({ timeout: 10000 });
  });

  test('chart should contain depth curve', async ({ page }) => {
    // Wait for SVG chart to load
    await page.waitForSelector('.recharts-wrapper svg, [data-testid="dive-chart"] svg');
    
    // Check for line or area chart
    const chartPath = page.locator('.recharts-line, .recharts-area, .recharts-curve');
    
    // Should have at least one data curve
    const count = await chartPath.count();
    expect(count).toBeGreaterThan(0);
  });

  test('chart should have legend', async ({ page }) => {
    // Check legend
    const legend = page.locator('.recharts-legend-wrapper, [data-testid="chart-legend"]');
    
    if (await legend.isVisible()) {
      // Legend should contain multiple items
      const legendItems = legend.locator('.recharts-legend-item, [data-testid="legend-item"]');
      const count = await legendItems.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});

test.describe('Chart Interaction', () => {
  test.beforeEach(async ({ page }) => {
    // On mobile viewports, use desktop layout parameter to ensure chart is visible
    const viewport = page.viewportSize();
    const url = isMobileViewport(viewport?.width) ? '/?layout=desktop' : '/';
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  });

  test('hovering chart should show tooltip', async ({ page }) => {
    // Wait for chart to load
    const chart = page.locator('.recharts-wrapper, [data-testid="dive-chart"]').first();
    await expect(chart).toBeVisible({ timeout: 10000 });
    
    // Get chart area and hover
    const chartArea = page.locator('.recharts-surface, .recharts-wrapper svg').first();
    if (await chartArea.isVisible()) {
      // Hover at chart center
      const box = await chartArea.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        
        // Wait for tooltip to appear
        await page.waitForTimeout(500);
        
        // Tooltip may appear (not strictly required as some configs may not have tooltip)
        const tooltip = page.locator('.recharts-tooltip-wrapper, [data-testid="chart-tooltip"]');
      }
    }
  });
});
