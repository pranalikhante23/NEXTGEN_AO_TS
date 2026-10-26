import { expect, test } from './fixture'

const HERO_WIDTH = [
  { viewport: 1440, widthParam: 'w_1920' },
  { viewport: 1024, widthParam: 'w_1000' },
  { viewport: 375, widthParam: 'w_550' },
]

const ASSETS = [
  { viewport: 1440, fragment: 'f_auto,q_auto/c_fill,g_auto,w_1250,ar_16:9' },
  { viewport: 1024, fragment: 'f_auto,q_auto/c_fill,g_auto,w_1000,ar_16:9' },
  { viewport: 375, fragment: 'f_auto,q_auto/c_fill,g_auto,w_550,ar_16:9' },
  { viewport: 1440, fragment: 'f_auto,q_auto/w_1250' },
  { viewport: 1024, fragment: 'f_auto,q_auto/w_1000' },
  { viewport: 375, fragment: 'f_auto,q_auto/w_550' },
  { viewport: 1440, fragment: 'f_auto,q_auto/c_fill,g_auto,w_800,ar_5:4' },
  { viewport: 1024, fragment: 'f_auto,q_auto/c_fill,g_auto,w_1000,ar_5:4' },
  { viewport: 375, fragment: 'f_auto,q_auto/c_fill,g_auto,w_550,ar_5:4' },
]

test.describe('Intentional Office Cloudinary delivery', () => {
  for (const band of HERO_WIDTH) {
    test(`DRP-3189-TC-004 — hero video at ${band.viewport}px includes f_auto,q_auto and ${band.widthParam}`, async ({ office }) => {
      await office.setWidth(band.viewport)
      const url = await office.currentMediaUrl(office.heroVideo())
      expect(url, url).toContain('f_auto,q_auto')
      expect(url, url).toContain(band.widthParam)
    })
  }

  test('DRP-3189-TC-004-N — the 375px hero URL does not use the desktop width', async ({ office }) => {
    await office.setWidth(375)
    const url = await office.currentMediaUrl(office.heroVideo())
    expect(url).not.toContain('w_1920')
  })

  test('DRP-3189-TC-004-C — reloading the same viewport keeps the hero width param', async ({ office }) => {
    await office.setWidth(1440)
    const first = await office.currentMediaUrl(office.heroVideo())
    await office.open()
    const second = await office.currentMediaUrl(office.heroVideo())
    expect(second).toContain('w_1920')
    expect(second.split('?')[0]).toBe(first.split('?')[0])
  })

  for (const asset of ASSETS) {
    test(`DRP-3189-TC-005 — ${asset.viewport}px serves ${asset.fragment}`, async ({ office }) => {
      await office.setWidth(asset.viewport)
      const match = await office.urlContaining(asset.fragment)
      expect(match, `missing ${asset.fragment}`).toBeTruthy()
    })
  }
})
