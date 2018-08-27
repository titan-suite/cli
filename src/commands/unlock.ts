import { Command, flags } from '@oclif/command'
import * as fs from 'fs'
import { prompt, Answers } from 'inquirer'
import { unlock } from '../utils/index'

export default class Unlock extends Command {
    static description = 'Unlocks an AION account'

    static examples = [
        `$ titan unlock`,
        `$ titan unlock -a 0xbeef...`,
        `$ titan unlock -a 0xc0de... -p the_password`,
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
        address: flags.string({ char: 'a', description: 'the address to unlock' }),
        password: flags.string({ char: 'p', description: 'the password of the account' }),
    }

    questions: Array<any> = [
        {
            type: 'input',
            name: 'account'
        },
        {
            type: 'password',
            name: 'password'
        }
    ]

    async run() {
        const { flags } = this.parse(Unlock)

        if (flags.address && flags.password) {
            await unlock(flags.address, flags.password)
        }
        else if (flags.address && !flags.password) {
            prompt(this.questions[1]).then(async (answers: Answers) => {
                await unlock(String(flags.address), answers['password'])
            })
        }
        else {
            prompt(this.questions).then(async (answers: Answers) => {
                await unlock(answers['account'], answers['password'])
            })
        }

    }
}
