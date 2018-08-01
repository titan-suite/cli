const Web3 = require('aion-web3');
const {
  host,
  port,
  defaultAccount,
  password
} = require(`${process.cwd()}/titanrc.js`);
const provider = `${host}:${port}`;

const web3 = new Web3(new Web3.providers.HttpProvider(provider))
const mainAccount = defaultAccount.length > 0 ? defaultAccount : web3.personal.listAccounts[0]
const mainAccountPass = password

const compile = async function (w3, sol) {
  return new Promise((resolve, reject) => {
    w3.eth.compile.solidity(sol, (err, res) => {
      if (err) {
        reject(err)
      }

      if (res) {
        resolve(res)
      }
    })
  })
}

const unlock = async function (w3, addr, pw) {
  return new Promise((resolve, reject) => {
    w3.personal.unlockAccount(addr, pw, 999999, (err, unlock) => {
      if (err) reject(err)
      else if (unlock && unlock === true) {
        resolve(addr)
      } else {
        reject('unlock fail')
      }
    })
  })
}

const deploy = async function (w3, acc0, abi, code) {
  return new Promise((resolve, reject) => {
    w3.eth.contract(abi).new(
      {
        from: acc0,
        data: code,
        gas: 2000000
      },
      (err, contract) => {
        if (err) {
          reject(err)
        } else if (contract && contract.address) {
          resolve(contract)
        }
      }
    )
  })
}

module.exports = { compile, unlock, deploy, web3, mainAccount, mainAccountPass }