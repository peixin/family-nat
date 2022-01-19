"use strict";
const request = require("request");
const crypto = require("crypto");

const UUID = process.env.UUID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const sign = (text) => {
  const md5 = crypto.createHash("md5").update(text).digest("hex").substring(3, 28);
  const signatureStr = crypto.createHash("sha1").update(md5).digest("hex");
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

  const url = new URL("https://yqpt.xa.gov.cn/prod-api/naat/open/api/getResultByCardNumAndName");
  url.searchParams.set("name", userName);
  url.searchParams.set("cardNum", userId);

  const options = {
    method: "POST",
    url,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Host: "yqpt.xa.gov.cn",
      driverName: "web",
      timestamp,
      uuid: UUID,
      signature,
    },
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
};

exports.main_handler = async (event, context) => {
  const { name, id } = event.queryString;
  if (!name || !id) {
    return {
      statusCode: 400,
      body: "no params",
    };
  }
  if (event.headers["api-token"] !== process.env.API_TOKEN) {
    return {
      statusCode: 401,
      body: "auth failed",
    };
  }
  return await getNATResult(name, id);
};
