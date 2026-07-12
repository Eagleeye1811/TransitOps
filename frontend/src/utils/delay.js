// Simulates network latency for mock service calls so loading states are
// exercised the same way they will be once real API calls replace these.
export function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
