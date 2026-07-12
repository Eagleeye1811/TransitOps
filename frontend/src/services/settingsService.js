import { ORG_SETTINGS } from '@/data/orgSettings'
import { delay } from '@/utils/delay'

let settings = { ...ORG_SETTINGS }

export async function getOrgSettings() {
  await delay(150)
  return { ...settings }
}

export async function updateOrgSettings(payload) {
  await delay()
  settings = { ...settings, ...payload }
  return { ...settings }
}
