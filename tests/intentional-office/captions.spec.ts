import { expect, test } from './fixture'

test.describe('Intentional Office captions', () => {
  test('DRP-3189-TC-010 — CC is available when a WebVTT track is authored', async ({ office }) => {
    const video = await office.videoWithCaptions()
    test.skip(video === null, 'No video on this environment has an authored captions URL')
    const captions = office.captionControl(video!)
    await expect(captions).toBeVisible()
    await captions.click()
    await expect(video!.locator('track[kind="captions"], track[kind="subtitles"]').first()).toHaveAttribute('src', /.+\.vtt|captions/i)
  })

  test('DRP-3189-TC-011 — CC stays hidden when no captions URL is authored', async ({ office }) => {
    const video = await office.videoWithoutCaptions()
    expect(video, 'expected at least one video without captions').not.toBeNull()
    await expect(office.captionControl(video!)).toHaveCount(0)
  })

  test('DRP-3189-TC-011-N — a captions track is not attached to an unauthored video', async ({ office }) => {
    const video = await office.videoWithoutCaptions()
    expect(video).not.toBeNull()
    await expect(video!.locator('track[kind="captions"], track[kind="subtitles"]')).toHaveCount(0)
  })
})
