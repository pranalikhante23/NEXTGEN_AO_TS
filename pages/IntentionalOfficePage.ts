import { expect, type Locator, type Page } from '@playwright/test'

export const INSIGHTS_PATH = '/intentional-office'

const MUTE_NAME = /mute|unmute|sound|volume/i
const PLAY_NAME = /play|pause/i
const CAPTION_NAME = /caption|subtitle|\bcc\b/i
const DOWNLOAD_NAME = /download/i

export class IntentionalOfficePage {
  readonly page: Page
  readonly main: Locator
  readonly title: Locator
  readonly footer: Locator
  readonly videos: Locator
  readonly learnMore: Locator

  constructor(page: Page) {
    this.page = page
    this.main = page.getByRole('main').first()
    this.title = page.getByRole('heading', { level: 1 }).first()
    this.footer = page.getByRole('contentinfo').first()
    this.videos = page.locator('main video, [role="main"] video, video')
    this.learnMore = page.getByRole('link', { name: /learn more/i })
  }

  async open(path = INSIGHTS_PATH) {
    const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' })
    return response
  }

  async expectPublishedHub() {
    await expect(this.title).toBeVisible()
    await expect(this.main).toBeVisible()
    await expect(this.page.getByText(/work in progress/i)).toHaveCount(0)
    await expect(this.main.getByText(/fatal error|something went wrong/i)).toHaveCount(0)
  }

  async setWidth(width: number) {
    await this.page.setViewportSize({ width, height: 900 })
    await this.open()
    await expect(this.title).toBeVisible()
  }

  async spaceBelowTitle() {
    return this.page.evaluate(() => {
      const title = document.querySelector('h1')
      if (!title) return -1
      const titleBox = title.getBoundingClientRect()
      const next = title.parentElement?.nextElementSibling ?? title.nextElementSibling
      if (!next) return Math.round(parseFloat(getComputedStyle(title).marginBottom) || 0)
      return Math.round(next.getBoundingClientRect().top - titleBox.bottom)
    })
  }

  async spaceAboveFooter() {
    return this.page.evaluate(() => {
      const footer = document.querySelector('footer')
      if (!footer) return -1
      const previous = footer.previousElementSibling
      const margin = Math.round(parseFloat(getComputedStyle(footer).marginTop) || 0)
      if (!previous) return margin
      const gap = Math.round(footer.getBoundingClientRect().top - previous.getBoundingClientRect().bottom)
      return Math.max(margin, gap)
    })
  }

  async contentFitsViewport() {
    return this.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  }

  heroVideo() {
    return this.videos.first()
  }

  playerRoot(video: Locator) {
    return video.locator('xpath=ancestor::*[.//button or .//a][1]')
  }

  muteControl(video: Locator) {
    return this.playerRoot(video).getByRole('button', { name: MUTE_NAME }).first()
  }

  playControl(video: Locator) {
    return this.playerRoot(video).getByRole('button', { name: PLAY_NAME }).first()
  }

  captionControl(video: Locator) {
    return this.playerRoot(video).getByRole('button', { name: CAPTION_NAME }).first()
  }

  async currentMediaUrl(target: Locator) {
    return target.evaluate((el) => {
      if (el instanceof HTMLMediaElement || el instanceof HTMLImageElement) {
        return el.currentSrc || (el as HTMLMediaElement).src || ''
      }
      return ''
    })
  }

  async mediaUrls() {
    return this.page.evaluate(() => {
      const urls: string[] = []
      for (const el of document.querySelectorAll('video, img, source')) {
        const media = el as HTMLMediaElement | HTMLImageElement | HTMLSourceElement
        const current = 'currentSrc' in media ? media.currentSrc : ''
        const src = media.getAttribute('src') || ''
        if (current) urls.push(current)
        if (src) urls.push(src)
      }
      return urls
    })
  }

  async urlContaining(fragment: string) {
    const urls = await this.mediaUrls()
    return urls.find((url) => url.includes(fragment))
  }

  carousel() {
    return this.page.getByRole('region', { name: /carousel|gallery/i }).first()
      .or(this.page.locator('[class*="carousel"], [class*="gallery"]').first())
  }

  carouselImages() {
    return this.carousel().locator('img')
  }

  downloadControl() {
    return this.carousel().getByRole('link', { name: DOWNLOAD_NAME })
      .or(this.carousel().getByRole('button', { name: DOWNLOAD_NAME }))
  }

  carouselNext() {
    return this.carousel().getByRole('button', { name: /next/i }).first()
  }

  carouselPrevious() {
    return this.carousel().getByRole('button', { name: /prev/i }).first()
  }

  async hoverActiveCarouselImage() {
    const image = this.carouselImages().first()
    await image.scrollIntoViewIfNeeded()
    await image.hover()
    return image
  }

  buttonByKind(kind: 'primary' | 'secondary' | 'tertiary') {
    if (kind === 'primary') return this.learnMore.first()
    return this.page.locator(`[class*="${kind}"], [data-variant*="${kind}"]`).getByRole('link').first()
      .or(this.page.locator(`[class*="${kind}"], [data-variant*="${kind}"]`).getByRole('button').first())
  }

  disabledControl() {
    return this.page.locator('button[disabled], button[aria-disabled="true"], a[aria-disabled="true"]').first()
  }

  async focusIndicator(locator: Locator) {
    await locator.focus()
    return locator.evaluate((el) => {
      const style = getComputedStyle(el)
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: parseFloat(style.outlineWidth) || 0,
        boxShadow: style.boxShadow,
      }
    })
  }

  async mediaFramesHaveNoInset() {
    return this.videos.evaluateAll((videos) => videos.map((video) => {
      const frame = video.closest('figure, [class*="media"], [data-layout]') ?? video.parentElement
      if (!frame) return { flush: false, border: 0, label: '' }
      const style = getComputedStyle(frame)
      const border = Math.max(
        parseFloat(style.borderTopWidth) || 0,
        parseFloat(style.paddingTop) || 0,
      )
      const label = `${frame.getAttribute('data-layout') || ''} ${frame.className}`
      return { flush: /flush/i.test(label) || border <= 1, border, label }
    }))
  }

  async videoWithCaptions() {
    const count = await this.videos.count()
    for (let i = 0; i < count; i++) {
      const video = this.videos.nth(i)
      const hasTrack = await video.locator('track[kind="captions"], track[kind="subtitles"]').count()
      if (hasTrack > 0) return video
    }
    return null
  }

  async videoWithoutCaptions() {
    const count = await this.videos.count()
    for (let i = 0; i < count; i++) {
      const video = this.videos.nth(i)
      const hasTrack = await video.locator('track[kind="captions"], track[kind="subtitles"]').count()
      if (hasTrack === 0) return video
    }
    return null
  }
}
