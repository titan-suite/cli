import {Command, flags} from '@oclif/command'
import {spawn} from 'child_process'
import * as fs from 'fs'

export default class Exec extends Command {
    static description = 'Run a custom helper script '

    static examples = [
        '$ titan exec <path/to/script.js>',
    ]

    static flags = {
        help: flags.help({char: 'h'}),
    }

    static args = [{name: 'file'}]

    async run() {
        const {args} = this.parse(Exec)

        const exists = fs.existsSync(args.file)

        if (args.file && exists) {
            spawn('node', [args.file], {stdio: 'inherit', cwd: process.cwd()})
        } else {
            throw new Error('Please specify a file to run')
        }

    }
}
