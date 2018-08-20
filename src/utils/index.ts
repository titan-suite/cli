import * as fs from 'fs'
const download = require('download-git-repo')

const Web3 = require('aion-web3')
const { host, port, defaultAccount } = require(`${process.cwd()}/titanrc.js`)
const provider = `${host}:${port}`

export const web3 = new Web3(new Web3.providers.HttpProvider(provider))
const mainAccount = defaultAccount || web3.personal.listAccounts[0]


export const compile = async function (sol: String) {
    return new Promise((resolve, reject) => {
        web3.eth.compile.solidity(sol, (err: any, res: String) => {
            if (err) {
                reject(err)
            }

            if (res) {
                resolve(res)
            }
        })
    })
}

export const unlock = async function (addr: String, pw: String) {
    return new Promise((resolve, reject) => {
        web3.personal.unlockAccount(addr, pw, 999999, (err: any, unlock: Boolean) => {
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

export const deploy = async function (abi: String, code: String, args?: any) {
    return new Promise((resolve, reject) => {
        if (args && args.length > 0) {
            web3.eth.contract(abi).new(
                ...args.split(','),
                {
                    from: mainAccount,
                    data: code,
                    gas: 4700000
                },
                (err: any, res: any) => {
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
                (err: any, res: any) => {
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

export const mkdir = (name: String) =>
    new Promise((resolve, reject) => {
        fs.existsSync(`${process.cwd()}/${name}`)
            ?
            resolve(true)
            :
            fs.mkdir(`${process.cwd()}/${name}`, (err) => {
                if (err) reject(err)
            })
    })

export const downloadPack = (_pack: String, _path?: String) => {
    const downloadPath = _path || process.cwd()

    switch (_pack) {
        case "react":
            download('github:titan-suite-packs/react-pack', downloadPath, function (err: any) {
                console.log(err ? 'Error' : 'Successfully unpacked React dApp')
            })
            break;
        default:
            download('github:titan-suite-packs/default-pack', downloadPath, function (err: any) {
                console.log(err ? 'Error' : 'Successfully unpacked default dApp')
            })
            break;
    }
}
