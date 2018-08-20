import { Command, flags } from '@oclif/command'
const Web3 = require('aion-web3')
const repl = require('repl')
const { host, port } = require(`${process.cwd()}/titanrc.js`)

import { spawn } from 'child_process'


export default class Console extends Command {
    static description = 'Interact with your AION node through an `aion-web3` instance.'

    static examples = [
        `$ titan console`,
        // `$ titan console -p http://127.0.0.1:8545`,
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
        // provider: flags.string({ char: 'p', description: 'the HTTP provider of your AION node' }),
    }

    async run() {
        const { flags } = this.parse(Console)

        const provider = `${host}:${port}`

        try {
            // const endpoint = flags.provider ? flags.provider : provider
            const endpoint = provider
            // this.log(endpoint)
            let testWeb3 = new Web3(new Web3.providers.HttpProvider(endpoint)).eth.coinbase

            const server = repl.start('console@' + endpoint + '$ ')
            // server.on('exit', this.log('session ended'))

            const context = server.context
            context.Web3 = new Web3();
            context.web3 = new Web3(new Web3.providers.HttpProvider(endpoint));
            context.eth = context.web3.eth;
            context.personal = context.web3.personal;

            // server.on('exit', this.log('session ended'))
        }
        catch (err) {
            this.log(/Error:\s+(.+)/gi.exec(err)![1])
        }

        // let self = this
        // const server = spawn(`node ${require('../utils/console')}`, { cwd: process.cwd(), shell: true })
        // server.on('close', () => { self.log('tessst') })

    }
}
