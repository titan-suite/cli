import { Command, flags } from '@oclif/command'
import * as fs from 'fs'
import { spawn } from 'child_process'

export default class Lint extends Command {
    static description = 'Analyzes your Solidity contract for potential errors and suggests fixes for them'

    static examples = [
        `$ titan lint <path/to/Example.sol>`,
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
    }

    static args = [{ name: 'file' }]

    async run() {
        const { args, flags } = this.parse(Lint)

        const sol = fs.readFileSync(process.cwd() + '/' + args.file, {
            encoding: 'utf8'
        })

        const solhint = require('solhint')
        spawn(`${solhint}`, [args.file], { stdio: 'inherit', cwd: process.cwd() })
    }
}
