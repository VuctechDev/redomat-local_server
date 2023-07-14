import fs from 'fs'

export const getInternalId = (): number => {
  let internalId = +fs.readFileSync('internalId.txt', 'utf8')
  internalId++
  fs.writeFileSync('internalId.txt', JSON.stringify(internalId))
  return internalId
}
