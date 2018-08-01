const fs = require('fs')
const {
  mainAccount,
  mainAccountPass,
  compile,
  deploy,
  unlock,
  web3
} = require('./common.js')
const { expect } = require('chai')

const sol = fs.readFileSync(__dirname + '/contracts/Example.sol', {
  encoding: 'utf8'
})

let acc1 = mainAccount
let pwd = mainAccountPass

let abi
let code
let contractAddr
let contractInstance


describe('a] Compile and deploy', () => {
  it('should compile contract', async () => {
    const { Example } = await compile(web3, sol)
    abi = Example.info.abiDefinition
    code = Example.code
    expect(abi).to.not.be.null
    expect(abi).to.be.an('array')
    expect(code).to.not.be.null
    expect(code).to.be.an('string')
  }).timeout(0)

  it('should deploy contract', async () => {
    await unlock(web3, acc1, pwd)
    const { address } = await deploy(web3, acc1, abi, code)
    contractAddr = address
    contractInstance = await web3.eth.contract(abi).at(contractAddr)
    expect(contractAddr).to.have.lengthOf(66)
  }).timeout(0)
})

describe('b] Test contract function', () => {
  it('should return 10', async () => {
    const sum = await parseInt(
      contractInstance.add.call(5, { from: acc1, gas: 1500000 }).toString(10),
      10
    )
    expect(sum).to.equal(10)
  }).timeout(0)
})
