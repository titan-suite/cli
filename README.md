# Titan-CLI

Command Line Interface for interacting smart contract development on AION

---

## Setup

- `npm i -g @titan-suite/cli` or `yarn add global @titan-suite/cli`
- In `titanrc.js`, specify the following:
    - `host`: the 
    - `port`: the port exposing an `aion-web3` instance, usually *8545*
    - `mainAccount`: the default address to call functions with
    - `mainAccountPass`: the password of this account
---

## Examples


### Unlock an account:

- `titan unlock`
- Enter an AION address and password

### Compile a contract:

- `titan compile <path/to/contracts/Example.sol>`

### Deploy a contract:

- `titan deploy <path/to/contracts/Example.sol>`
- Deploy a specific contract within the contract file:
    - `titan deploy -n Test <path/to/contracts/Example.sol>`
- Pass parameters:
    - `titan deploy -p 5 <path/to/contracts/Example.sol>`

### Run a unit test file

- `titan test test/contracts/testExample.js`

### Generate a React dApp 

- `titan init`

### Lint a smart contract

- `titan lint test/contracts/Bad.sol`

### Launch a `web3`-ready console on your node

- `titan console`

---

## Instructions

- `titan --help`
