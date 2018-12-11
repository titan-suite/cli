import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as path from 'path'

import {Bolt, compile, readContract, readUtf8} from '../utils/index'

export default class Compile extends Command {
  static description =
    'Compiles a Solidity smart contract and returns the ABI and bytecode'

  static examples = [
    '$ titan compile <path/to/Example.sol>',
    '$ titan compile -n SpecificContract <path/to/ManyContracts.sol>',
    '$ titan compile -d <path/to/Example.sol>',
    '$ titan compile -l <path/to/Example.sol>'
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    name: flags.string({
      char: 'n',
      description: 'specify which smart contract to compile within the file'
    }),
    detailed: flags.boolean({
      char: 'd',
      description: 'display more details about the contract'
    }),
    locally: flags.boolean({
      char: 'l',
      description: 'compile contract locally'
    })
  }

  static args = [{name: 'file'}]

  getSimpleOutput = (compiledContract: any, name: string) => {
    let output
    if (name.startsWith(':')) {
      output = {
        abi: JSON.parse(compiledContract[`${name}`].interface),
        bytecode: '0x' + compiledContract[`${name}`].bytecode
      }
    } else {
      output = {
        abi: compiledContract[`${name}`].info.abiDefinition,
        bytecode: compiledContract[`${name}`].code
      }
    }
    const updated: string = new Date().toString()
    const data: Bolt = {name, ...output, updated}
    this.buildBolt(data)
    return output
  }

  buildBolt = (data: Bolt) => {
    const boltsPath = path.join(
      process.cwd(),
      'build',
      'bolts',
      `${data.name}.json`
    )

    let newBolt!: Bolt

    const exists = fs.existsSync(boltsPath)

    if (exists) {
      const old: any = readUtf8(boltsPath)
      newBolt = JSON.parse(old)
      newBolt.abi = data.abi
      newBolt.bytecode = data.bytecode
    } else {
      newBolt = data
    }

    mkdirp('build/bolts', err => {
      if (err) {
        throw err
      } else {
        fs.writeFile(boltsPath, JSON.stringify(newBolt, null, 4), err => {
          if (err) throw err
        })
      }
    })
  }

  stringifyOutput = (o: any) => {
    return JSON.stringify(o, null, 2)
  }

  async run() {
    const {args, flags} = this.parse(Compile)

    let compiled: any

    try {
      const sol = readContract(args.file)
      const compileLocally = flags.locally || false
      compileLocally && this.warn('The local compiler is not yet stable')
      compiled = await compile(sol, compileLocally)
    } catch (e) {
      this.error(e)
    }

    const contractName = flags.name
      ? flags.locally
        ? `:${flags.name}`
        : flags.name
      : undefined

    try {
      if (flags.name) compiled[`${contractName}`].info
    } catch {
      this.error('The specified contract name does not exist')
    }

    if (contractName && flags.detailed) {
      this.log(this.stringifyOutput(compiled[`${contractName}`]))
    } else if (contractName && !flags.detailed) {
      const output = this.getSimpleOutput(compiled, contractName)
      this.log(this.stringifyOutput(output))
    } else if (!contractName && flags.detailed) {
      Object.keys(compiled).map((i, value) => {
        this.log('\n\n<<{' + value + '} ' + i + '>>\n')
        const name = Object.keys(compiled)[value]
        this.log(this.stringifyOutput(compiled[`${name}`]))
      })
    } else {
      Object.keys(compiled).map((value, i) => {
        this.log('\n\n<<{' + i + '} ' + value + '>>\n')
        const output = this.getSimpleOutput(compiled, value)
        this.log(this.stringifyOutput(output))
      })
    }
  }
}
