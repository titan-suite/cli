import {Command, flags} from '@oclif/command'
const Web3 = require('aion-web3')
const repl = require('repl')
import {getProvider} from '../utils'

export default class Console extends Command {
  static description =
    'Interact with your AION node through an `aion-web3` instance.'

  static examples = [
    '$ titan console',
    '$ titan console http://127.0.0.1:8545'
  ]

  static flags = {
    help: flags.help({char: 'h'})
  }

  static args = [{name: 'provider'}]

  testWeb3(_provider: string) {
    let _w3 = new Web3(new Web3.providers.HttpProvider(_provider))
    _w3.eth.getBlock('latest')
  }

  async run() {
    const {args} = this.parse(Console)

    let provider = args.provider || getProvider()

    try {
      this.testWeb3(provider)

      const server = repl.start('console@' + provider + '$ ')

      const context = server.context
      context.Web3 = new Web3()
      context.web3 = new Web3(new Web3.providers.HttpProvider(provider))
      context.eth = context.web3.eth
      context.personal = context.web3.personal
    } catch (err) {
      this.log(/Error:\s+(.+)/gi.exec(err)![1])
    }
  }
}
