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
  const receipt = (
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

  const r2 = (
    <Printer children type="epson" width={32} characterSet="pc852_latin2">
      <Br />
      <Br />
      <Line character="-<3-" bold />

      <Br />
      <Br />
      <Text size={{ width: 2, height: 2 }} align="center" bold>
        Danas nam je divan dan, Divan dan, divan dan, Mojoj dragoj rođendan,
        Rođendan, rođendan. Živela, živela, I srećna nam bila. Živela, živela, I
        srećna nam bila. Sreća putuje noć i dan, I traži stan i traži stan.
        Raširi ruke, ispruži dlan, Srećan ti srećan rođendan. Živela, živela, I
        srećna nam bila. Živela, živela, I srećna nam bila..
      </Text>
      <Br />
      <Br />
      <Br />
      <Text size={{ width: 2, height: 2 }} align="center" bold>
        Bebiceee
      </Text>
      <Br />
      <Br />
      <Br />
      <Br />
      <Text size={{ width: 2, height: 2 }} align="center" bold>
        Srecan Rodjendan!!!
      </Text>
      <Br />
      <Br />
      <Br />
      <Br />
      <Text size={{ width: 2, height: 2 }} align="center" bold>
        {`VOLIM TE\nPUNOOO!!!`}
      </Text>
      <Br />
      <Br />
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="left" bold>
        {`Ja se stvarno nadam da se ne ljutis na mene jer tvoje kafice kasne, ja sam ih narucio na vrijeme ali je isporuka prolongirana za sutra :(`}
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="left" bold>
        {`Narucio sam raznih ukusa i raznih aroma pa cemo moci dugoo da uzivamo u lijepim jutarnjim i popodnevnim kaficama!!`}
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="left" bold>
        Nadam se da ti se svidja kako je lijepo upakovana ova kutijica :)
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="left" bold>
        Torticu nisam ja nazalost pravio jer ne znam kako se to radi ali sam
        svjecice bas ja birao i vjerujem da ti se bas svidjaju a i tortica bi
        trebala da bude bas ukusna mmmm
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 2, height: 2 }} align="center" bold>
        Srecan Rodjendan!!!
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="right" bold>
        Volim te
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="center" bold>
        Srecan Rodjendan
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="left" bold>
        Volim te
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="center" bold>
        Srecan Rodjendan
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="right" bold>
        Volim te
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="center" bold>
        Srecan Rodjendan
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="left" bold>
        Ipak za tebe imam jedno iznenadjenje i danas
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="left" bold>
        Mislim da ce ti se jako svidjeti
      </Text>
      <Br />
      <Br />
      <Text size={{ width: 1, height: 1 }} align="left" bold>
        Provjeri inbox na svom email-u :*
      </Text>
      <Br />
      <Br />

      <Line character="-<3-" bold />

      <Cut />
    </Printer>
  )

  return await render(receipt)
}

export const newPrint = async (data: Ticket) => {
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
