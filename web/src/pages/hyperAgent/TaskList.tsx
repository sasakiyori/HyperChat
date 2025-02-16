import React, {
  useState,
  useEffect,
  version,
  useCallback,
  useContext,
  useRef,
} from "react";
import {
  Button,
  Table,
  Switch,
  Tooltip,
  Modal,
  message,
  Radio,
  Input,
  Tabs,
  ConfigProvider,
  Progress,
  Card,
  Flex,
  Tag,
  Space,
  Slider,
  Form,
  InputNumber,
  Descriptions,
  Select,
  Divider,
  Popconfirm,
} from "antd";
import { call } from "../../common/call";
import client from "socket.io-client";
import SimplePeer from "simple-peer";
import {
  Mic,
  Speaker,
  Settings,
  HelpCircle,
  AlertCircle,
  Wifi,
  VolumeIcon,
  VolumeX,
  Volume2,
} from "lucide-react";
import { debounce } from "../../common";
import {
  CloudSyncOutlined,
  CopyOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { sleep } from "../../common/sleep";
import dayjs from "dayjs";
import { useForm } from "antd/es/form/Form";
import { e } from "../../common/service";
import { t } from "../../i18n";
import { NewTaskModal } from "./newTaskModal";
import { GPTS, TaskList } from "../../../../common/data";
import { v4 } from "uuid";
import { useLocation, useNavigate } from "react-router-dom";

export function TaskListPage() {
  const [num, setNum] = useState(0);
  const refresh = () => {
    setNum((x) => x + 1);
  };
  const navigate = useNavigate();
  const location = useLocation();
  const columns = [
    {
      title: t`name`,
      dataIndex: "name",
      key: "name",
    },
    {
      title: "cron",
      dataIndex: "cron",
      key: "cron",
    },
    {
      title: "Agent",
      dataIndex: "agentKey",
      key: "agentKey",
      render: (text, row, index) => {
        return (
          <Tag color="blue">
            {GPTS.get().data.find((x) => x.key == row.agentKey).label}
          </Tag>
        );
      },
    },
    {
      title: "message",
      dataIndex: "message",
      key: "message",
      render: (text, row, index) => {
        return (
          <Tooltip title={row.message}>
            <div className="line-clamp-1 w-96">{row.message}</div>
          </Tooltip>
        );
      },
    },
    {
      title: t`enabled`,
      dataIndex: "enabled",
      key: "enabled",
      render: (text, row, index) => {
        return (
          <Switch
            value={!row.disabled}
            onChange={async (e) => {
              row.disabled = !e;
              await TaskList.save();
              if (!row.disabled) {
                await call("startTask", [row.key]);
              } else {
                await call("stopTask", [row.key]);
              }

              refresh();
            }}
          ></Switch>
        );
      },
    },
    {
      title: t`operation`,
      dataIndex: "operation",
      key: "operation",
      render: (text, row, index) => {
        return (
          <div>
            <a
              onClick={() => {
                navigate(`../Results?taskKey=${row.key}`);
              }}
            >{t`ViewResults`}</a>
            <Divider type="vertical" />
            <a
              onClick={() => {
                setCurrRow(row);
                setVisible(true);
              }}
            >{t`Edit`}</a>
            <Divider type="vertical" />
            <Popconfirm
              title={t`Are you sure to delete this task?`}
              onConfirm={() => {
                call("stopTask", [row.key]);
                TaskList.get().data = TaskList.get().data.filter(
                  (item) => item.key !== row.key,
                );
                TaskList.save();
                refresh();
              }}
            >
              <a>{t`Delete`}</a>
            </Popconfirm>
            <Divider type="vertical" />

            <a
              className="text-red-300"
              onClick={() => {
                call("runTask", [row.key]);
              }}
            >{t`Test`}</a>
          </div>
        );
      },
    },
  ];
  const [visible, setVisible] = useState(false);
  const [currRow, setCurrRow] = useState<any>({});

  useEffect(() => {
    (async () => {
      await TaskList.init();
      await GPTS.init();
      refresh();
    })();
  }, []);

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setCurrRow({});
          setVisible(true);
        }}
      >{t`Create Task`}</Button>
      <Table
        rowKey={(r) => r.key}
        dataSource={TaskList.get().data}
        columns={columns}
      />
      <NewTaskModal
        open={visible}
        onCancel={() => setVisible(false)}
        initialValues={currRow}
        onCreate={async (v) => {
          if (v.key) {
            v = Object.assign(currRow, v);
            let i = TaskList.get().data.findIndex((x) => x.key == v.key);
            TaskList.get().data[i] = v;
            await TaskList.save();
            if (!v.disabled) {
              await call("startTask", [v.key]);
            }
            refresh();
            setVisible(false);
          } else {
            v.key = v4();
            TaskList.get().data.push(v);
            await TaskList.save();
            await call("startTask", [v.key]);
            refresh();
            setVisible(false);
          }
        }}
      />
    </div>
  );
}
