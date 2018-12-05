import {Command, flags} from '@oclif/command'

export default class Migrate extends Command {
    static description = 'Run unit migrates that interact Solidity smart contract'

    static examples = [
        '$ titan migrate <path/to/migrate/migrateExample.js>',
    ]

    static flags = {
        help: flags.help({char: 'h'}),
        network: flags.string({char: 'n', description: 'specify the network to run the migration scripts on'})
    }

    static args = [{name: 'file'}]

    async run() {
        const {args} = this.parse(Migrate)

    }
}
