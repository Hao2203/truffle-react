import React, { useState, useEffect } from "react";
import "../assets/list.less";
import {
  Table,
  Button,
  Space,
  Modal,
  Input,
  message,
  Badge,
  Menu,
  Dropdown,
  Switch,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import getWeb3 from "../getWeb3";
import getExchange from "../getExchange";
import getMsgCoin from "../getMsgCoin";
import moment from "moment";

export default function Auction() {
  const [data, setData] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [auctions, setAuctions] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [msgCoin, setMsgCoin] = useState(null);
  const [exchange, setExchange] = useState(null);
  const [visible, setVisible] = useState(false);
  const [bid, setBid] = useState(null);
  const [secret, setSecret] = useState(null);
  const [value, setValue] = useState(null);
  const [revealVisible, setRevealVisible] = useState(null);
  const [key, setKey] = useState(null);

  const expandedRowRender = (record) => {
    console.log("record", record);
    const columns = [
      {
        title: "出价人",
        dataIndex: "customer",
        key: "customer",
        ellipsis: true,
      },
      {
        title: "隐藏的出价",
        dataIndex: "blindedBid",
        key: "blindedBid",
        ellipsis: true,
      },
      { title: "定金", dataIndex: "deposit", key: "deposit" },
      { title: "返还金额", dataIndex: "pendingReturns", key: "pendingReturns" },
      {
        title: "Action",
        dataIndex: "operation",
        key: "operation",
        render: () => (
          <Space size="middle">
            <Button type="primary" onClick={() => toReveal(record)}>
              披露出价
            </Button>
            <Modal
              title="披露出价"
              visible={revealVisible}
              onOk={() => revealOk(record.tokenId)}
              onCancel={revealCancel}
              centered={true}
            >
              <Space direction="vertical" size="small" align="start">
                <Input
                  addonBefore="真实出价"
                  placeholder="请输入你的真实出价"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <Input.Password
                  addonBefore="密码"
                  placeholder="请输入你之前设定的密码"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                />
              </Space>
            </Modal>
          </Space>
        ),
      },
    ];

    const data = [];
    for (let i = 0; i < auctions[record.key].bids.length; ++i) {
      data.push({
        key: i,
        customer: auctions[record.key].bids[i].customer,
        blindedBid: auctions[record.key].bids[i].blindedBid,
        deposit: auctions[record.key].bids[i].deposit,
        pendingReturns: auctions[record.key].bids[i].pendingReturns,
      });
    }
    return <Table columns={columns} dataSource={data} pagination={false} />;
  };

  const columns = [
    { title: "TokenId", dataIndex: "tokenId", key: "tokenId", ellipsis: true },
    { title: "信息地址", dataIndex: "address", key: "address", ellipsis: true },
    { title: "简介", dataIndex: "metaData", key: "metaData", ellipsis: true },
    {
      title: "最终受益人",
      dataIndex: "beneficiary",
      key: "beneficiary",
      ellipsis: true,
    },
    {
      title: "起拍价",
      dataIndex: "openingBid",
      key: "openingBid",
    },
    { title: "出价结束时间", dataIndex: "biddingEnd", key: "biddingEnd" },
    { title: "披露结束时间", dataIndex: "revealEnd", key: "revealEnd" },
    {
      title: "当前最高出价",
      dataIndex: "highestBid",
      key: "highestBid",
      ellipsis: true,
    },
    {
      title: "最高出价人",
      dataIndex: "highestBidder",
      key: "highestBidder",
      ellipsis: true,
    },
    {
      title: "Action",
      dataIndex: "operation",
      key: "operation",
      render: (text, record) => (
        <Space size="large">
          <Button type="danger" onClick={() => showModal(record)}>
            出价
          </Button>
          <Modal
            title="出价"
            visible={visible}
            onOk={() => handleOk(record)}
            onCancel={handleCancel}
            centered={true}
          >
            <Space direction="vertical" size="small" align="start">
              <Input
                addonBefore="定金"
                placeholder="请输入你要发送的定金"
                value={bid}
                onChange={(e) => setBid(e.target.value)}
              />
              <Input
                addonBefore="真实出价"
                placeholder="请输入你的真实出价"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <Input.Password
                addonBefore="密码"
                placeholder="披露时用到，请牢记"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </Space>
          </Modal>
        </Space>
      ),
    },
  ];

  const showModal = (record) => {
    console.log("record", record);
    console.log("auctions[record.key]", auctions[record.key])
    const biddingEnd = auctions[record.key].biddingEnd;

    if (biddingEnd * 1000 < Date.now()) {
      console.log("time", Date.now());
      message.error("已超过出价时间");
      return;
    }

    setVisible(true);
  };

  const handleOk = async (record) => {
    console.log("text", record);

    const blindedBid = await exchange.methods
      .getHash(value, false, secret)
      .call();
    console.log("sha3", blindedBid);

    await exchange.methods
      .setBid(blindedBid, auctions[record.key].tokenId)
      .send({ from: accounts[0], value: bid });
    setVisible(false);
    setBid(null);
    setValue(null);
    setSecret(null);
  };

  const handleCancel = () => {
    setBid(null);
    setValue(null);
    setSecret(null);
    setVisible(false);
  };

  const toReveal = (record) => {
    console.log("aucs", auctions);
    const biddingEnd = auctions[record.key].biddingEnd;
    const revealEnd = auctions[record.key].revealEnd;

    if (biddingEnd * 1000 > Date.now()) {
      message.error("还没到披露出价时间");
      return;
    }

    if (revealEnd * 1000 < Date.now()) {
      message.error("已超过披露出价时间");
      return;
    }
    setRevealVisible(true);
  };

  const revealOk = async (tokenId) => {
    console.log("tokenid", tokenId);
    const blindedBid = web3.utils.soliditySha3(
      { t: "uint", v: value },
      { t: "bool", v: false },
      { t: "string", v: secret }
    );
    getAuction();
    console.log("sha3", blindedBid);

    await exchange.methods
      .reveal(value, false, secret, tokenId)
      .send({ from: accounts[0] });
    setRevealVisible(false);
    setBid(null);
    setValue(null);
    setSecret(null);
    getAuction();
  };

  const revealCancel = () => {
    setValue(null);
    setSecret(null);
    setRevealVisible(false);
  };

  const getAuction = async () => {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const msgCoin = getMsgCoin(web3);
    const exchange = getExchange(web3);

    const aucList = [];
    const aucs = [];
    for (let index = 0; true; index++) {
      try {
        const auction = await exchange.methods.getAuction(index).call();
        aucs.push(auction);
        console.log("auc", auction);
        const tokenId = auction.tokenId;
        const address = await msgCoin.methods.tokenURI(tokenId).call();
        const metaData = await msgCoin.methods.Metadata(tokenId).call();
        const beneficiary = auction.beneficiary;
        const biddingEnd = moment(auction.biddingEnd * 1000).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        const revealEnd = moment(auction.revealEnd * 1000).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        const openingBid = auction.openingBid;
        const highestBid = auction.highestBid;
        const highestBidder = auction.highestBidder;
        aucList.push({
          key: index,
          tokenId: tokenId,
          address: (
            <a href={"https://ipfs.infura.io/ipfs/" + address}>{address}</a>
          ),
          metaData: metaData,
          beneficiary: beneficiary,
          openingBid: openingBid,
          biddingEnd: biddingEnd,
          revealEnd: revealEnd,
          highestBid: highestBid,
          highestBidder: highestBidder,
        });
      } catch (error) {
        break;
      }
    }
    setData(aucList);
    setWeb3(web3);
    setAccounts(accounts);
    setAuctions(aucs);
    setExchange(exchange);
    setMsgCoin(msgCoin);
    console.log("aucs", auctions);
  };

  useEffect(() => getAuction(), [bid]);
  useEffect(() => getAuction(), [bid]);

  return (
    <Table
      className="components-table-demo-nested"
      columns={columns}
      expandable={{ expandedRowRender }}
      dataSource={data}
    />
  );
}
