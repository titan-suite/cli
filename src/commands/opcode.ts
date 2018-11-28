import {Command, flags} from '@oclif/command'

import {compile, readContract} from '../utils/index'
const opcodes = require('../utils/opcodes')

export default class Opcode extends Command {
    static description = 'Returns the opcode for a smart contract'

    static examples = [
        '$ titan opcode <path/to/Example.sol>',
    ]

    static flags = {
        help: flags.help({char: 'h'}),
    }

    static args = [{name: 'file'}]

    getOpcode = (byteCode: string) => {
        // Convert to an array of bytes (denoted by substrings)
        let code: any = byteCode.match(/(..?)/g)

        // Remove the last 43 bytes, which is the contract metadata
        code.splice(-43)

        // Convert to Buffer
        code = Buffer.from(code.join('').replace('0x', ''), 'hex')

        const instructions = []
        for (let pc = 0; pc < code.length; pc++) {
            const opcode = opcodes(code[pc], true)
            opcode.pc = pc
            if (opcode.name.slice(0, 4) === 'PUSH') {
                const length = code[pc] - 0x5F
                opcode.pushData = code.slice(pc + 1, pc + length + 1)

                // convert pushData to hex
                opcode.pushData = '0x' + opcode.pushData.toString('hex')

                pc += length
            }
            instructions.push(opcode)
        }
        return instructions
    }

    async run() {
        const {args} = this.parse(Opcode)

        const sol = readContract(args.file)
        const compiled: any = await compile(sol)

        Object.keys(compiled).forEach(contractName => {
            this.log(`\nopcodes for ${contractName}`)
            let opcodes: any[] = this.getOpcode(compiled[`${contractName}`].code)
            const indexLength = ((opcodes.length) + '').length

            opcodes.forEach((opcode, index) => {
            let strIndex = index + ':'

            while (strIndex.length < indexLength + 1) {
                strIndex += ' '
            }

            this.log(strIndex + ' ' + opcode.name + ' ' + (opcode.pushData || ''))
            })

        })

    }
}
