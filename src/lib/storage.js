export function setCaughtIds(caughtIds) {
  window.localStorage.setItem('caughtIds', JSON.stringify(caughtIds))
}

export function getCaughtIds() {
  const caughtIds = window.localStorage.getItem('caughtIds')
  if (!caughtIds) {
    return []
  }
  return JSON.parse(caughtIds)
}