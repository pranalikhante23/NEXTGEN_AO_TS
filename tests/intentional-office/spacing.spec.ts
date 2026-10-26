import { expect, test } from './fixture'

const ANCHORS = [
  { width: 375, belowTitle: 40, aboveFooter: 96 },
  { width: 1440, belowTitle: 64, aboveFooter: 120 },
]

test.describe('Intentional Office spacing', () => {
  test('DRP-3189-TC-002 — title and footer spacing match tokens at 375 and 1440', async ({ office }) => {
    for (const anchor of ANCHORS) {
      await office.setWidth(anchor.width)
      expect(await office.spaceBelowTitle(), `title spacing at ${anchor.width}`).toBeCloseTo(anchor.belowTitle, 0)
      expect(await office.spaceAboveFooter(), `footer spacing at ${anchor.width}`).toBeCloseTo(anchor.aboveFooter, 0)
    }
  })

  test('DRP-3189-TC-002-N — mobile spacing is not the desktop token', async ({ office }) => {
    await office.setWidth(375)
    expect(await office.spaceBelowTitle()).not.toBeCloseTo(64, 0)
    expect(await office.spaceAboveFooter()).not.toBeCloseTo(120, 0)
  })

  test('DRP-3189-TC-002 — grid widths do not overflow', async ({ office }) => {
    for (const width of [1024, 1920]) {
      await office.setWidth(width)
      expect(await office.contentFitsViewport(), `overflow at ${width}`).toBe(true)
    }
  })

  test('DRP-3189-TC-002-C — spacing between anchors does not jump outside the surrounding values', async ({ office }) => {
    const samples: { width: number, belowTitle: number, aboveFooter: number }[] = []
    for (const width of [375, 700, 1024, 1200, 1440, 1700, 1920]) {
      await office.setWidth(width)
      samples.push({
        width,
        belowTitle: await office.spaceBelowTitle(),
        aboveFooter: await office.spaceAboveFooter(),
      })
    }

    for (let i = 1; i < samples.length - 1; i++) {
      const previous = samples[i - 1]
      const current = samples[i]
      const next = samples[i + 1]
      expect(current.belowTitle).toBeGreaterThanOrEqual(Math.min(previous.belowTitle, next.belowTitle) - 4)
      expect(current.belowTitle).toBeLessThanOrEqual(Math.max(previous.belowTitle, next.belowTitle) + 4)
      expect(current.aboveFooter).toBeGreaterThanOrEqual(Math.min(previous.aboveFooter, next.aboveFooter) - 4)
      expect(current.aboveFooter).toBeLessThanOrEqual(Math.max(previous.aboveFooter, next.aboveFooter) + 4)
    }
  })
})
