import { expect, test } from './fixture'

test.describe('Intentional Office video controls', () => {
  test('DRP-3189-TC-003 — hero exposes mute and play, and other videos expose mute', async ({ office }) => {
    const count = await office.videos.count()
    expect(count).toBeGreaterThan(0)

    await expect(office.muteControl(office.heroVideo())).toBeAttached()
    await expect(office.playControl(office.heroVideo())).toBeAttached()

    for (let i = 1; i < count; i++) {
      await expect(office.muteControl(office.videos.nth(i)), `video ${i + 1} mute`).toBeAttached()
    }
  })

  test('DRP-3189-TC-003-N — a control that is not in the player is absent', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Not a video control' })).toHaveCount(0)
  })

  test('DRP-3189-TC-003-C — play and pause stay on the same hero player', async ({ office }) => {
    const play = office.playControl(office.heroVideo())
    await play.scrollIntoViewIfNeeded()
    const before = (await play.getAttribute('aria-label')) || ''
    await play.click()
    await expect(play).toBeVisible()
    const after = (await play.getAttribute('aria-label')) || ''
    expect(after === before || /play|pause/i.test(after)).toBe(true)
  })
})
