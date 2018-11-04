const clearContract = artifacts.require("./SmartContractFairTrade.sol");
const owner = web3.eth.accounts[0];
const admin = web3.eth.accounts[1];
const employee = web3.eth.accounts[2];


module.exports = deployer => {
	deployer.deploy(clearContract,admin,employee, {from: owner});
}