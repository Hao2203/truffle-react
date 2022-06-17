import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import "./assets/base.less";
import Asider from "./components/Asider";
import Bread from "./components/Bread";
import { Layout } from "antd";

import getWeb3 from "./getWeb3";

const { Header, Content, Footer, Sider } = Layout;

export default function App() {
  const [accounts, setAccounts] = useState(null);

  const componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      //console.log(accounts);

      //const instance = getMsgCoin(web3);
      //const mint = instance.methods.awardItem(accounts[0], 'aaa', 'bbb').send({ from: accounts[0] })
      // const ids = await instance.methods.getTokenIds().call()
      // console.log('instance', ids)

      // const instance = getExchange(web3);`
      // const sale = instance.methods.getSaleByIndex(0).call()
      //console.log('instance', sale)

      setAccounts(accounts);
      //setContractAddr(deployedNetwork.address);
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  useEffect(() => componentDidMount());

  return (
    <Layout id="app">
      <header>
        <div className="left">当前账户地址：{accounts}</div>
        <div className="right">你正在访问去中心化网络</div>
      </header>
      <Layout>
        <Asider />
        <Layout >    
          <Content className="container">
            <div className="container_box">
            <Bread />
              <div className="container_content">
                <Outlet />
              </div>
            </div>
          </Content>
          <Footer className="footer">去中心化信息存储、传输和交易APP</Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}
