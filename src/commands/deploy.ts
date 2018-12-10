import {Command, flags} from '@oclif/command'
import {Aion} from '@titan-suite/core'
import cli from 'cli-ux'
import * as fs from 'fs'
import {Answers, prompt} from 'inquirer'
import * as mkdirp from 'mkdirp'
import * as notifier from 'node-notifier'
import * as path from 'path'

import {
  compile,
  deploy,
  getCurrentNetwork,
  getProvider,
  readContract,
  readUtf8
} from '../utils/index'

export default class Deploy extends Command {
  static description = 'Deploys a Solidity smart contract to an AION node'

  static examples = [
    '$ titan deploy <path/to/Example.sol>',
    '$ titan deploy -n SpecificContract <path/to/ManyContracts.sol>',
    '$ titan deploy -p 5 <path/to/ContractWithParams.sol>',
    '$ titan deploy -k <path/to/ContractWithParams.sol>',
    '$ titan deploy -t development <path/to/ContractWithParams.sol>'
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    name: flags.string({
      char: 'n',
      description: 'specify which smart contract to deploy within the file'
    }),
    params: flags.string({
      char: 'p',
      description: 'pass parameters to the smart contract',
      multiple: true
    }),
    privateKey: flags.boolean({
      char: 'k',
      description: 'pass parameters to the smart contract'
    }),
    network: flags.string({
      char: 't',
      description: 'specify the network to deploy the smart contract'
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

  deployToMainnetPrompt: Array<any> = [
    {
      type: 'list',
      name: 'confirm',
      message:
        "You're about to deploy to the mainnet. Would you like to proceed?",
      choices: ['Yes', 'No']
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
    privateKey?: string,
    targetNetwork?: string
  ) {
    cli.action.start('deploying')
    const abi = compiledContract[`${name}`].info.abiDefinition
    const code = compiledContract[`${name}`].code

    const {txReceipt, error}: any = await deploy(
      {
        abi,
        code,
        args: params,
        privateKey
      },
      targetNetwork
    )

    if (error) {
      this.error(/Error:\s+(.+)/gi.exec(error)![1])
    }

    const timeStamp: Date = new Date()
    const deployedAt: number = timeStamp.getTime()
    const currentNetwork = getCurrentNetwork()

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
        network: currentNetwork,
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

    if (flags.network) {
      const nodeAddress: string = getProvider(flags.network)
      const aion = new Aion(nodeAddress)
      const netId = await aion.getNetworkId()
      if ((netId === 256 || netId === 32) && !flags.privateKey) {
        this.error(
          'You must set the private key flag to deploy to this network. Run again with -k or run "titan deploy --help"'
        )
      }
    }

    if (flags.network === 'mainnet') {
      const answer: Answers = await prompt(this.deployToMainnetPrompt)
      answer.confirm === 'No'
        ? this.exit(0)
        : this.warn('Proceeding to deploy to mainnet')
    }

    const sol = readContract(args.file)
    const compiledContract: any = await compile(sol, false)

    let contractName
    let privateKey
    let targetNetwork = flags.network ? flags.network : ''
    const params = flags.params ? flags.params : []

    if (flags.privateKey) {
      const answer: Answers = await prompt(this.privateKeyPrompt)
      privateKey = answer.privateKey
      if (privateKey && privateKey.length === 130) {
      } else {
        this.error('Please provide a valid private key')
      }
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

    try {
      compiledContract[`${contractName}`].info
    } catch {
      this.error('The specified contract name does not exist')
    }

    await this.handleDeploy(
      contractName,
      compiledContract,
      params,
      privateKey,
      targetNetwork
    )
  }
}
