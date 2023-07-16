import { findByIds, Device, Endpoint } from 'usb'
import React from "react"
import {
    Printer, Br, Cut, Line, Text, Row, render ,QRCode
} from "react-thermal-printer"

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



export const getPrintData = async () => {

  const receipt = (<Printer children type="epson" width={32} characterSet="pc437_usa"> 
<Cut/> 
</Printer>)
    const data: Uint8Array = await render(receipt)
    return data
}

export const newPrint = (data: Uint8Array) => {
  // if(!data) {
  //   data = 
  // }
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
