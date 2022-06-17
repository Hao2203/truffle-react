import React, { useState, useEffect } from "react";
import "../assets/list.less";
import { Table, Button, Space, Modal, Input, message } from "antd";
import getWeb3 from "../getWeb3";
import getExchange from "../getExchange";
import getMsgCoin from "../getMsgCoin";
import moment from "moment";

export default function List() {
  const [arr, setArr] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [msgCoin, setMsgCoin] = useState(null);
  const [exchange, setExchange] = useState(null);
  const [visible, setVisible] = useState(false);
  const [eVisible, setEVisible] = useState(false);
  const [toAddr, setToAddr] = useState(null);
  const [price, setPrice] = useState(null);
  const [aucVisible, setAucVisible] = useState(null);
  const [biddingTime, setBiddingTime] = useState(null);
  const [revealTime, setRevealTime] = useState(null);
  const [openingBid, setOpeningBid] = useState(null)
  const [id, setId] = useState(null);

  const columns = [
    {
      title: "TokenId",
      dataIndex: "tokenId",
      key: "tokenId",
      ellipsis: true,
    },
    {
      title: "信息地址",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "简介",
      dataIndex: "metaData",
      key: "metaData",
      ellipsis: true,
    },
    {
      title: "生成时间",
      dataIndex: "time",
      key: "time",
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
      ellipsis: true,
      render: (text, record) => {
        return (
          <Space size="small">
            <Button
              type="primary"
              onClick={() => showEModal(text)}
              size="small"
            >
              委托卖出
            </Button>
            <Button type="primary" onClick={() => toAuction(text)} size="small">
              委托拍卖
            </Button>
            <Button type="danger" onClick={() => showModal(text)} size="small">
              发送
            </Button>
            <Modal
              title="发送信息"
              visible={visible}
              onOk={() => handleOk(text)}
              onCancel={handleCancel}
            >
              <Input
                placeholder="请输入你要发送对象的账户地址"
                value={toAddr}
                onChange={(e) => setToAddr(e.target.value)}
              />
            </Modal>
            <Modal
              title="设置拍卖信息"
              visible={aucVisible}
              onOk={() => auctionOk(id)}
              onCancel={auctionCancel}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ display: "flex" }}
              >
                <Input
                  placeholder="请输入出价结束时间，单位：秒"
                  value={biddingTime}
                  onChange={(e) => setBiddingTime(e.target.value)}
                />
                <Input
                  placeholder="请输入披露出价结束时间，单位：秒"
                  value={revealTime}
                  onChange={(e) => setRevealTime(e.target.value)}
                />
                <Input
                  placeholder="请输入起拍价，单位：Wei"
                  value={openingBid}
                  onChange={(e) => setOpeningBid(e.target.value)} />
              </Space>
            </Modal>
            <Modal
              title="委托卖出"
              visible={eVisible}
              onOk={() => eHandleOk(id)}
              onCancel={eHandleCancel}
            >
              <Input
                placeholder="请设置卖出金额，单位：Wei"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Modal>
          </Space>
        );
      },
    },
  ];

  const showModal = async (text) => {
    try {
      const saleIndex = await exchange.methods
        .getSaleIndex(text.tokenId)
        .call();
      const sale = await exchange.methods.getSaleByIndex(saleIndex).call;
      console.log("saleIndex", saleIndex);
      console.log("sale", sale.tokenId);
      message.error("该信息存在一笔售出委托！不可进行发送");
      return;
    } catch (error) {}

    try {
      const aucIndex = await exchange.methods
        .getIndexOfAuction(text.tokenId)
        .call();
      console.log("aucIndex", aucIndex);
      const auc = await exchange.methods.getAuction(aucIndex).call();
      console.log("auc", auc);
      if (auc.tokenId == text.tokenId) {
        message.error("该信息存在一笔拍卖委托！不可进行发送");
        return;
      }
    } catch (error) {}

    setVisible(true);
  };

  const showEModal = async (text) => {
    try {
      const saleIndex = await exchange.methods.getSaleIndex(text.tokenId).call();
      const sale = await exchange.methods.getSaleByIndex(saleIndex).call;
      message.error("该信息存在一笔售出委托！不可进行委托");
      return;
    } catch (error) {}

    try {
      const aucIndex = await exchange.methods.getIndexOfAuction(text.tokenId).call();
      console.log("aucIndex", aucIndex);
      const auc = await exchange.methods.getAuction(aucIndex).call();
      console.log("auc", auc);
      if (auc.tokenId == text.tokenId) {
        message.error("该信息存在一笔拍卖委托！不可进行委托");
        return;
      }
    } catch (error) {}

    const addr = exchange.options.address;
    const isApprove = await msgCoin.methods
      .isApprovedForAll(accounts[0], addr)
      .call();

    console.log("approve", isApprove);
    if (isApprove == false) {
      message.info("你还没有将交易所设置为被委托人，需要确认后才能继续操作");
      await msgCoin.methods
        .setApprovalForAll(addr, true)
        .send({ from: accounts[0] });
      message.info("设置成功");
    }
    setEVisible(true);
    console.log("text", text);
    setId(text.tokenId);
  };

  const handleOk = async (text) => {
    try {
      const saleIndex = await exchange.methods
        .getSaleIndex(text.tokenId)
        .call();
      const sale = await exchange.methods.getSaleByIndex(saleIndex).call;
      console.log("saleIndex", saleIndex);
      console.log("sale", sale.tokenId);
      message.error("该信息存在一笔售出委托！不可进行发送");
      return;
    } catch (error) {}

    try {
      const aucIndex = await exchange.methods
        .getIndexOfAuction(text.tokenId)
        .call();
      console.log("aucIndex", aucIndex);
      const auc = await exchange.methods.getAuction(aucIndex).call();
      console.log("auc", auc);
      if (auc.tokenId == text.tokenId) {
        message.error("该信息存在一笔拍卖委托！不可进行发送");
        return;
      }
    } catch (error) {}

    await msgCoin.methods
      .safeTransferFrom(accounts[0], toAddr, text.tokenId)
      .send({ from: accounts[0] });
    setVisible(false);
    setToAddr(null);
    message.success("发送成功");
  };

  const eHandleOk = async (id) => {
    try {
      const saleIndex = await exchange.methods.getSaleIndex(id).call();
      const sale = await exchange.methods.getSaleByIndex(saleIndex).call;
      message.error("该信息存在一笔售出委托！不可进行");
      return;
    } catch (error) {}

    try {
      const aucIndex = await exchange.methods.getIndexOfAuction(id).call();
      console.log("aucIndex", aucIndex);
      const auc = await exchange.methods.getAuction(aucIndex).call();
      console.log("auc", auc);
      if (auc.tokenId == id) {
        message.error("该信息存在一笔拍卖委托！不可进行发送");
        return;
      }
    } catch (error) {}

    await exchange.methods.setSale(id, price).send({ from: accounts[0] });
    setEVisible(false);
    setPrice(null);
    message.success("委托成功");
  };

  const handleCancel = () => {
    setToAddr(null);
    setVisible(false);
  };

  const eHandleCancel = () => {
    setPrice(null);
    setEVisible(false);
  };

  const toAuction = async (text) => {
    try {
      const saleIndex = await exchange.methods
        .getSaleIndex(text.tokenId)
        .call();
      const sale = await exchange.methods.getSaleByIndex(saleIndex).call;
      console.log("saleIndex", saleIndex);
      console.log("sale", sale.tokenId);
      message.error("该信息存在一笔售出委托！不可进行委托");
      return;
    } catch (error) {}

    try {
      const aucIndex = await exchange.methods
        .getIndexOfAuction(text.tokenId)
        .call();
      console.log("aucIndex", aucIndex);
      const auc = await exchange.methods.getAuction(aucIndex).call();
      console.log("auc", auc);
      if (auc.tokenId == text.tokenId) {
        message.error("该信息存在一笔拍卖委托！不可进行委托");
        return;
      }
    } catch (error) {}

    setId(text.tokenId);
    const addr = exchange.options.address;
    const isApprove = await msgCoin.methods
      .isApprovedForAll(accounts[0], addr)
      .call();

    console.log("approve", isApprove);
    if (isApprove == false) {
      message.info("你还没有将交易所设置为被委托人，需要确认后才能继续操作");
      await msgCoin.methods
        .setApprovalForAll(addr, true)
        .send({ from: accounts[0] });
      message.info("设置成功");
    }
    setAucVisible(true);
  };

  const auctionOk = async (id) => {
    try {
      const saleIndex = await exchange.methods.getSaleIndex(id).call();
      const sale = await exchange.methods.getSaleByIndex(saleIndex).call;
      message.error("该信息存在一笔售出委托！不可进行");
      return;
    } catch (error) {}

    try {
      const aucIndex = await exchange.methods.getIndexOfAuction(id).call();
      console.log("aucIndex", aucIndex);
      const auc = await exchange.methods.getAuction(aucIndex).call();
      console.log("auc", auc);
      if (auc.tokenId == id) {
        message.error("该信息存在一笔拍卖委托！不可进行发送");
        return;
      }
    } catch (error) {}

    exchange.methods
      .setAuction(biddingTime, revealTime, openingBid, accounts[0], id)
      .send({ from: accounts[0] });
    message.success("委托成功");
    setAucVisible(false);
    setBiddingTime(null);
    setRevealTime(null);
    setOpeningBid(null)
  };

  const auctionCancel = () => {
    setAucVisible(false);
    setBiddingTime(null);
    setRevealTime(null);
    setOpeningBid(null);
  };

  const getList = async () => {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const msgCoin = getMsgCoin(web3);
    const exchange = getExchange(web3);
    const balanceOf = await msgCoin.methods.balanceOf(accounts[0]).call();

    let arra = [];
    for (let index = 0; index < balanceOf; index++) {
      let tokenId = await msgCoin.methods
        .tokenOfOwnerByIndex(accounts[0], index)
        .call();
      let tokenURI = await msgCoin.methods.tokenURI(tokenId).call();
      console.log(tokenId);
      let time = await msgCoin.methods.getTimeOfTokenId(tokenId).call();
      let metaData = await msgCoin.methods.Metadata(tokenId).call();
      let key = index;
      let url = "https://ipfs.infura.io/ipfs/" + tokenURI;
      arra.push({
        key: key,
        tokenId: tokenId,
        address: (
          <a href={url} target="_blank">
            {tokenURI}
          </a>
        ),
        time: moment(time * 1000).format("YYYY-MM-DD HH:mm:ss"),
        metaData: metaData,
      });
    }

    setWeb3(web3);
    setAccounts(accounts);
    setMsgCoin(msgCoin);
    setExchange(exchange);
    setArr(arra);
    console.log("arr", arra);
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <>
      <div className="list_table">
        <Table columns={columns} dataSource={arr} />
      </div>
    </>
  );
}
