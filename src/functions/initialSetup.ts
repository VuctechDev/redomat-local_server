import fs from 'fs'

export const checkInitialSetup = async () => {
  const checkOrder = fs.existsSync('orderNumber.txt')
  const checkopenTickets = fs.existsSync('openTickets.json')
  const checkLogs = fs.existsSync('logs.json')
  const checkInternalId = fs.existsSync('internalId.txt')
  const credit= fs.existsSync('credit.txt')
  if (!checkOrder) {
    fs.writeFileSync('orderNumber.txt', JSON.stringify(0))
  }
  if (!checkopenTickets) {
    fs.writeFileSync('openTickets.json', JSON.stringify([]))
  }
  if (!checkLogs) {
    fs.writeFileSync('logs.json', JSON.stringify([]))
  }
  if (!checkInternalId) {
    fs.writeFileSync('internalId.txt', JSON.stringify(1))
  }
  if (!credit) {
    fs.writeFileSync('credit.txt', JSON.stringify(0))
  }
}
