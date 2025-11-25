function normalize(value = '') {
  return value
    .replace('T', ' ')
    .replace(/-/g, '/')
    .replace(/\.\d+/, '')
}

function parseDateTime(value) {
  if (!value && value !== 0) return null
  if (value instanceof Date) return value
  if (typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }
  if (typeof value === 'string') {
    const normalized = normalize(value)
    const date = new Date(normalized)
    return isNaN(date.getTime()) ? null : date
  }
  return null
}

function getTimestamp(value) {
  const date = parseDateTime(value)
  return date ? date.getTime() : 0
}

function formatMonthDayTime(value) {
  const date = parseDateTime(value)
  if (!date) return ''
  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function pad(num) {
  return num < 10 ? `0${num}` : `${num}`
}

module.exports = {
  parseDateTime,
  getTimestamp,
  formatMonthDayTime
}
