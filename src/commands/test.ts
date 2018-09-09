import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import * as mocha from 'mocha'

export default class Test extends Command {
    static description = 'Run unit tests that interact Solidity smart contract'

    static examples = [
        '$ titan test <path/to/test/testExample.js>',
    ]

    static flags = {
        help: flags.help({char: 'h'}),
    }

    static args = [{name: 'file'}]

    async run() {
        const {args} = this.parse(Test)

        let _mocha = new mocha()

        if (args.file) {
            _mocha.addFile(`${process.cwd()}/${args.file}`)
        } else {
            fs.readdirSync(`${process.cwd()}/test`).filter(function (file) {
                return file.substr(-3) === '.js'

            }).forEach(function (file) {
                _mocha.addFile(`${process.cwd()}/test/${file}`)
            })

        }

        _mocha.run(function (failures: any) {
            process.exitCode = failures ? -1 : 0  // exit with non-zero status if there were failures
        })

    }
}
