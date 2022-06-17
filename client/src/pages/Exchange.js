import React, { useState, useEffect } from "react";
import "../assets/list.less";
import { Table, Button, Space, message} from "antd";
import getWeb3 from "../getWeb3";
import getExchange from "../getExchange";
import getMsgCoin from "../getMsgCoin";

export default function Exchange() {
  const [arr, setArr] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [msgCoin, setMsgCoin] = useState(null);
  const [exchange, setExchange] = useState(null);
  // const [visible, setVisible] = useState(false);
  // const [toAddr, setToAddr] = useState(null);
  // const [price, setPrice] = useState(null);

  const columns = [
    {
      title: "TokenId",
      dataIndex: "tokenId",
      key: "tokenId",
      ellipsis: true,
    },
    {
      title: "拥有者账户",
      dataIndex: "owner",
      key: "owner",
      ellipsis: true,
    },
    {
      title: "信息简介",
      dataIndex: "metaData",
      key: "metaData",
      ellipsis: true,
    },
    {
      title: "价格",
      dataIndex: "price",
      key: "price",
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => {
        return (
          <Space size="middle">
            <Button type="danger" onClick={() => buy(text)}>
              购买
            </Button>
          </Space>
        );
      },
    },
  ];

  const buy = async (text) => {
    console.log(text)
    const pay = await exchange.methods
      .paySale(text.tokenId)
      .send({ from: accounts[0], value: text.price });
    message.success('购买成功')
  };

  const getList = async () => {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const msgCoin = getMsgCoin(web3);
    const exchange = getExchange(web3);

    let arra = [];
    for (let index = 0; true; index++) {
      try {
        console.log('index',index)
        let sale = await exchange.methods.getSaleByIndex(index).call();
        console.log("sale", sale);
        let tokenId = sale.tokenId;
        // let tokenURI = await msgCoin.methods.tokenURI(tokenId).call();
        // let owner = await msgCoin.methods.ownerOf(tokenId).call();
        let metaData = await msgCoin.methods.Metadata(tokenId).call();
        console.log('metaData', metaData)
        //let price = await await exchange.methods.getSaleByIndex(index).call();
        let key = index;
        arra.push({
          key: key,
          tokenId: tokenId,
          owner: sale.addr,
          metaData: metaData,
          price: sale.price,
        });
        console.log(arra)
        setArr(arra);
      } catch (error) {
        break;
      }
    }

    setWeb3(web3);
    setAccounts(accounts);
    setMsgCoin(msgCoin);
    setExchange(exchange);
    setArr(arra);

  };

  useEffect(() => getList(), []);

  return (
    <>
      <div className="list_table">
        <Table columns={columns} dataSource={arr} />
      </div>
    </>
  );
}
