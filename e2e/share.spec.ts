/**
 * E2E Tests: Share Card Feature
 * 自动检测布局模式（桌面/移动）并使用对应的交互流程
 * 跳过 Landscape（这些布局不渲染 Summary Tab）
 */
import { test, expect } from '@playwright/test';

test.describe('Share Card', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    // 跳过 Landscape - 这些布局不渲染 Summary Tab
    if (projectName.includes('Landscape')) {
      test.skip();
    }
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 等待列表加载
    const diveList = page.locator('[aria-label="Dive List"]');
    await expect(diveList).toBeVisible({ timeout: 10000 });
    
    // 点击第一个潜水记录选中它
    const diveItem = page.locator('[role="button"][aria-selected]').first();
    await diveItem.click();
    await page.waitForTimeout(500);
    
    // 检查是否有 Detail Tab（移动端布局）- 需要切换 Tab 才能看到详情
    const detailTab = page.locator('button:has-text("Dive Detail")');
    const isDetailTabVisible = await detailTab.isVisible().catch(() => false);
    if (isDetailTabVisible) {
      await detailTab.click();
      await page.waitForTimeout(500);
    }
    
    // 等待 Share 按钮出现
    await page.waitForTimeout(300);
  });

  test('should open share modal when clicking share button', async ({ page }) => {
    // Share 按钮可能有文字（桌面）或只有图标（移动端）
    const shareButton = page.locator('[aria-label="Share dive record"]');
    await expect(shareButton).toBeVisible({ timeout: 5000 });
    await shareButton.click();
    
    const modal = page.locator('text=Share Dive');
    await expect(modal).toBeVisible();
  });

  test('should show generating state then image', async ({ page }) => {
    const shareButton = page.locator('[aria-label="Share dive record"]');
    await shareButton.click();
    
    const generatedImage = page.locator('img[alt="Dive Card"]');
    await expect(generatedImage).toBeVisible({ timeout: 10000 });
  });

  test('should close modal when clicking X button', async ({ page }) => {
    const shareButton = page.locator('[aria-label="Share dive record"]');
    await shareButton.click();
    
    await expect(page.locator('text=Share Dive')).toBeVisible();
    
    const closeButton = page.locator('[aria-label="Close"]');
    await closeButton.click();
    
    await expect(page.locator('text=Share Dive')).not.toBeVisible();
  });

  test('should have download and copy buttons or iOS hint', async ({ page }) => {
    const shareButton = page.locator('[aria-label="Share dive record"]');
    await shareButton.click();
    
    const generatedImage = page.locator('img[alt="Dive Card"]');
    await expect(generatedImage).toBeVisible({ timeout: 10000 });
    
    // 检测实际 UI：要么有 Download/Copy 按钮，要么有 iOS 长按提示
    const downloadButton = page.locator('button:has-text("Download")');
    const iosHint = page.locator('text=Long press');
    
    const hasDownload = await downloadButton.isVisible().catch(() => false);
    const hasIosHint = await iosHint.isVisible().catch(() => false);
    
    // 至少有一种操作方式
    expect(hasDownload || hasIosHint).toBeTruthy();
  });

  test('should display generated card image with proper size', async ({ page }) => {
    const shareButton = page.locator('[aria-label="Share dive record"]');
    await shareButton.click();
    
    const generatedImage = page.locator('img[alt="Dive Card"]');
    await expect(generatedImage).toBeVisible({ timeout: 10000 });
    
    const box = await generatedImage.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });
});
