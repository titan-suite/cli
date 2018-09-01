import { Command, flags } from '@oclif/command'
import * as fs from 'fs'
import chalk from 'chalk'
import { prompt, Answers } from 'inquirer'
import { downloadPack } from '../utils/index'

export default class Init extends Command {
    static description = 'Create a new Titan environment'

    static examples = [
        `$ titan init`,
        `$ titan init <name>`,
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
    }

    static args = [{ name: 'newFolder' }]


    async run() {
        const { args } = this.parse(Init)

        if (args.newFolder) {
            downloadPack('default', `${args.newFolder}`)
        }
        else {
            fs.readdir(process.cwd(), async (err, files) => {
                if (err) throw err

                if (files.length) {
                    this.log(chalk`
                {yellow.bold WARNING}
                {yellow Some existing files may be overwritten.}
                `)
                    const answer: Answers = await prompt([
                        {
                            type: 'list',
                            name: 'overwrite',
                            message: 'Do you want to continue?',
                            choices: ['Yes', 'No']
                        }
                    ])
                    answer['overwrite'] === 'Yes' ? downloadPack('default') : this.log('aborting...')
                }
                else {
                    downloadPack('default')
                }
            })
        }

    }
}
