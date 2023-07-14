import fs from 'fs'

export const getOrderNumber = (): number => {
  let orderNumber = +fs.readFileSync('orderNumber.txt', 'utf8')
  if (orderNumber < 1000) {
    orderNumber++
  } else {
    orderNumber = 0
  }
  fs.writeFileSync('orderNumber.txt', JSON.stringify(orderNumber))
  return orderNumber
}
