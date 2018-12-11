import {Command, flags} from '@oclif/command'

import {getConfig} from '../utils'

export default class Networks extends Command {
  static description = 'List all networks specified in the Titan config file'

  static examples = ['$ titan networks']

  static flags = {
    help: flags.help({char: 'h'}),
    blockchain: flags.string({
      char: 'b',
      description: 'the specified networks for a particular blockchain'
    })
  }

  async run() {
    const {flags} = this.parse(Networks)

    const config = getConfig()

    const selectedBlockchain = flags.blockchain
      ? flags.blockchain
      : config.defaultBlockchain
    const {networks} = config.blockchains[`${selectedBlockchain}`]
    Object.keys(networks).forEach((network: string) => {
      this.log(`[${network}] ${networks[network].host}`)
    })
  }
}
