/**
 * Mock VIN/RC "decode" lookup.
 *
 * There is no free Indian RC/Vahan lookup API available, and services like
 * NHTSA's vPIC only decode real US-issued VINs — so this simulates the UX of
 * a registration-number decode without making a real network call. It picks
 * a pseudo-random profile from a small set of realistic Indian commercial
 * vehicle specs and returns it after a short artificial delay, so repeated
 * clicks don't always yield an identical result.
 */

const MOCK_PROFILES = [
  { model: 'Tata Ace Gold VAN-05', type: 'Van', capacityKg: 750 },
  { model: 'Ashok Leyland Dost+', type: 'Mini Truck', capacityKg: 1250 },
  { model: 'Mahindra Bolero Pik-Up', type: 'Pickup', capacityKg: 1700 },
  { model: 'Eicher Pro 2049 Container', type: 'Container', capacityKg: 4900 },
  { model: 'Tata 407 Gold SFC', type: 'Truck', capacityKg: 2500 },
]

const DECODE_DELAY_MS_MIN = 600
const DECODE_DELAY_MS_MAX = 900

function randomDelay() {
  return DECODE_DELAY_MS_MIN + Math.random() * (DECODE_DELAY_MS_MAX - DECODE_DELAY_MS_MIN)
}

/**
 * Simulates decoding a vehicle profile from a registration number.
 * @param {string} registration - the registration string entered by the user (used only to seed variety, not validated).
 * @returns {Promise<{model: string, type: string, capacityKg: number}>}
 */
export function mockVinDecode(registration) {
  // Fold the registration string into the seed so the "lookup" isn't purely
  // random noise, while still varying across repeated clicks.
  const seed = (registration ?? '')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return new Promise((resolve) => {
    setTimeout(() => {
      const index = Math.floor((Math.random() * 1000 + seed) % MOCK_PROFILES.length)
      const profile = MOCK_PROFILES[index]
      resolve({ ...profile })
    }, randomDelay())
  })
}
