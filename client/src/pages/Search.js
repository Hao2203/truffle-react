import React, { useEffect, useState } from "react";
import {
  PageHeader,
  Button,
  Upload,
  message,
  Input,
  Divider,
  Descriptions,
  Modal,
  Space,
} from "antd";
import getWeb3 from "../getWeb3";
import getMsgCoin from "../getMsgCoin";
import "../assets/search.less";

export default function Search() {
  const { Search } = Input;
  const [value, setValue] = useState();
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [owner, setOwner] = useState(null);
  const [Metadata, setMetadata] = useState(null);
  const [time, setTime] = useState();
  const [URI, setURI] = useState();
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState();

  const toSearch = async () => {
    const web3 = await getWeb3();
    console.log("uploadMsg.Web3", web3);
    setWeb3(web3);
    const accounts = await web3.eth.getAccounts();
    setAccounts(accounts);

    try {
        const msgCoin = getMsgCoin(web3);
        setOwner(await msgCoin.methods.ownerOf(value).call());
        setTokenId(value);
        setURI(await msgCoin.methods.tokenURI(value).call());
        setMetadata(await msgCoin.methods.Metadata(value).call());
        setTime(await msgCoin.methods.getTimeOfTokenId(value).call());
        console.log('URI', URI)
        setUrl("https://ipfs.infura.io/ipfs/" + await msgCoin.methods.tokenURI(value).call())
        message.success(`查询成功`);
        setVisible(true)
      } catch (error) {
        setOwner("null");
        setTokenId("null");
        setURI("null");
        setMetadata("null");
        setTime("null");
        message.error(`该信息不存在`);
        return;
      }
    };

    const handleCancel = () => setVisible(false)
  

  return (
    <>
      <br />
      <Search
        className="search"
        placeholder="输入tokenId"
        enterButton="搜索"
        size="large"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSearch={toSearch}
        onPressEnter={toSearch}
      />
      <Modal
        title="信息详情"
        visible={visible}
        onCancel={handleCancel}
        footer={null}
      >
        <Descriptions title="User Info" bordered>
          <Descriptions.Item label="tokenId" span={3}>
            {tokenId}
          </Descriptions.Item>
          <Descriptions.Item label="拥有者账户" span={3}>
            {owner}
          </Descriptions.Item>
          <Descriptions.Item label="信息简介" span={2}>
            {Metadata}
          </Descriptions.Item>
          <Descriptions.Item label="上传时间">{time}</Descriptions.Item>
          <Descriptions.Item label="信息地址">
            <a href={url} target="_blank">{URI}</a>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  );
}
