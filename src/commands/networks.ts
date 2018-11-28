import {Command, flags} from '@oclif/command'
const titanrc = require(`${process.cwd()}/titanrc.js`)
const {networks} = titanrc

export default class Networks extends Command {
    static description = 'Returns all networks specified in the Titan project'

    static examples = [
        '$ titan networks',
    ]

    static flags = {
        help: flags.help({char: 'h'}),
    }

    async run() {
        Object.keys(networks).forEach((network: any, index: number) => {
            this.log(`${index}: [${network}] ${networks[network].host}`)
        })
    }
}
