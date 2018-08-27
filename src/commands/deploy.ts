import { Command, flags } from '@oclif/command'
import * as fs from 'fs'
import * as notifier from 'node-notifier'
import * as mkdirp from 'mkdirp'
import * as path from 'path'
import { prompt, Answers } from 'inquirer'
import cli from 'cli-ux'
import { compile, deploy, readContract } from '../utils/index'

export default class Deploy extends Command {
    static description = 'Deploys a Solidity smart contract to an AION node'

    static examples = [
        `$ titan deploy <path/to/Example.sol>`,
        `$ titan deploy -n SpecificContract <path/to/ManyContracts.sol>`,
        `$ titan deploy -p 5 <path/to/ContractWithParams.sol>`,
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
        name: flags.string({ char: 'n', description: 'specify which smart contract to deploy within the file' }),
        params: flags.string({ char: 'p', description: 'pass parameters to the smart contract' }),
    }

    static args = [{ name: 'file' }]

    questions: Array<any> = [{
        type: 'list',
        name: 'selected_contract',
        message: 'Choose a contract to deploy',
        choices: [],
    }]

    generateChoices(arr: String[]) {
        for (const i in arr) {
            this.questions[0].choices.push(arr[i])
        }
    }

    async handleDeploy(_name: string, _compiledContract: any, _params?: any) {
        cli.action.start('deploying')
        const _abi = _compiledContract[`${_name}`].info.abiDefinition
        const _code = _compiledContract[`${_name}`].code

        const deployedContract: any = _params ?
            await deploy(_abi, String(_code), _params) :
            await deploy(_abi, String(_code))

        this.log("Successfully deployed!")
        this.log('Deployment Details:')
        this.log("contract:", _name)
        this.log("address:", deployedContract["contractAddress"])
        this.log("transaction hash:", deployedContract["transactionHash"])
        this.log("NRG used:", deployedContract["nrgUsed"])
        this.log("block number:", deployedContract["blockNumber"])
        this.log("from:", deployedContract["from"])
        this.log("to:", deployedContract["to"])
        this.log("logs:", deployedContract["logs"])

        mkdirp("build/bolts", (err, made) => { if (err) throw err })


        const boltsPath = path.join(process.cwd(), 'build', 'bolts', `${_name}.json`)
        fs.open(boltsPath, 'w', (err, fd) => {
            if (err) {
                if (err.code === 'EEXIST') {
                    fs.unlink(boltsPath, (err) => {
                        if (err) throw err;
                    })
                }
            }

            else {
                const deployedContractDetails = {
                    'contract': _name,
                    'abi': _abi,
                    'deployed_address': deployedContract["contractAddress"],
                    'transaction_hash': deployedContract["transactionHash"],
                    'block_number': deployedContract["blockNumber"]
                }
                fs.writeFile(boltsPath, JSON.stringify(deployedContractDetails, null, 4), (err) => {
                    if (err) throw err
                })
            }
        });
        cli.action.stop()

        notifier.notify({
            title: 'Titan',
            message: `🚀 Successfully deployed: ${_name}!`
        })
    }

    async run() {
        const { args, flags } = this.parse(Deploy)

        const sol = readContract(args.file)
        const compiledContract: any = await compile(sol)

        let contractName

        if (flags.name) {
            contractName = flags.name
            this.handleDeploy(contractName, compiledContract, flags.params)
        } else if (Object.keys(compiledContract).length === 1) {
            contractName = Object.keys(compiledContract)[0]
            this.handleDeploy(contractName, compiledContract, flags.params)
        } else {
            this.generateChoices(Object.keys(compiledContract))

            const answer: Answers = await prompt(this.questions)
            contractName = answer["selected_contract"]
            this.handleDeploy(contractName, compiledContract, flags.params)
        }
    }
}
