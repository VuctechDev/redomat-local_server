import { findByIds, Device, Endpoint } from 'usb'
import React from 'react'
import {
  Printer,
  Br,
  Cut,
  Line,
  Text,
  Row,
  render,
  QRCode,
} from 'react-thermal-printer'
import { getPrintLocationData, locales } from './config'
import { getConfig, getPendingCount, Ticket } from './store'
import { getDisplayDate } from './functions/utils'

let device: Device
let outEnd: Endpoint

export const initiatePrinter = () => {
  device = findByIds(1110, 2056)
  device.open()
  const endpoints = device.interfaces[0].endpoints
  //   const inEnd = endpoints[0]
  outEnd = endpoints[1]
  let check = false
  if (device.interfaces[0].isKernelDriverActive()) {
    check = true
    device.interfaces[0].detachKernelDriver()
  }

  device.interfaces[0].claim()
}

export const getNewTicketPrintData = async (data: Ticket) => {
  const { orderNumber, serviceId } = data
  const waiting = getPendingCount(serviceId) as number
  const { counters, rooms, serviceName, locationName, address } =
    getPrintLocationData(serviceId)
  const displayDate = getDisplayDate()
  const locale = getConfig('locale')
  const defaultReceipt = (
    <Printer children type="epson" width={32} characterSet="pc437_usa">
      <Text size={{ width: 2, height: 2 }} align="left">
        {locationName}
      </Text>
      <Text align="left">{address}</Text>
      <Br />
      <Text bold={true} size={{ width: 6, height: 7 }} align="center">
        {orderNumber}
      </Text>
      <Br />
      <Text align="left">{serviceName}</Text>
      {counters && (
        <>
          <Text align="left">{counters}</Text>
        </>
      )}
      {rooms && (
        <>
          <Text align="left">{rooms}</Text>
        </>
      )}
      <Br />
      <Text align="left">{`${locales[locale].waiting} ${waiting - 1}`}</Text>
      <Br />
      <Text align="right">{displayDate}</Text>

      <Cut />
    </Printer>
  )

  return await render(defaultReceipt)
}

const currencies = {
  BAM: 'KM',
  EUR: '€',
  USD: '$',
  GBP: '£',
  RSD: ' RSD',
}

export const getSelfServiceReceipt = async (data: any) => {
  const { serviceId, price, sessionCode } = data
  const { serviceName, locationName, currency } =
    getPrintLocationData(serviceId)
  const displayDate = getDisplayDate()

  const selfServiceReceipt = (
    <Printer children type="epson" width={32} characterSet="pc437_usa">
      <Text size={{ width: 2, height: 2 }} align="left">
        {locationName}
      </Text>

      <Br />
      <Text align="center">{serviceName}</Text>
      <Br />
      <Br />
      <Text bold={true} size={{ width: 3, height: 5 }} align="center">
        {price}
        {currencies[currency]}
      </Text>
      <Br />
      <Br />
      <QRCode
        content={JSON.stringify({ code: sessionCode })}
        cellSize={6}
        align="center"
        model="micro"
      />
      <Br />
      <Text align="right">{displayDate}</Text>

      <Cut />
    </Printer>
  )

  return await render(selfServiceReceipt)
}

export const newPrint = async (data: Uint8Array) => {
  // @ts-ignore
  outEnd.transfer(data, (error) => {
    if (error) {
      console.log('ERROR:', error)
    }
  })
}

// inEnd.on("data", ((data) => {
//   console.log("DATA:", data)
// }))

// SUBSYSTEM=="usb", ATTRS={idVendor}=="1110", ATTRS{idProduct}=="2056", OWNER="stefan", GROUP="plugdev", TAG+="uaccess"

// setTimeout(() => {
//     device.interfaces[0].release((e) => {
//     if(check) {
//       device.interfaces[0].attachKernelDriver()
//     }
//     device.close()
//     console.log("DEVICE CLOSED")
//   })
//   }, 1000);
