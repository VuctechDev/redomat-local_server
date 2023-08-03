import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { ReadlineParser, SerialPort } from 'serialport'
import { CCTalkParser } from '@serialport/parser-cctalk'


const slave = 2
const master = 1

const getMessage = (header: number, data: number[] = []) => {
  const dataLength = data.length
  const dataSum = data.reduce((sum, current) => sum + current, 0)
  const checkSumDiff = -master - slave - header - dataLength - dataSum
  const checkSum = 256 + (checkSumDiff % 256)
  const message = new Uint8Array([
    slave,
    dataLength,
    master,
    header,
    ...data,
    checkSum,
  ])
  console.log('MESSAGE:', message)
  return message
}

let coinCounter = 0
let coinValues = []

const signalProcessor = (data: Buffer) => {
  const bytes = data[1]
  if (bytes) {
    let value = ''
    if (bytes === 11) {
      const receivedCount = data[4]
      const diff = (receivedCount - coinCounter) * 2
      if (diff) {
        for (let i = 5; i < diff + 5; i++) {
          const bufferValue = data[i]
          if (i % 2) {
            if (bufferValue) {
              coinValues = [...coinValues, { error: false, value: bufferValue }]
            }
          } else {
            if (bufferValue !== 1) {
              coinValues = [...coinValues, { error: true, value: bufferValue }]
            }
          }
        }
        coinCounter = receivedCount
        getBalance()
      }
    } else {
      for (let i = 4; i < bytes + 4; i++) {
        value += String.fromCharCode(data[i])
      }
    }
  }
}

const getBalance = () => {
  const nonErrorValues = coinValues.filter((x) => !x.error)
  const value10 = nonErrorValues.filter((x) => x.value == 1).length * 0.1
  const value20 = nonErrorValues.filter((x) => x.value == 2).length * 0.2
  const value50 = nonErrorValues.filter((x) => x.value == 3).length * 0.5
  const value100 = nonErrorValues.filter((x) => x.value == 4).length
  const value200 = nonErrorValues.filter((x) => x.value == 5).length * 2
  const value500 = nonErrorValues.filter((x) => x.value == 6).length * 5
  const total = value500 + value200 + value100 + value50 + value20 + value10
  console.log('0.10KM:', value10, 'KM')
  console.log('0.20KM:', value20, 'KM')
  console.log('0.50KM:', value50, 'KM')
  console.log('1KM:', value100, 'KM')
  console.log('2KM:', value200, 'KM')
  console.log('5KM:', value500, 'KM')
  console.log('TOTAL:', total, 'KM')
  console.log('ERRORS NO:', coinValues.length - nonErrorValues.length)
  console.log('--------------------------------------')
}

var mycmd = getMessage(254)
var mycmd2 = getMessage(231, [255, 255])
var mycmd3 = getMessage(228, [1])
var mycmd4 = getMessage(229)

export const loop = async () => {
  // const aa = await SerialPort.list()
  // console.log('LIST:', aa)

  const port = new SerialPort({ path: 'COM4', baudRate: 9600 })
  const parser = port.pipe(new CCTalkParser(100))

  port.write(mycmd)

  setTimeout(() => {
    port.write(mycmd2)
  }, 1000)

  setTimeout(() => {
    port.write(mycmd3)
  }, 2000)

  setTimeout(() => {
    setInterval(() => {
      port.write(mycmd4)
    }, 300)
  }, 3000)

  parser.on('data', signalProcessor)
  parser.on('error', console.log)
}

