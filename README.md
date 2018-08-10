# Titan-CLI

Command Line Interface for interacting on AION 

---

## Setup

- `npm i -g @titan-suite/cli` or `yarn add global @titan-suite/cli`
- In your project root, create a `titanrc.js` file and specify the following:
    - `host`: the URL of your `aion-web3` provider
    - `port`: the port exposing an `aion-web3` instance, usually *8545*
    - `mainAccount`: the default address to call functions with
    - `mainAccountPass`: the password of this account
```javascript
   module.exports = {
       "host": "http://127.0.0.1",
       "port": 8545,
       "defaultAccount": "",
       "password": ""
   }
```
---

## Examples


### Unlock an account:

- `titan unlock`
- You will be prompted to enter an AION address and password

![](https://s33.postimg.cc/8nt4t641b/unlock.png)

### Compile a contract:

- `titan compile <path/to/contracts/Example.sol>`
- Compile specific contract 
    - `titan compile <path/to/contracts/Example.sol> -n <contract_name>`
- Output more details about the contract
    - `titan compile <path/to/contracts/Example.sol> -d`

![](https://s33.postimg.cc/41x0ksvcv/compile.png)

### Deploy a contract:

- `titan deploy <path/to/contracts/Example.sol>`
- Deploy a specific contract within the contract file:
    - `titan deploy -n Test <path/to/contracts/Example.sol>`
- Pass parameters:
    - `titan deploy -p 5 <path/to/contracts/Example.sol>`
- The details of the deployed contract will be stored as `./build/bots/<contractName>.json`

![](https://s33.postimg.cc/bhwa6lqrz/deploy.png)

### Run unit test

- `titan test <path/to/contracts/testExample.js>`

![](https://s33.postimg.cc/m4q3c16n3/test.png)

### Generate a simple dApp 

- In the current directory: `titan init`
- In a new directory: `titan init new_dapp`

### Use a prebuilt dApp

- `titan unpack`
    - Select which pack you want from the options
- `titan unpack <pack_name>`

### Lint a smart contract

- `titan lint <path/to/contracts/Bad.sol>`

![](https://s33.postimg.cc/8b1qn0173/lint.png)

### Launch an `aion-web3`-ready console on your AION node

- `titan console`

![](https://s33.postimg.cc/dz81dvxtr/console.png)

---

## Instructions

- `titan --help`
