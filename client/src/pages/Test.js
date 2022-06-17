import React, { useState, useEffect, useRef, createElement } from "react";
import { Comment, Tooltip, List } from "antd";
import moment from "moment";
import {
  DislikeOutlined,
  LikeOutlined,
  DislikeFilled,
  LikeFilled,
} from "@ant-design/icons";

export default function Test() {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [action, setAction] = useState(null);
  const [data, setData] = useState([]);

  const like = () => {
    setLikes(1);
    setDislikes(0);
    setAction("liked");
  };

  const dislike = () => {
    setLikes(0);
    setDislikes(1);
    setAction("disliked");
  };

  const getData = (num) => {
    let arra = [];
    for (let index = 0; index < num; index++) {
        let action = 'like'
      arra.push({
        liked: 0,
        disliked: 0,
        action: null,
        actions: [
          <Tooltip key={"comment-basic-like"} title="Like">
            <span className={index} onClick={(e) => {
                console.log(e.currentTarget[0])
            }}>
              {createElement(action === "liked" ? LikeFilled : LikeOutlined)}
              <span className="comment-action">{likes}</span>
            </span>
          </Tooltip>,
          <Tooltip key="comment-basic-dislike" title="Dislike">
            <span onClick={dislike}>
              {React.createElement(
                action === "disliked" ? DislikeFilled : DislikeOutlined
              )}
              <span className="comment-action">{dislikes}</span>
            </span>
          </Tooltip>,
          <span key="comment-basic-reply-to">Reply to</span>,
        ],
        author: "Han Solo",
        avatar: "",
        content: (
          <p>
            We supply a series of design principles, practical patterns and high
            quality design resources (Sketch and Axure), to help people create
            their product prototypes beautifully and efficiently.
          </p>
        ),
        datetime: (
          <Tooltip
            title={moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss")}
          >
            <span>{moment().subtract(1, "days").fromNow()}</span>
          </Tooltip>
        ),
      });
    }
    setData(arra);
  };

  useEffect(() => getData(3), []);

  return (
    <div>
      <List
        className="comment-list"
        header={`${data.length} replies`}
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <li>
            <Comment
              actions={item.actions}
              author={item.author}
              avatar={item.avatar}
              content={item.content}
              datetime={item.datetime}
            />
          </li>
        )}
      />
    </div>
  );
}
