import React, { useEffect, useState } from "react";
import { PageHeader, Button, Upload, message, Input } from "antd";
import getWeb3 from "../getWeb3";
import getMsgCoin from "../getMsgCoin";
import { UploadOutlined } from "@ant-design/icons";
import { create } from "ipfs-http-client";
import { remove } from "fs-extra";

export default function UploadMsg() {
  const ipfs = create({
    host: "ipfs.infura.io",
    port: "5001",
    protocol: "https",
  });

  const [text, setText] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [path, setPath] = useState(null);
  const [fileList, setFileList] = useState([])

  const { TextArea } = Input;

  const catWeb3 = async () => {
    const web3 = await getWeb3();
    console.log("uploadMsg.Web3", web3);
    setWeb3(web3);
    const accounts = await web3.eth.getAccounts();
    setAccounts(accounts);
  };

  const go = async (event) => {
    const instance = getMsgCoin(web3);
    console.log("addr", instance.options.address);

    console.log(accounts);
    console.log(instance);
    await instance.methods
      .awardItem(accounts[0], path, text)
      .send({ from: accounts[0] });
    message.info("上传成功");
    setText(null);
  };

  const customRequest = async (file) => {
    try {
      console.log("file", file);
      const result = await ipfs.add(file.file);
      console.log("result", result.path);
      setPath(result.path);
      file.file.status = "error";
      message.success(`${file.file.name} 上传成功`);
    } catch (error) {
      message.error(`上传失败`);
    }
  };

  const onChange = (info) => {
    if(info.file.status == 'removed'){
      setFileList([])
      return
    }
    const fileList = [
      {
        uid: info.file.uid,
        name: info.file.name,
        status: 'done',       
      }
    ]
    setFileList(fileList)
    console.log('info', info)
  };

  //QmQbkjNj8bG7oaNiAeXkiHYeBpSWzKZaDDjUgkX8m1Ruji
  useEffect(() => {
    catWeb3();
  }, []);

  return (
    <div>
      <PageHeader
        ghost={false}
        onBack={() => window.history.back()}
        title="信息上传"
        subTitle="请输入信息简介并上传文件(建议不要输入太多字，否则费用会比较高昂)"
        extra={[
          <Button key="1" type="primary" onClick={go}>
            上传信息
          </Button>,
        ]}
      ></PageHeader>
      <div>
        <TextArea
          rows={4}
          size={"large"}
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
      </div>
      <Upload
        customRequest={customRequest}
        onChange={onChange}
        fileList={fileList}
      >
        <Button icon={<UploadOutlined />}>上传文件</Button>
      </Upload>
    </div>
  );
}
