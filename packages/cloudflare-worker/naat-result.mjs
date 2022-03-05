import CryptoJS from "crypto-js";

async function sign(text) {
  // md5 & sha1 😮‍💨
  // https://yqpt.xa.gov.cn/nrt/js/request-sign.min.js?y=202201170330

  const md5Str = CryptoJS.MD5(text).toString().substring(3, 28);
  // const signatureStr = CryptoJS.SHA1(md5Str).toString();

  // Recommend using Web Crypto API  https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
  const encoder = new TextEncoder();
  const md5Buffer = encoder.encode(md5Str);
  const signatureBuffer = await crypto.subtle.digest("SHA-1", md5Buffer);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureStr = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return signatureStr;
}

function request({ timestamp, signature, uuid, name, cardNum }) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json; charset=UTF-8");
  headers.append("Accept", "application/json");
  headers.append("Host", "https://yqpt.xa.gov.cn");
  headers.append("driverName", "web");
  headers.append("timestamp", timestamp);
  headers.append("signature", signature);
  headers.append("uuid", uuid);

  const requestOptions = {
    method: "POST",
    headers: headers,
  };

  return fetch(
    `https://yqpt.xa.gov.cn/prod-api/naat/open/api/getResultByCardNumAndName?name=${encodeURIComponent(
      name
    )}&cardNum=${encodeURIComponent(cardNum)}`,
    requestOptions
  );
}

async function handleRequest(data, uuid, privateKey) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signData = {
    cardNum: data.cardNum,
    driverName: "web",
    name: data.name,
    privateKey: privateKey,
    timestamp: timestamp,
    uuid: uuid,
  };
  const signature = sign(
    Object.keys(signData)
      .filter((key) => key[0] !== "_")
      .sort()
      .map((key) => `${key}=${signData[key]}`)
      .join("")
  );
  return await request(Object.assign(data, { timestamp, signature, uuid }));
}

export default {
  async fetch(request, env, context) {
    if (request.method === "OPTIONS") {
      return new Response("", { status: 200 });
    }

    if (request.method !== "POST") {
      return new Response("", { status: 405 });
    }

    if (request.headers.get("API-TOKEN") !== env.API_TOKEN) {
      return new Response("", { status: 401 });
    }

    const body = await request.text();
    let bodyJson;
    try {
      bodyJson = JSON.parse(body);
      if (!(bodyJson.name && bodyJson.cardNum)) {
        return new Response("need body: { name, cardNum }", { status: 400 });
      }
    } catch {
      return new Response("need body: { name, cardNum }", { status: 400 });
    }

    return handleRequest(bodyJson, env.NAAT_UUID, env.NAAT_PRIVATE_KEY);
  },
};
