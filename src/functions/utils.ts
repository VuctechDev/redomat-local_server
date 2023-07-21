export const getUTC = () => {
  return new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000
}
