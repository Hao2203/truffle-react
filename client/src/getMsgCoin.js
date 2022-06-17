import MsgCoinContract from "./contracts/MsgCoin.json";

const getMsgCoin = (web3) => {

    // const web3 = await getWeb3();

    // const networkId = await web3.eth.net.getId();
    const deployedNetwork = MsgCoinContract.networks[5777];
    const instance = new web3.eth.Contract(
        MsgCoinContract.abi,
        deployedNetwork && deployedNetwork.address
    );
    return instance
}

export default getMsgCoin