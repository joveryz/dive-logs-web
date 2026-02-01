import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Based on project breakpoints:
 * - mobilePortrait: 480px (phone portrait max width)
 * - mobile: 1200px (below this uses mobile layout)
 * - panelMinWidth: 450px (left panel minimum width)
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test files directory
  testDir: './e2e',
  
  // Timeout for each test file
  timeout: 30 * 1000,
  
  // Assertion timeout
  expect: {
    timeout: 5000,
  },
  
  // Run tests in fully parallel mode
  fullyParallel: true,
  
  // Forbid test.only in CI environment
  forbidOnly: !!process.env.CI,
  
  // Retry count on CI failure
  retries: process.env.CI ? 2 : 0,
  
  // Parallel workers count
  workers: process.env.CI ? 1 : undefined,
  
  // Report format
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  
  // Shared configuration for all tests
  use: {
    // Base URL
    baseURL: 'http://localhost:8000',
    
    // Collect trace on first retry
    trace: 'on-first-retry',
    
    // Screenshot
    screenshot: 'only-on-failure',
    
    // Video
    video: 'on-first-retry',
  },

  // Configure browser projects for different screen sizes
  // All projects use chromium to avoid needing to install additional browsers
  projects: [
    // Desktop - Main tests (above mobile breakpoint 1200px)
    {
      name: 'Desktop Standard',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1400, height: 900 },
      },
    },
    
    // Mobile - iPhone 17 Pro Max dimensions (standard phone, below mobilePortrait 480px)
    // Uses chromium with mobile viewport instead of webkit
    {
      name: 'iPhone 17 Pro Max',
      use: { 
        browserName: 'chromium',
        viewport: { width: 440, height: 956 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1',
      },
    },
    
    // Tablet - iPad Mini 7 dimensions (between mobilePortrait 480px and mobile 1200px)
    // Uses chromium with tablet viewport instead of webkit
    {
      name: 'iPad Mini 7',
      use: { 
        browserName: 'chromium',
        viewport: { width: 744, height: 1133 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1',
      },
    },
    
    // iPhone 17 Pro Max in landscape orientation
    {
      name: 'iPhone 17 Pro Max Landscape',
      use: { 
        browserName: 'chromium',
        viewport: { width: 956, height: 440 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1',
      },
    },
    
    // iPad Mini 7 in landscape orientation
    {
      name: 'iPad Mini 7 Landscape',
      use: { 
        browserName: 'chromium',
        viewport: { width: 1133, height: 744 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1',
      },
    },
    
    // Desktop at exact breakpoint (1200px)
    {
      name: 'Desktop Breakpoint',
      use: {
        browserName: 'chromium',
        viewport: { width: 1200, height: 1200 },
      },
    },
    
    // Mobile at near breakpoint (1199px - just below desktop)
    {
      name: 'Mobile Breakpoint',
      use: {
        browserName: 'chromium',
        viewport: { width: 1199, height: 1200 },
      },
    },
  ],

  // Start dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
