import {Aion} from '@titan-suite/core'
import cli from 'cli-ux'
import * as download from 'download-git-repo'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import * as solc from 'solc'

import {getTemplateContract, getTemplateTest} from './templates'

const utf8 = {encoding: 'utf8'}

let defaultAccount: string
let currentNetwork: string

export interface Bolt {
  name: string
  abi: any[]
  bytecode: string
  migrations?: any[]
  updated?: string
}

interface DeployInfo {
  code: string
  abi?: any[]
  from?: string
  gas?: number
  gasPrice?: number
  args?: any[]
  privateKey?: string
}

export const getConfig = () => {
  const titanrcPath = path.join(process.cwd(), 'titanrc.js')
  const titanrcExists = fs.existsSync(titanrcPath)
  if (titanrcExists === false) {
    throw new Error(`${titanrcPath} not found`)
  }
  const config = require(titanrcPath)
  return config
}

export const getCurrentNetwork = () => {
  return currentNetwork
}

export const getProvider = (targetNetwork?: string) => {
  const config = getConfig()
  const {networks} = config.blockchains.aion
  if (!networks || Object.keys(networks).length === 0) {
    throw new Error(
      'Please specify at least one network to connect to in your titanrc file'
    )
  }
  currentNetwork =
    targetNetwork && targetNetwork.length > 0 ? targetNetwork : 'development'
  try {
    defaultAccount = networks[`${currentNetwork}`].defaultAccount
    const provider = networks[`${currentNetwork}`].host
    return provider
  } catch {
    throw Error(
      "Please specify a target network or ensure 'development' is one of the networks"
    )
  }
}

const contractPath = (contract: any) => {
  const contractFile = contract.endsWith('.sol') ? contract : `${contract}.sol`
  return path.join(process.cwd(), contractFile)
}

export const readUtf8 = (absolutePath: string) =>
  fs.readFileSync(absolutePath, utf8)

export const readContract = (contract: any) => readUtf8(contractPath(contract))

export const compile = async function (sol: string, locally: boolean) {
  if (locally) {
    return new Promise((resolve, reject) => {
      const {contracts, errors} = solc.compile(sol, 1)
      if (errors) reject(errors)
      resolve(contracts)
    })
  } else {
    const nodeAddress: string = getProvider()
    const aion = new Aion(nodeAddress)
    return aion.compile(sol)
  }
}

export const unlock = async function (addr: string, pw: string) {
  cli.action.start('unlocking')
  const nodeAddress: string = getProvider()
  const aion = new Aion(nodeAddress)
  const unlocked = await aion.unlock(addr, pw)
  const message = unlocked ? 'Successfully unlocked' : 'Failed to unlock'
  cli.action.stop(message)
}

export const deploy = async function (
  {abi, code, args, privateKey}: DeployInfo,
  targetNetwork?: string
) {
  const nodeAddress: string = getProvider(targetNetwork)
  const aion = new Aion(nodeAddress)
  let from: string

  if (privateKey) {
    from = await aion.web3.eth.accounts.privateKeyToAccount(privateKey)
  } else {
    from = defaultAccount || (await aion.getAccounts())[0]
  }

  return aion
    .deploy({code, abi, from, args, privateKey})
    .then(txReceipt => {
      return txReceipt
    })
    .catch(error => {
      console.error(/Error:\s+(.+)/gi.exec(error)![1])
      return error
    })
}

const promisify = (fn: any, ...args: any[]) =>
  new Promise((resolve, reject) => {
    fn(...args, function (err: any, res: any) {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })

export const downloadPack = async (_pack: string, _path?: string) => {
  const downloadPath = _path || process.cwd()
  cli.action.start('downloading')

  switch (_pack) {
    case 'react':
      await promisify(
        download,
        'github:titan-suite-packs/react-pack',
        downloadPath
      )
      break
    case 'react-native':
      await promisify(
        download,
        'github:titan-suite-packs/react-native-pack',
        downloadPath
      )
      break
    case 'default':
      await promisify(
        download,
        'github:titan-suite-packs/default-pack',
        downloadPath
      )
      break
    default:
      console.log(
        'This pack is not available. View available packs at https://github.com/titan-suite-packs'
      )
      console.log('Run titan unpack -h for the correct usage')
  }

  cli.action.stop()
}

export const createTemplate = async (type: string, name: string) => {
  cli.action.start(`creating new ${type} file`)
  let boltPath: string
  let template: string

  switch (type) {
    case 'contract':
      boltPath = path.join(process.cwd(), 'contracts', `${name}.sol`)
      template = await getTemplateContract(name)
      createFile('contracts', boltPath, template)
      break
    case 'test':
      boltPath = path.join(process.cwd(), 'test', `${name}.js`)
      template = await getTemplateTest(name)
      createFile('test', boltPath, template)
      break
    // case 'migration': // TODO
    //     break
    default:
  }
  cli.action.stop()
}

const createFile = async (name: string, filePath: string, content: string) => {
  mkdirp(name, err => {
    if (err) {
      throw err
    } else {
      fs.writeFile(filePath, content, err => {
        if (err) throw err
      })
    }
  })
}
