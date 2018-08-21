import { Command, flags } from '@oclif/command'
import * as fs from 'fs'
import { compile } from '../utils/index'

export default class Compile extends Command {
    static description = 'Compiles a Solidity smart contract and returns the ABI'

    static examples = [
        `$ titan compile <path/to/Example.sol>`,
        `$ titan compile -n SpecificContract <path/to/ManyContracts.sol>`,
        `$ titan compile -d <path/to/Example.sol>`,
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
        name: flags.string({ char: 'n', description: 'specify which smart contract to compile within the file' }),
        detail: flags.boolean({ char: 'd', description: 'display more details about the contract' }),
    }

    static args = [{ name: 'file' }]

    async run() {
        const { args, flags } = this.parse(Compile)

        const sol = fs.readFileSync(process.cwd() + '/' + args.file, {
            encoding: 'utf8'
        })
        const res = await compile(sol)

        if (flags.name && flags.detail) {
            this.log(JSON.stringify(res[`${flags.name}`], null, 2))
        }
        else if (flags.name && !flags.detail) {
            this.log(JSON.stringify(res[`${flags.name}`].info.abiDefinition, null, 2))
        }
        else if (!flags.name && flags.detail) {
            Object.keys(res).map((i, value) => {
                this.log("\n\n<<{" + value + "} " + i + ">>\n")
                this.log(JSON.stringify(res[`${Object.keys(res)[value]}`], null, 2))
            })
        }
        else {
            Object.keys(res).map((i, value) => {
                this.log("\n\n<<{" + value + "} " + i + ">>\n")
                this.log(JSON.stringify(res[`${Object.keys(res)[value]}`].info.abiDefinition, null, 2))
            })
        }
    }
}
