import { describe, it, expect } from 'vitest';
import { useMaqsPlaywright } from '@jason-edstrom/playwright/adapters/vitest';

describe('Automation Page', () => {
  // useMaqsPlaywright() reads maqs.config.json → Playwright.BaseUrl, so
  // page.goto('/') lands on https://openmaqs.github.io/TestingSite/Automation/
  const ctx = useMaqsPlaywright();

  it('loads with the correct title', async () => {
    const page = await ctx.testObject.page;
    await page.goto('/');
    const title = await page.title();
    ctx.log.logInfo(`Page title: ${title}`);
    expect(title).toBe('Automation - MAQS Test Site');
  });

  it('fills the first and last name fields', async () => {
    const page = await ctx.testObject.page;
    await page.goto('/');
    await page.getByLabel('First name:').fill('Jane');
    await page.getByLabel('Last name:').fill('Doe');
    expect(await page.getByLabel('First name:').inputValue()).toBe('Jane');
    expect(await page.getByLabel('Last name:').inputValue()).toBe('Doe');
    ctx.log.logInfo('Name fields filled successfully');
  });

  it('moves the slider and reads the displayed value', async () => {
    const page = await ctx.testObject.page;
    await page.goto('/');
    await page.locator('#slider').fill('7');
    const displayed = await page.locator('#sliderNumber').textContent();
    ctx.log.logInfo(`Slider value: ${displayed ?? ''}`);
    expect(displayed).toBeTruthy();
  });

  it('verifies key form elements are present using soft assert', async () => {
    const page = await ctx.testObject.page;
    await page.goto('/');

    // Collect counts first — softAssert.assert() is synchronous
    const datepickerCount = await page.locator('#datepicker').count();
    const sliderCount = await page.locator('#slider').count();
    const checkboxCount = await page.locator('input[type="checkbox"]').count();
    const radioCount = await page.locator('input[type="radio"]').count();

    ctx.softAssert.assert('has-datepicker', () => {
      if (datepickerCount === 0) throw new Error('Date picker not found');
    });
    ctx.softAssert.assert('has-slider', () => {
      if (sliderCount === 0) throw new Error('Slider not found');
    });
    ctx.softAssert.assert('has-two-checkboxes', () => {
      if (checkboxCount < 2) throw new Error(`Expected ≥2 checkboxes, found ${checkboxCount}`);
    });
    ctx.softAssert.assert('has-radio-buttons', () => {
      if (radioCount < 2) throw new Error(`Expected ≥2 radio buttons, found ${radioCount}`);
    });

    expect(ctx.softAssert.numberOfFailedAsserts).toBe(0);
  });
});
