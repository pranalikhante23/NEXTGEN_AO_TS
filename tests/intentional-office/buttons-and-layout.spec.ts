import { expect, test } from './fixture'

test.describe('Intentional Office buttons and media layout', () => {
  test.fixme('DRP-3189-TC-007 — Primary, Secondary, and Tertiary hover matches Figma node 6426-16718', async () => {
    // Manual visual check against the Allsteel Design System Buttons frame.
  })

  test('DRP-3189-TC-008 — a Learn More control shows a visible focus indicator', async ({ office }) => {
    const button = office.learnMore.first()
    await button.scrollIntoViewIfNeeded()
    const indicator = await office.focusIndicator(button)
    const visible = indicator.outlineStyle !== 'none' && indicator.outlineWidth > 0
    const shadow = indicator.boxShadow !== 'none'
    expect(visible || shadow).toBe(true)
  })

  test('DRP-3189-TC-008-N — a disabled control does not activate', async ({ page, office }) => {
    test.skip(await office.disabledControl().count() === 0, 'No disabled button is authored on this page')
    const url = page.url()
    await office.disabledControl().focus()
    await page.keyboard.press('Enter')
    await office.disabledControl().click({ force: true })
    await expect(page).toHaveURL(url)
  })

  test('DRP-3189-TC-008-C — focus remains on the same control when it is already focused', async ({ office }) => {
    const button = office.learnMore.first()
    await button.focus()
    await expect(button).toBeFocused()
    await button.focus()
    await expect(button).toBeFocused()
  })

  test('DRP-3189-TC-009 — AS Media frames are flush and have no inset border', async ({ office }) => {
    const frames = await office.mediaFramesHaveNoInset()
    expect(frames.length).toBeGreaterThan(0)
    for (const frame of frames) {
      expect(frame.border, frame.label).toBeLessThanOrEqual(1)
      expect(frame.flush, frame.label).toBe(true)
    }
  })
})
