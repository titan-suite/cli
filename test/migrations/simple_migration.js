const Simple = require("../build/bolts/Simple.json");

module.exports = async deployer => {
  deployer
    .deploy(Simple)
    .then(address => {
      console.log(address);
    })
    .catch(e => {
      console.error(e);
    });
};
