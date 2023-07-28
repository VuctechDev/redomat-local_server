export const getUTC = () => {
  return new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000
}

export const formatNumber = (value: number) => {
  return value < 10 ? `0${value}` : `${value}`
}

export const getDisplayDate = (time?: number) => {
  const d = !!time ? new Date(time) : new Date()
  const date = formatNumber(d.getDate())
  const month = formatNumber(d.getMonth() + 1)
  const year = formatNumber(d.getFullYear())
  const hours = formatNumber(d.getHours())
  const minutes = formatNumber(d.getMinutes())
  const seconds = formatNumber(d.getSeconds())

  return `${date}.${month}.${year}, ${hours}:${minutes}:${seconds}`
}
