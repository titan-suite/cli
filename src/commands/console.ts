import { Command, flags } from '@oclif/command'
const Web3 = require('aion-web3')
const repl = require('repl')


export default class Console extends Command {
    static description = 'Interact with your AION node through an `aion-web3` instance.'

    static examples = [
        `$ titan console`,
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
    }

    async run() {
        const { flags } = this.parse(Console)


        const { host, port } = require(`${process.cwd()}/titanrc.js`)

        const provider = `${host}:${port}`

        try {
            const endpoint = provider
            let testWeb3 = new Web3(new Web3.providers.HttpProvider(endpoint)).eth.coinbase

            const server = repl.start('console@' + endpoint + '$ ')

            const context = server.context
            context.Web3 = new Web3();
            context.web3 = new Web3(new Web3.providers.HttpProvider(endpoint));
            context.eth = context.web3.eth;
            context.personal = context.web3.personal;
        }
        catch (err) {
            this.log(/Error:\s+(.+)/gi.exec(err)![1])
        }
    }
}
