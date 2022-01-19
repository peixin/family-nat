import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";
import { familyInfo } from "./data.js";
import { fileURLToPath } from "url";

dotenv.config();

// https://yqpt.xa.gov.cn/nrt/js/request-sign.min.js?y=202201170330
// official why hardcode uuid? expose the private key on the client?
// I had to hide it
const UUID = process.env.UUID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const parseResult = (_userName, { data }) => {
  const userName = _userName.padEnd(3, "　");
  if (!data || !data.length) {
    console.error(userName, "response empty data");
    return;
  }

  console.log(_userName);
  for (let item of data) {
    if (item.detResult === "1") {
      console.log("  ", item.collectTime, "阴性");
    } else {
      console.log("  ", item.collectTime, item.detResult, "💥💥💥");
    }
  }
  console.log();
};

const sign = (text) => {
  const md5 = crypto.createHash("md5").update(text).digest("hex").substring(3, 28);
  const signatureStr = crypto.createHash("sha1").update(md5).digest("hex");

  // https://yqpt.xa.gov.cn/nrt/js/request-sign.min.js?y=202201170330
  // official use https://github.com/brix/crypto-js
  // const md5 = crypto.MD5(text).toString().substring(3, 28);
  // const signatureStr = crypto.SHA1(md5).toString();

  return signatureStr;
};

const getNATResult = async (userName, userId) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signData = {
    cardNum: userId,
    driverName: "web",
    name: userName,
    privateKey: PRIVATE_KEY,
    timestamp: timestamp,
    uuid: UUID,
  };

  const signature = sign(
    Object.keys(signData)
      .filter((key) => key[0] !== "_")
      .sort()
      .map((key) => `${key}=${signData[key]}`)
      .join("")
  );

  const options = {
    method: "POST",
    url: "https://yqpt.xa.gov.cn/prod-api/naat/open/api/getResultByCardNumAndName",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Host: "yqpt.xa.gov.cn",
      driverName: "web",
      timestamp,
      uuid: UUID,
      signature,
    },
    params: { name: userName, cardNum: userId },
  };

  try {
    const { data } = await axios(options);
    parseResult(userName, data);
  } catch (error) {
    console.error(error);
  }
};

const main = async () => {
  for (let user of Object.values(familyInfo)) {
    await getNATResult(user.name, user.id);
  }
};

// Official entry https://yqpt.xa.gov.cn/nrt/inquire.html
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
