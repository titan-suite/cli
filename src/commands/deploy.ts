import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import * as fs from 'fs'
import {Answers, prompt} from 'inquirer'
import * as mkdirp from 'mkdirp'
import * as notifier from 'node-notifier'
import * as path from 'path'

import {compile, deploy, readContract, readUtf8} from '../utils/index'

export default class Deploy extends Command {
  static description = 'Deploys a Solidity smart contract to an AION node'

  static examples = [
    '$ titan deploy <path/to/Example.sol>',
    '$ titan deploy -n SpecificContract <path/to/ManyContracts.sol>',
    '$ titan deploy -p 5 <path/to/ContractWithParams.sol>',
    '$ titan deploy -k 0xa... <path/to/ContractWithParams.sol>'
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    name: flags.string({
      char: 'n',
      description: 'specify which smart contract to deploy within the file'
    }),
    params: flags.string({
      char: 'p',
      description: 'pass parameters to the smart contract'
    }),
    privateKey: flags.boolean({
      char: 'k',
      description: 'pass parameters to the smart contract'
    })
  }

  static args = [{name: 'file'}]

  contractChoicePrompt: Array<any> = [
    {
      type: 'list',
      name: 'selected_contract',
      message: 'Choose a contract to deploy',
      choices: []
    }
  ]

  privateKeyPrompt: Array<any> = [
    {
      type: 'password',
      name: 'privateKey',
      message: 'private key'
    }
  ]

  generateChoices(arr: string[]) {
    for (let i of arr) {
      this.contractChoicePrompt[0].choices.push(i)
    }
  }

  async handleDeploy(
    name: string,
    compiledContract: any,
    params?: any[],
    privateKey?: string
  ) {
    cli.action.start('deploying')
    const abi = compiledContract[`${name}`].info.abiDefinition
    const code = compiledContract[`${name}`].code

    const {txReceipt}: any = await deploy({
      abi,
      code,
      args: params,
      privateKey
    })
    const timeStamp: Date = new Date()
    const deployedAt: number = timeStamp.getTime()

    // this.log('Successfully deployed!')
    // this.log('Deployment Details:')
    // this.log('contract:', name)
    // this.log('address:', txReceipt.contractAddress)
    // this.log('transaction hash:', txReceipt.transactionHash)
    // this.log('NRG used:', txReceipt.nrgUsed)
    // this.log('block number:', txReceipt.blockNumber)
    // this.log('from:', txReceipt.from)
    // this.log('to:', txReceipt.to)
    // this.log('logs:', txReceipt.logs)

    const boltsPath = path.join(
      process.cwd(),
      'build',
      'bolts',
      `${name}.json`
    )

    const exists = fs.existsSync(boltsPath)
    let migrations: any[] = []
    const newMigration = {
      [deployedAt]: {
        address: txReceipt.contractAddress,
        transactionHash: txReceipt.transactionHash,
        blockNumber: txReceipt.blockNumber
      }
    }

    if (exists) {
      const bolt: any = readUtf8(boltsPath)
      migrations = JSON.parse(bolt).migrations
      migrations.push(newMigration)
    } else {
      migrations.push(newMigration)
    }

    mkdirp('build/bolts', err => {
      if (err) {
        throw err
      } else {
        const bolt = {
          contract: name,
          abi,
          migrations,
          updated: timeStamp.toString()
        }

        fs.writeFile(boltsPath, JSON.stringify(bolt, null, 4), err => {
          if (err) throw err
        })
      }
    })

    cli.action.stop()

    notifier.notify({
      title: 'Titan',
      message: `🚀 Successfully deployed: ${name}!`
    })
  }

  async run() {
    const {args, flags} = this.parse(Deploy)

    const sol = readContract(args.file)
    const compiledContract: any = await compile(sol)

    let contractName
    let privateKey

    if (flags.privateKey) {
      const answer: Answers = await prompt(this.privateKeyPrompt)
      privateKey = answer.privateKey
    }

    if (flags.name) {
      contractName = flags.name
    } else if (Object.keys(compiledContract).length === 1) {
      contractName = Object.keys(compiledContract)[0]
    } else {
      this.generateChoices(Object.keys(compiledContract))
      const answer: Answers = await prompt(this.contractChoicePrompt)
      contractName = answer.selected_contract
    }
    let params = flags.params ? flags.params.split(',') : []
    await this.handleDeploy(contractName, compiledContract, params, privateKey)
  }
}
