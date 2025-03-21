import { $, within, argv, sleep, fs, fetch, usePowerShell, os } from "zx";
import { pipeline } from "stream";
import { promisify } from "util";

import { createClient } from "webdav";
import packageJSON from "./package.json";
import AdmZip from "adm-zip";

$.verbose = true;
if (os.platform() == "win32") {
  usePowerShell();
}

if (argv.dev) {
  await $`npx cross-env NODE_ENV=development myEnv=dev webpack`;
  await $`npm run start`;
}

if (argv.testprod) {
  await $`npx cross-env NODE_ENV=production myEnv=test webpack`;
  await $`npx cross-env NODE_ENV=production myEnv=test electron-builder`;
}

if (argv.prod) {
  await $`npx cross-env NODE_ENV=production myEnv=prod webpack`;
  if (process.env.MYRUNENV === "github") {
    if (process.env.GH_TOKEN) {
      await $`npx cross-env NODE_ENV=production myEnv=prod electron-builder --publish always`;
    } else {
      await $`npx cross-env NODE_ENV=production myEnv=prod electron-builder --publish never`;
    }
  } else {
    if (os.platform() === "win32") {
      await $`npx cross-env NODE_ENV=production myEnv=prod electron-builder --publish never`;
    } else if (os.platform() === "darwin") {
      if (process.env.GH_TOKEN) {
        await $`npx cross-env NODE_ENV=production myEnv=prod electron-builder --mac --publish always`;
      } else {
        await $`npx cross-env NODE_ENV=production myEnv=prod electron-builder --mac --publish never`;
      }
    }
  }
}

// 压缩文件夹
function zipFolder(folderPath, outputPath) {
  const zip = new AdmZip();
  zip.addLocalFolder(folderPath);
  zip.writeZip(outputPath);
}

// 提取压缩文件
function extractZip(zipPath, outputPath) {
  var unzip = new AdmZip(zipPath);
  unzip.extractAllTo(outputPath, /*overwrite*/ true);
}
