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

export default function OwnAuction() {
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
    setKey(record.key);
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
    },
    {
      title: "当前最高出价人",
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
          <Button type="danger" onClick={() => endAuction(record)}>
            结束拍卖
          </Button>
        </Space>
      ),
    },
  ];

  const getAuctions = async () => {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const msgCoin = getMsgCoin(web3);
    const exchange = getExchange(web3);

    const aucs = [];
    const aucList = [];
    setAuctions(null);
    setData(null);
    let key = 0;
    for (let index = 0; true; ++index) {
      try {
        const auction = await exchange.methods.getAuction(index).call();
        if (auction.beneficiary == accounts[0]) {
          aucs.push(auction);
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
          console.log("index", index);
          aucList.push({
            key: key,
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
          key++;
        }
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
  };

  const endAuction = async (record) => {
    console.log("record", record);
    const revealEnd = auctions[record.key].revealEnd;
    console.log("auctions", auctions[record.key]);
    console.log("revealEnd", revealEnd)
    const now = Date.now()
    console.log("now", now)
    if (revealEnd * 1000 > now) {
      message.error("还没到结束时间");
      return;
    }
    await exchange.methods
      .auctionEnd(auctions[record.key].tokenId)
      .send({ from: accounts[0] });
    getAuctions();
  };

  useEffect(() => getAuctions(), []);

  return (
    <Table
      className="components-table-demo-nested"
      columns={columns}
      expandable={{ expandedRowRender }}
      dataSource={data}
    />
  );
}
