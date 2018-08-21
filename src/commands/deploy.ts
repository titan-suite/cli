import { Command, flags } from '@oclif/command'
import * as fs from 'fs'
import * as notifier from 'node-notifier'
import { prompt, Answers } from 'inquirer'
import cli from 'cli-ux'
import { compile, deploy, mkdir } from '../utils/index'

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

    async handleDeploy(_name: String, _compiledContract: any) {
        cli.action.start('deploying')
        const _abi = _compiledContract[`${_name}`].info.abiDefinition
        const _code = _compiledContract[`${_name}`].code

        const deployedContract = flags.params ?
            await deploy(_abi, String(_code), flags.params) :
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

        await mkdir("build")
        await mkdir("build/bolts")

        fs.open(`${process.cwd()}/build/bolts/${_name}.json`, 'w', (err, fd) => {
            if (err) {
                if (err.code === 'EEXIST') {
                    fs.unlink(`${process.cwd()}/build/bolts/${_name}.json`, (err) => {
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
                fs.writeFile(`${process.cwd()}/build/bolts/${_name}.json`, JSON.stringify(deployedContractDetails, null, 4), (err) => {
                    if (err) throw err
                    notifier.notify({
                        title: 'Titan',
                        message: `🚀 Successfully deployed: ${_name}!`
                    })
                })
            }
        });
        cli.action.stop()
    }

    async run() {
        const { args, flags } = this.parse(Deploy)

        const sol = fs.readFileSync(process.cwd() + '/' + args.file, {
            encoding: 'utf8'
        })
        const compiledContract = await compile(sol)

        let contractName

        if (flags.name) {
            contractName = flags.name
            this.handleDeploy(contractName, compiledContract)
        } else if (Object.keys(compiledContract).length === 1) {
            contractName = Object.keys(compiledContract)[0]
            this.handleDeploy(contractName, compiledContract)
        } else {
            this.generateChoices(Object.keys(compiledContract))

            const answer: Answers = prompt(this.questions)
            contractName = answer["selected_contract"]
            this.handleDeploy(contractName, compiledContract)
        }
    }
}
