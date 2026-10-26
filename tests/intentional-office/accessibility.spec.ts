import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './fixture'

test.describe('Intentional Office accessibility', () => {
  test('DRP-3189-TC-012 — tab order follows visual order and focus is visible', async ({ page, office }) => {
    await office.title.focus().catch(() => {})
    let previousTop = -1
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      const box = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el) return null
        const rect = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        return {
          top: rect.top,
          outline: style.outlineStyle,
          outlineWidth: parseFloat(style.outlineWidth) || 0,
          shadow: style.boxShadow,
        }
      })
      expect(box).not.toBeNull()
      if (previousTop >= 0 && box!.top > 0) {
        expect(box!.top).toBeGreaterThanOrEqual(previousTop - 48)
      }
      const visible = (box!.outline !== 'none' && box!.outlineWidth > 0) || box!.shadow !== 'none'
      expect(visible).toBe(true)
      previousTop = box!.top
    }
  })

  test('DRP-3189-TC-012-N — axe reports no serious or critical violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze()
    const blocking = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  })

  test('DRP-3189-TC-012-C — Shift+Tab from the first control does not leave the page', async ({ page }) => {
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    await expect(page).toHaveURL(/intentional-office/)
  })
})
