function normalize(value = '') {
  // 处理 iOS 不支持 "yyyy/MM/dd HH:mm:ssZ" 的情况
  // 标准 ISO 格式是 "yyyy-MM-ddTHH:mm:ssZ"
  // 如果已经包含 Z，且包含空格，说明是非标准 ISO，将空格换回 T
  if (value.includes('Z') && value.includes(' ')) {
    return value.replace(' ', 'T')
  }

  // 对于其他情况，保持现有的逻辑，将 - 换成 / 是为了兼容极旧的 iOS 版本对非 ISO 格式的支持
  // 但对于标准 ISO 字符串，应尽量保持原样或转为标准 T 分隔
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
