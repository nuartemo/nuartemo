import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    workers: 1,
    reporter: 'list',
    use: {
        browserName: 'chromium',
        launchOptions: {
            executablePath:
                process.env.CHAVENUARTE_CHROME_PATH ?? '/usr/bin/google-chrome',
        },
        trace: 'retain-on-failure',
    },
    timeout: 60_000,
    projects: [
        {
            name: 'laravel',
            testMatch: 'laravel.spec.ts',
            use: { baseURL: 'http://127.0.0.1:4176', viewport: { width: 1440, height: 900 } },
        },
        ...[
            { name: 'desktop', width: 1440, height: 1050 },
            { name: 'desktop-1024', width: 1024, height: 900 },
            { name: 'mobile-497', width: 497, height: 900 },
            { name: 'mobile', width: 390, height: 844 },
            { name: 'mobile-320', width: 320, height: 740 },
        ].map(({ name, width, height }) => ({
            name,
            testMatch: ['development.spec.ts', 'visual.spec.ts'],
            use: {
                baseURL: 'http://127.0.0.1:5174',
                viewport: { width, height },
                isMobile: width < 768,
                hasTouch: width < 768,
                timezoneId: width === 320 ? 'Asia/Tokyo' : 'America/Fortaleza',
            },
        })),
        {
            name: 'demo-build',
            testMatch: 'demo-build.spec.ts',
            use: {
                baseURL: 'http://127.0.0.1:4175',
                viewport: { width: 1440, height: 1000 },
            },
        },
        {
            name: 'production',
            testMatch: 'production.spec.ts',
            use: {
                baseURL: 'http://127.0.0.1:4174',
                viewport: { width: 1440, height: 900 },
            },
        },
    ],
    webServer: [
        { command: 'npm run preview:laravel', url: 'http://127.0.0.1:4176/painel-chaves', reuseExistingServer: false, timeout: 30000 },
        {
            command: 'npm run preview:demo',
            url: 'http://127.0.0.1:4175',
            reuseExistingServer: false,
            timeout: 30_000,
        },
        {
            command: 'npm run dev',
            url: 'http://127.0.0.1:5174',
            reuseExistingServer: false,
            timeout: 30_000,
        },
        {
            command: 'npm run preview',
            url: 'http://127.0.0.1:4174',
            reuseExistingServer: false,
            timeout: 30_000,
        },
    ],
});
