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
import { getPrintLocationData } from './config'

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

export const getNewTicketPrintData = async (data: {
  orderNumber: number
  waiting: number
  serviceId: number
}) => {
  const { orderNumber, waiting, serviceId } = data
  const { counters, rooms, serviceName, locationName, address } =
    getPrintLocationData(serviceId)
  const date = new Date()
  const displayDate = `${date.getDate()}.${
    date.getMonth() + 1
  }.${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

  const receipt = (
    <Printer type="epson" width={32} characterSet="pc437_usa">
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
      <Text align="left">Broj Stranaka prije vas: {waiting - 1}</Text>
      <Br />
      <Text align="right">{displayDate}</Text>

      <Cut />
    </Printer>
  )

  return await render(receipt)
}

export const newPrint = async (data: {
  orderNumber: number
  waiting: number
  serviceId: number
}) => {
  const printData = await getNewTicketPrintData(data)
  // @ts-ignore
  outEnd.transfer(printData, (error) => {
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
