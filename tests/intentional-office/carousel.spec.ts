import { expect, test } from './fixture'

test.describe('Intentional Office media carousel', () => {
  test('DRP-3189-TC-006 — download appears on image hover and uses fl_attachment', async ({ office }) => {
    await office.hoverActiveCarouselImage()
    const download = office.downloadControl().first()
    await expect(download).toBeVisible()
    await expect(download).toHaveAttribute('href', /fl_attachment/)
  })

  test('DRP-3189-TC-006-N — download stays hidden before the image is hovered', async ({ page, office }) => {
    await office.carousel().scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    await expect(office.downloadControl().first()).toBeHidden()
  })

  test('DRP-3189-TC-006-C — arrow navigation advances a slide and does not flash download icons', async ({ page, office }) => {
    await office.carousel().scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    const next = office.carouselNext()
    await expect(next).toBeVisible()
    const before = await office.carouselImages().first().getAttribute('src')
    await next.click()
    await expect(office.downloadControl().first()).toBeHidden()
    await expect.poll(async () => office.carouselImages().first().getAttribute('src')).not.toBe(before)
  })
})
