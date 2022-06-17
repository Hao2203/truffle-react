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
} from "antd";
import getWeb3 from "../getWeb3";
import getMsgCoin from "../getMsgCoin";
import { UploadOutlined } from "@ant-design/icons";
import { create } from "ipfs-http-client";
import moment from "moment";

export default function Check() {
  const ipfs = create({
    host: "ipfs.infura.io",
    port: "5001",
    protocol: "https",
  });

  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [owner, setOwner] = useState(null);
  const [Metadata, setMetadata] = useState(null);
  const [time, setTime] = useState();
  const [URI, setURI] = useState();
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState();

  const captureFile = async (event) => {
    const result = await ipfs.add(event.target.files[0]);
    console.log("result", result);
    const path = result.path;
    const tokenId = await web3.utils.soliditySha3(path);
    console.log("tokenId", tokenId);
    setTokenId(tokenId);
  };

  const toCheck = async () => {
    try {
      message.success("开始验证");
      const msgCoin = getMsgCoin(web3);
      const owner = await msgCoin.methods.ownerOf(tokenId).call()
      const URI = await msgCoin.methods.tokenURI(tokenId).call()
      const Metadata = await msgCoin.methods.Metadata(tokenId).call()
      const time = await msgCoin.methods.getTimeOfTokenId(tokenId).call()
      setOwner(owner);
      setTokenId(tokenId);
      setURI(URI);
      setMetadata(Metadata);
      setTime(moment(time * 1000).format("YYYY-MM-DD HH:mm:ss"));
      setUrl("https://ipfs.infura.io/ipfs/" + URI);
      message.error(`该信息已存在`);
      setVisible(true);
    } catch (error) {
      setOwner("null");
      setTokenId("null");
      setURI("null");
      setMetadata("null");
      setTime("null");
      message.success(`该信息不存在`);
      return;
    }
  };

  const handleCancel = () => setVisible(false);

  useEffect(async () => {
    const web3 = await getWeb3();
    console.log("uploadMsg.Web3", web3);
    setWeb3(web3);
    const accounts = await web3.eth.getAccounts();
    setAccounts(accounts);
  }, []);

  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => window.history.back()}
        title="信息验证"
        subTitle="选择一个信息文件进行验证"
        extra={[
          <Button type="primary" onClick={() => toCheck()}>
            开始验证
          </Button>,
        ]}
      ></PageHeader>
      <Divider />
      <input type="file" onChange={captureFile} />
      <Divider />
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
            <a href={url} target="_blank">
              {URI}
            </a>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  );
}
