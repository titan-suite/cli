import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'

import Deploy from './deploy'

export default class Migrate extends Command {
  static description = 'Run migrations to deploy contracts'

  static examples = [
    '$ titan migrate',
    '$ titan migrate <path/to/migrate/migrateExample.js>',
    '$ titan migrate -t development <path/to/migrate/migrateExample.js>'
  ]

  static args = [{name: 'file'}]

  static flags = {
    help: flags.help({char: 'h'}),
    privateKey: flags.boolean({
      char: 'k',
      description: 'pass parameters to the smart contract'
    }),
    network: flags.string({
      char: 't',
      description: 'specify the network to deploy the smart contract'
    })
  }

  async run() {
    const {args} = this.parse(Migrate)

    const deployer = new Deploy([''], this.config) // TODO pass params
    let migrationFile

    if (args.file) {
      migrationFile = path.join(process.cwd(), `${args.file}`)

      if (!fs.existsSync(migrationFile))
        this.error('The migration file does not exist')

      const migration = require(migrationFile)
      migration(deployer)
    } else {
      // TODO loop through migrations folder
    }
  }
}
