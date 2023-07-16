import React from "react"
import {
    Printer, Br, Cut, Line, Text, Row, render ,QRCode
} from "react-thermal-printer"

const receipt = (<Printer children type="epson" width={32} characterSet="pc437_usa"> 
{/* <Text>Stefan</Text>  */}
<Text>{'\u00F7'}</Text> 
<Text>{'\u25C0'}</Text> 
<Text>{'\u221A'}</Text> 
<Text>{'\u2021'}</Text> 
{/* <Text>{'\2602'}</Text>  */}
{/* <Line character={"\u2665"} /> */}
{/* <Line character={"&#9829"} /> */}
<Cut/> 
</Printer>)

export const getPrintData = async () => {
    const data: Uint8Array = await render(receipt)
    return data
}