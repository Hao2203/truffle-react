import React, { useEffect, useState } from "react";
import { Menu, Button, Layout } from "antd";
import {
  HomeOutlined,
  UploadOutlined,
  MoneyCollectOutlined,
  CheckOutlined,
  SearchOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Link, NavLink } from "react-router-dom";
import "../assets/base.less";

export default function Asider() {
  const { Header, Content, Footer, Sider } = Layout;
  const navigate = useNavigate();
  const location = useLocation();
  const [defaultKey, setDefaultkKey] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let path = location.pathname;
    let key = path.split("/")[1];
    setDefaultkKey(key);
    if (key == "") {
      navigate("/" + "list");
      setDefaultkKey("list");
    }
  }, []);

  const handleClick = (e) => {
    navigate("/" + e.key);
    setDefaultkKey(e.key);
  };

  return (
    <Sider>
      <Menu
        onClick={handleClick}
        style={{ width: 200 }}
        selectedKeys={[defaultKey]}
        mode="inline"
        theme="dark"
        className="aside"
      >
        <Menu.ItemGroup key="1" title="账户详情">
          <Menu.Item key="list">
            <HomeOutlined /> 我的信息
          </Menu.Item>
          <Menu.Item key="uploadMsg">
            <UploadOutlined /> 信息上传
          </Menu.Item>
        </Menu.ItemGroup>
        <Menu.ItemGroup key="2" title="信息验证和查询">
          <Menu.Item key="check">
            <CheckOutlined /> 验证信息所有权
          </Menu.Item>
          <Menu.Item key="search">
            <SearchOutlined /> 信息查询
          </Menu.Item>
        </Menu.ItemGroup>
        <Menu.ItemGroup key="g1" title="信息交易所">
          <Menu.Item key="exchange">
            <MoneyCollectOutlined /> 信息买卖
          </Menu.Item>
          <Menu.Item key="auction">
            <MoneyCollectOutlined /> 秘密拍卖场
          </Menu.Item>
          <Menu.Item key="ownAuction">
            <MoneyCollectOutlined /> 我发起的拍卖
          </Menu.Item>
        </Menu.ItemGroup>
      </Menu>
    </Sider>
  );
}
