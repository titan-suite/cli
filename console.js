const Web3 = require('aion-web3');
const repl = require("repl");
const { host, port } = require(`${process.cwd()}/titanrc.js`);
const provider = `${host}:${port}`;


try {
    const endpoint = process.argv[3] ? process.argv[3] : provider;
    let testWeb3 = new Web3(new Web3.providers.HttpProvider(endpoint)).eth.coinbase

    const context = repl.start('console@' + endpoint + '$ ').context;
    context.Web3 = new Web3();
    context.web3 = new Web3(new Web3.providers.HttpProvider(endpoint));
    context.eth = context.web3.eth;
    context.personal = context.web3.personal;
}
catch (err) {
    console.log(/Error:\s+(.+)/gi.exec(err)[1])
}