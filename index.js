#!/usr/bin/env node

const program = require('commander')
const { prompt } = require('inquirer')
const { spawn } = require('child_process')
const fs = require('fs')
const chalk = require('chalk')
const download = require('download-git-repo')
const MOCHA = './node_modules/mocha/bin/mocha'
const { compile, unlock, deploy } = require('./util.js')

const questions = [
  {
    type: 'input',
    name: 'account'
  },
  {
    type: 'password',
    name: 'password'
  }
]

const mkdir = (name) =>
  new Promise((resolve, reject) => {
    fs.existsSync(`${process.cwd()}/${name}`)
      ?
      resolve(true)
      :
      fs.mkdir(`${process.cwd()}/${name}`, (err, res) => {
        if (err) reject(err)
        else resolve(res)
      })
  })

program
  .version('0.0.8-alpha', '-v, --version')
  .description('CLI tool for Titan')

program
  .command('compile <contract>')
  .alias('c')
  .description('Compiles a Solidity smart contract')
  .option('-n, --contract_name <name>', 'Specify which contract to compile')
  .option('-d, --detailed_output', 'Return more detail about the contract')
  .action(async (contract, options) => {
    const sol = fs.readFileSync(process.cwd() + '/' + contract, {
      encoding: 'utf8'
    })
    const res = await compile(sol)

    if (options.contract_name && options.detailed_output) {
      console.log(JSON.stringify(res[`${options.contract_name}`], null, 2))
    }
    else if (options.contract_name && !options.detailed_output) {
      console.log(JSON.stringify(res[`${options.contract_name}`].info.abiDefinition, null, 2))
    }
    else if (!options.contract_name && options.detailed_output) {
      Object.keys(res).map((i, value) => {
        console.log("\n\n<<{" + value + "} " + i + ">>\n")
        console.log(JSON.stringify(res[`${Object.keys(res)[value]}`], null, 2))
      })
    }
    else {
      Object.keys(res).map((i, value) => {
        console.log("\n\n<<{" + value + "} " + i + ">>\n")
        console.log(JSON.stringify(res[`${Object.keys(res)[value]}`].info.abiDefinition, null, 2))
      })
    }

  })

program
  .command('unlock')
  .alias('u')
  .description('Unlocks an AION account')
  .action(() => {
    prompt(questions).then(async (answers) => {
      await unlock(answers['account'], answers['password'])
    })
  })

program
  .command('deploy <contract>')
  .alias('d')
  .option('-n, --contract_name <name>', 'Specify which smart contract to deploy within a contract file')
  .option('-p, --contract_args <params>', 'Pass parameters to the smart contract')
  .description(('Deploys a Solidity smart contract to an AION node'))
  .action(async (contract, options) => {
    const sol = fs.readFileSync(process.cwd() + '/' + contract, {
      encoding: 'utf8'
    })
    const compiledContract = await compile(sol)

    let contractName

    const deployContract = async (name) => {
      const _abi = compiledContract[`${name}`].info.abiDefinition
      const _code = compiledContract[`${name}`].code

      const deployedContract = options.contract_args ?
        await deploy(_abi, String(_code), options.contract_args) :
        await deploy(_abi, String(_code))

      console.log("Successfully deployed!")
      console.log('Deployment Details:')
      console.log("contract:", name)
      console.log("address:", deployedContract["contractAddress"])
      console.log("transaction hash:", deployedContract["transactionHash"])
      console.log("NRG used:", deployedContract["nrgUsed"])
      console.log("block number:", deployedContract["blockNumber"])
      console.log("from:", deployedContract["from"])
      console.log("to:", deployedContract["to"])
      console.log("logs:", deployedContract["logs"])

      await mkdir("build")
      await mkdir("build/bolts")

      fs.open(`${process.cwd()}/build/bolts/${name}.json`, 'w', (err, fd) => {
        if (err) {
          if (err.code === 'EEXIST') {
            fs.unlink(`${process.cwd()}/build/bolts/${name}.json`, (err) => {
              if (err) throw err;
            })
          }
        }

        else {
          const deployedContractDetails = {
            'contract': name,
            'abi': _abi,
            'deployed_address': deployedContract["contractAddress"],
            'transaction_hash': deployedContract["transactionHash"],
            'block_number': deployedContract["blockNumber"]
          }
          fs.writeFile(`${process.cwd()}/build/bolts/${name}.json`, JSON.stringify(deployedContractDetails, null, 4), (err) => {
            if (err) throw err
          })
        }
      });
    }

    if (options.contract_name) {
      contractName = options.contract_name
      deployContract(contractName)
    } else if (Object.keys(compiledContract).length === 1) {
      contractName = Object.keys(compiledContract)[0]
      deployContract(contractName)
    } else {
      let promptQuestions = [{
        type: 'list',
        name: 'selected_contract',
        message: 'Choose a contract to deploy',
        choices: [],
      }]
      const generateChoices = (arr) => {
        for (const i in arr) {
          promptQuestions[0].choices.push(arr[i])
        }
      }

      generateChoices(Object.keys(compiledContract))

      prompt(promptQuestions)
        .then(answer => {
          contractName = answer["selected_contract"]
          deployContract(contractName)
        })
    }
  })

program
  .command('test [file]')
  .alias('t')
  .description('Run unit tests for smart contract interaction')
  .action((file) => {
    if (file)
      spawn(`${MOCHA}`, ['--require', 'babel-polyfill', '--require', 'babel-register', file], { stdio: 'inherit', cwd: process.cwd() })
    else
      spawn(`${MOCHA}`, ['--require', 'babel-polyfill', '--require', 'babel-register'], { stdio: 'inherit', cwd: process.cwd() })
  })

program
  .command('init [name]')
  .alias('i')
  .description('Creates a skeleton dApp with AION')
  .action(async (name) => {
    if (!name) {
      fs.readdir(process.cwd(), (err, files) => {
        if (err) throw err

        if (files.length) {
          console.log(chalk`
          {yellow.bold WARNING}
          {yellow Some existing files may be overwritten.}
          `)
          prompt([
            {
              type: 'list',
              name: 'overwrite',
              message: 'Do you want to continue?',
              choices: ['Yes', 'No']
            }
          ])
            .then(answer => {
              if (answer['overwrite'] === 'Yes') {
                download('github:titan-suite-packs/default-pack', process.cwd(), function (err) {
                  console.log(err ? 'Error' : 'Successfully unpacked default dApp')
                })
              }
            })
        }
        else {
          download('github:titan-suite-packs/default-pack', process.cwd(), function (err) {
            console.log(err ? 'Error' : 'Successfully unpacked default dApp')
          })
        }
      })
    }
    else {
      await (mkdir(name))
      download('github:titan-suite-packs/default-pack', `${process.cwd()}/${name}`, function (err) {
        console.log(err ? 'Error' : 'Successfully unpacked default dApp')
      })
    }
  })

program
  .command('unpack [pack]')
  .alias('k')
  .description('Provides boilerplate code with everything needed to develop a dApp with AION')
  .action((pack) => {

    const downloadPack = (_pack) => {
      switch (_pack) {
        case "react":
          download('github:titan-suite-packs/react-pack', process.cwd(), function (err) {
            console.log(err ? 'Error' : 'Successfully unpacked React dApp')
          })
          break;
        // case "vue":
        //   download('github:titan-suite-packs/vue-pack', process.cwd(), function (err) {
        //     console.log(err ? 'Error' : 'Successfully unpacked Vue dApp')
        //   })
        //   break;
        default:
          download('github:titan-suite-packs/default-pack', process.cwd(), function (err) {
            console.log(err ? 'Error' : 'Successfully unpacked default dApp')
          })
          break;
      }
    }

    if (!pack) {
      let promptQuestions = [{
        type: 'list',
        name: 'selected_pack',
        message: 'Choose a pack to download',
        choices: ['react', 'default'],
        // choices: ['react', 'vue', 'default'],
      }]

      prompt(promptQuestions)
        .then(answer => {
          downloadPack(answer["selected_pack"])
        })
    }
    else {
      downloadPack(pack)
    }

  })

program
  .command('lint <contract>')
  .alias('l')
  .description('Analyzes your Solidity code for style, security issues and suggests fixes for them')
  .action((contract) => {
    const solhint = require('solhint')
    spawn(`${solhint}`, [contract], { stdio: 'inherit', cwd: process.cwd() })
  })

program
  .command('console')
  .alias('n')
  .description('Interactive web3 console for an AION node.')
  .action(() => {
    spawn(`node ${require('./console.js')}`, { cwd: process.cwd(), shell: true })
  })


program.parse(process.argv)