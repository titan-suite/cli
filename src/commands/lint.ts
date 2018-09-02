import {Command, flags} from '@oclif/command'
import {spawn} from 'child_process'

export default class Lint extends Command {
    static description = 'Analyzes your Solidity contract for potential errors and suggests fixes for them'

    static examples = [
        '$ titan lint <path/to/Example.sol>',
    ]

    static flags = {
        help: flags.help({char: 'h'}),
    }

    static args = [{name: 'file'}]

    async run() {
        const {args} = this.parse(Lint)

        const solhint = require('solhint')
        spawn(`${solhint}`, [args.file], {stdio: 'inherit', cwd: process.cwd()})
    }
}
