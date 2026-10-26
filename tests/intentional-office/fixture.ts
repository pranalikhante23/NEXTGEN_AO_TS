import { test as base } from '@playwright/test'
import { IntentionalOfficePage } from '../../pages/IntentionalOfficePage'

export const test = base.extend<{ office: IntentionalOfficePage }>({
  office: async ({ page }, use) => {
    const office = new IntentionalOfficePage(page)
    await office.open()
    await use(office)
  },
})

export { expect } from '@playwright/test'
