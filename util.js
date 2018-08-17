const Web3 = require('aion-web3');
const { host, port, defaultAccount } = require(`${process.cwd()}/titanrc.js`);
const provider = `${host}:${port}`;

const web3 = new Web3(new Web3.providers.HttpProvider(provider))
const mainAccount = defaultAccount || web3.personal.listAccounts[0]

const compile = async function (sol) {
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