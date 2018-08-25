const fs = require('fs')
const path = require('path')
const Web3 = require('aion-web3')

let port
let host
let defaultAccount
let providerUrl
let web3

function init() {
  if (web3 !== undefined) {
    // its already initialized
    return
  }
  const titanrcPath = path.join(process.cwd(), 'titanrc.js')
  const titanrcExists = fs.existsSync(titanrcPath)
  if (titanrcExists === false) {
    throw new Error(`${titanrcPath} not found`)
  }
  const titanrc = require(titanrcPath)
  port = titanrc.port || 8545
  host = titanrc.host || '127.0.0.1'
  defaultAccount = titanrc.defaultAccount
  provider = `${host}:${port}`
  web3 = new Web3(new Web3.providers.HttpProvider(provider))
}

const compile = async function (sol) {
  init()
  return new Promise((resolve, reject) => {
    web3.eth.compile.solidity(sol, (err, res) => {
      if (err) {
        reject(err)
      }

      if (res) {
        resolve(res)
      }
    })
  })
}

const unlock = async function (addr, pw) {
  init()
  return new Promise((resolve, reject) => {
    web3.personal.unlockAccount(addr, pw, 999999, (err, unlock) => {
      if (err) reject(err)
      else if (unlock && unlock === true) {
        console.log('unlocked', addr)
        resolve(addr)
      } else {
        reject('unlock failed')
      }
    })
  })
}

const deploy = async function (abi, code, args) {
  init()
  const mainAccount = defaultAccount || web3.personal.listAccounts[0]
  return new Promise((resolve, reject) => {
    console.log('deploying...\n')
    if (args && args.length > 0) {
      web3.eth.contract(abi).new(
        ...args.split(','),
        {
          from: mainAccount,
          data: code,
          gas: 4700000
        },
        (err, res) => {
          if (err) {
            reject(err)
          } else if (res && res.address) {
            resolve(web3.eth.getTransactionReceipt(res.transactionHash))
          }
        }
      )
    } else {
      web3.eth.contract(abi).new(
        {
          from: mainAccount,
          data: code,
          gas: 4700000
        },
        (err, res) => {
          if (err) {
            reject(err)
          } else if (res && res.address) {
            resolve(web3.eth.getTransactionReceipt(res.transactionHash))
          }
        }
      )
    }
  })
}


module.exports = { compile, unlock, deploy, web3 }