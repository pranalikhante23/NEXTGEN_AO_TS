import { INSIGHTS_PATH } from '../../pages/IntentionalOfficePage'
import { expect, test } from './fixture'

test.describe('Intentional Office page load', () => {
  test('DRP-3189-TC-001 — hub returns 200 and renders core content', async ({ page, office }) => {
    const response = await office.open()
    expect(response?.status()).toBe(200)
    await office.expectPublishedHub()
    await expect(page).toHaveURL(/intentional-office/)
  })

  test('DRP-3189-TC-001-N — an unknown insights path does not render the published hub', async ({ page }) => {
    const response = await page.goto('/intentional-office-not-a-page', { waitUntil: 'domcontentloaded' })
    expect(response?.status() ?? 0).toBeGreaterThanOrEqual(400)
  })

  test('DRP-3189-TC-001-C — trailing slash and a query string still open the hub', async ({ page, office }) => {
    const response = await office.open(`${INSIGHTS_PATH}/?utm=automation`)
    expect(response?.status()).toBe(200)
    await office.expectPublishedHub()
    await expect(page).toHaveURL(/intentional-office/)
  })
})
