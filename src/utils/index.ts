import * as fs from 'fs'
import * as path from 'path'
const download = require('download-git-repo')
const Web3 = require('aion-web3')

const utf8 = { encoding: 'utf8' }

let port: String
let host: String
let defaultAccount: String
let provider: String
let web3: any

const init = () => {
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


const contractPath = (contract: any) => {
    // optional .sol
    const contractFile = contract.endsWith('.sol') ? contract : `${contract}.sol`
    return path.join(process.cwd(), contractFile)
}

const readUtf8 = (absolutePath: string) => fs.readFileSync(absolutePath, utf8)

export const readContract = (contract: any) => readUtf8(contractPath(contract))

export const compile = async function (sol: String) {
    init()
    return new Promise((resolve, reject) => {
        web3.eth.compile.solidity(sol, (err: any, res: any) => {
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
    init()
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
    init()
    const mainAccount = defaultAccount || web3.personal.listAccounts[0]
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

export const downloadPack = (_pack: String, _path?: String) => {
    const downloadPath = _path || process.cwd()

    switch (_pack) {
        case "react":
            download(`github:titan-suite-packs/react-pack`, downloadPath, function (err: any) {
                console.log(err ? 'Error' : `Successfully unpacked react dApp`)
            })
            break;
        default:
            download(`github:titan-suite-packs/default-pack`, downloadPath, function (err: any) {
                console.log(err ? 'Error' : `Successfully unpacked default dApp`)
            })
            break;
    }
}
