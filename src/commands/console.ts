import {Command, flags} from '@oclif/command'
const Web3 = require('aion-web3')
const repl = require('repl')
import {getCurrentNetwork, getProvider} from '../utils'

export default class Console extends Command {
  static description = 'Interact with an AION node'

  static examples = ['$ titan console', '$ titan console -t development']

  static flags = {
    help: flags.help({char: 'h'}),
    network: flags.string({
      char: 't',
      description: 'specify the network to connect to'
    })
  }

  testWeb3(_provider: string) {
    let _w3 = new Web3(new Web3.providers.HttpProvider(_provider))
    _w3.eth.getBlock('latest')
  }

  async run() {
    const {flags} = this.parse(Console)

    let provider = getProvider(flags.network)
    const currentNetwork = getCurrentNetwork()

    try {
      this.testWeb3(provider)

      const server = repl.start('console@' + currentNetwork + '$ ')

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
