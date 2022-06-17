var Exchange = artifacts.require("./Exchange.sol");
var MsgCoin = artifacts.require("./MsgCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(MsgCoin).then(function() {
  return deployer.deploy(Exchange, MsgCoin.address);
})
};
