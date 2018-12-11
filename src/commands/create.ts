import {Command, flags} from '@oclif/command'

import {createTemplate} from '../utils'

export default class Create extends Command {
    static description = 'Initialize new template contracts and tests'

    static examples = [
        '$ titan create contract <BoltName>',
        '$ titan create test <BoltName>',
        // '$ titan create migration <BoltName>',
    ]

    static flags = {
        help: flags.help({char: 'h'}),
    }

    static args = [{name: 'type'}, {name: 'boltName'}]

    async run() {
        const {args} = this.parse(Create)

        const {type, boltName} = args

        if (type && boltName) {
            await createTemplate(type, boltName)
        } else {
            this.log('Please specify a correct type')
        }

    }
}
