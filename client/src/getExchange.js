import ExchangeContract from "./contracts/Exchange.json";

const getExchange = (web3) => {

    const deployedNetwork = ExchangeContract.networks[5777];
    const instance = new web3.eth.Contract(
        ExchangeContract.abi,
        deployedNetwork && deployedNetwork.address
    );
    console.log('addr', deployedNetwork.address)
    return instance
}

export default getExchange

