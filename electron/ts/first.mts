import log from "electron-log";
import {
  app,
  BrowserWindow,
  nativeImage,
  Tray,
  ipcMain,
  protocol,
  net,
  Menu,
  desktopCapturer,
  session,
  shell,
} from "electron";
import { zx } from "./es6.mjs";
const { $, fs, cd, fetch, sleep, path } = zx;
import { electronData } from "../../common/data";
import "./common/data.mjs";
import { appDataDir } from "./const.mjs";

// global.ext = {
//   invert: async (name, args) => {
//     // try {
//     //   // const { Command } = await import(/* webpackIgnore: true */ "../command.mjs");
//     //   let res = await Command[name](...args);
//     //   return {
//     //     code: 0,
//     //     success: true,
//     //     data: res,
//     //   };
//     // } catch (e) {
//     //   Logger.error(name, args, e);
//     //   return { success: false, code: 1, message: e.message };
//     // }
//   },
//   receive: () => {},
// };
// 获取日志文件路径
const logFilePath = log.transports.file.getFile().path;
// 清空日志文件
fs.writeFileSync(logFilePath, "");

// 记录新的启动日志
log.info("Application started. Previous logs cleared.");
log.info("__dirname", __dirname);
log.log("process.cwd()", process.cwd());
log.log("execPath: ", process.execPath);
log.info("NODE_ENV: ", process.env.NODE_ENV);
log.info("myEnv: ", process.env.myEnv);

log.info(
  path.join(__dirname, "../web-build/assets/favicon.png"),
  fs.existsSync(path.join(__dirname, "../web-build/assets/favicon.png"))
);

log.info("appDataDir: ", appDataDir);

electronData.get().appDataDir = appDataDir;
electronData.get().logFilePath = logFilePath;
electronData.save();
