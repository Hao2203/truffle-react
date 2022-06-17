import React, { useState, useEffect } from "react";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";

export default function Bread() {
  const { pathname } = useLocation();
  const [breadName, setBreadName] = useState("");

  //监听路由的路径并修改breadName
  useEffect(() => {
    switch (pathname) {
      case "/list":
        setBreadName("管理我的信息");
        break;
      case "/upload":
        setBreadName("上传信息");
        break;
      case "/exchange":
        setBreadName("信息交易所");
        break;
      case "/auction":
        setBreadName("秘密拍卖所");
        break;
      case "/ownAuction":
        setBreadName("我的拍卖");
        break;
      case "/check":
        setBreadName("验证信息所有权");
        break;
      case "/search":
        setBreadName("信息查询");
        break;
    }
  }, [pathname]);

  return (
    <Breadcrumb>
      <Breadcrumb.Item href="/">
        <HomeOutlined />
      </Breadcrumb.Item>
      <Breadcrumb.Item href={pathname}>{breadName}</Breadcrumb.Item>
    </Breadcrumb>
  );
}
