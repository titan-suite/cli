<img src="https://s15.postimg.cc/spmnht6zf/Titan_Logo.png" width="100" height="100">  

@titan-suite/cli
================

The complete Smart Contract development CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@titan-suite/cli.svg)](https://npmjs.org/package/@titan-suite/cli)

[![CircleCI](https://circleci.com/gh/titan-suite/cli/tree/master.svg?style=shield)](https://circleci.com/gh/titan-suite/cli/tree/master)

[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/titan-suite/cli?branch=master&svg=true)](https://ci.appveyor.com/project/titan-suite/cli/branch/master)
[![Codecov](https://codecov.io/gh/titan-suite/cli/branch/master/graph/badge.svg)](https://codecov.io/gh/titan-suite/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@titan-suite/cli.svg)](https://npmjs.org/package/@titan-suite/cli)
[![License](https://img.shields.io/npm/l/@titan-suite/cli.svg)](https://github.com/titan-suite/cli/blob/master/package.json)


# Usage

- `yarn add global @titan-suite/cli` or `npm i -g @titan-suite/cli`
- In your project root, create a `titanrc.js` file and specify the following:
    - `host`: the URL of your `aion-web3` provider
    - `port`: the port exposing an `aion-web3` instance, usually *8545*
    - `defaultAccount` [optional]: the default address to call functions with
    - `password` [optional]: the password of this account
```javascript
   module.exports = {
       "host": "http://127.0.0.1",
       "port": 8545,
       "defaultAccount": "",
       "password": ""
   }
```


# Commands

## Help
- `titan --help`

![](https://s15.postimg.cc/dlbpyw5jf/help.gif)

## `titan init` 

Generate an empty Titan project
- in the current directory: `titan init`
- in a new directory: `titan init <name>`

![](https://s15.postimg.cc/aeh6fbijf/init.gif)

## `titan unpack`

Start a new project with a pre-built dApp
- `titan unpack`
    - choose a pack from the options
- `titan unpack <name>`

![](https://s15.postimg.cc/cj1jgqrzf/unpack.gif)

## `titan compile`

Compile a Solidity smart contract
- `titan compile <path/to/contracts/Example.sol>`
- Compile a specific contract withing a file
    - `titan compile -n SpecificContract <path/to/contracts/ManyContracts.sol>`
- Output more details about the contract
    - `titan compile -d <path/to/contracts/Example.sol>`

![](https://s15.postimg.cc/88mvkpk6z/compile.gif)

## `titan deploy`

Deploy a smart contract to an AION node
- `titan deploy <path/to/contracts/Example.sol>`
- Deploy a specific contract within a contract file:
    - `titan deploy -n Test <path/to/contracts/Example.sol>`
- Pass parameters:
    - `titan deploy -p 5 <path/to/contracts/Example.sol>`
_The details of the deployed contract will be stored as `./build/bots/<contractName>.json`_

![](https://s15.postimg.cc/rf02obvob/deploy.gif)

## `titan lint`

Lint a smart contract
- `titan lint <path/to/contracts/Example.sol>`

![](https://s15.postimg.cc/4qavos1fv/lint.gif)

## `titan test`

Run unit tests
- `titan test <path/to/contracts/testExample.js>`

![](https://s15.postimg.cc/okwxawod7/test.gif)

## `titan unlock`

Unlock an account
- `titan unlock`
- with the account specified
    - `titan unlock -a <0x..>`
- with both the account and password specified
    - `titan unlock -a <0x...> -p <pwd>`
_You will be prompted to enter an AION address and password_

![](https://s15.postimg.cc/ulum7y8ej/unlock.gif)

## `titan console`

Interact with an AION node with an injected `aion-web3` instance
- `titan console`

![](https://s15.postimg.cc/twbtvmpvf/console.gif)