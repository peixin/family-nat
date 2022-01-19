import { init as initDB } from "./db.js";
import { showEditFamily } from "./edit-family.js";
import { showCode } from "./show-code.js";

const swiperContainer = document.querySelector("body>.swiper");
const userInfoContainer = document.querySelector("body>.user-info");
const editFamilyContainer = document.querySelector("body>.edit-family");

const toEditFamily = (familyData) => {
  userInfoContainer.classList.add("hidden");
  swiperContainer.classList.add("hidden");
  editFamilyContainer.classList.remove("hidden");
  showEditFamily(familyData);
};

const getNATResult = async ({name, id}) => {
  let naatURL = localStorage.getItem("naat-api-url");
  let naatToken = localStorage.getItem("naat-api-token");
  let text = "";
  if (!naatURL) {
    text = (prompt("输入你的 NAAT 代理地址:") || "").trim();
    if (!text) {
      alert("no nnat url");
      return;
    }
    naatURL = text;
    localStorage.setItem("naat-api-url", text);
  }
  if (!naatURL) {
    text = (prompt("输入你的 NAAT 代理 TOKEN:") || "").trim();
    if (!text) {
      alert("no nnat token");
      return;
    }
    naatToken = text;
    localStorage.setItem("naat-api-token", text);
  }

  const options = {
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "api-token": naatToken,
    },
  };

  try {
    const url = new URL(naatURL);
    url.searchParams.set("name", name);
    url.searchParams.set("id", id);

    const responseData = JSON.parse(await fetch(url, options).then((response) => response.json()));
    let message = name + "\n";
    console.log(responseData);

    message += responseData.data
      .map((item) => `${item.collectTime} ${item.detResult === "1" ? "阴性" : `${item.detResult} 💥💥💥`}`)
      .join("\n");

    alert(message);
  } catch (error) {
    console.error(error);
    alert(error);
  }
};

const init = () => {
  let familyData = {};
  try {
    const cache = JSON.parse(localStorage.getItem("familyData"));
    if (cache) {
      familyData = cache;
    }
  } catch {}

  window.toEditFamily = () => toEditFamily(familyData);

  if (Object.keys(familyData).length) {
    userInfoContainer.classList.remove("hidden");
    swiperContainer.classList.remove("hidden");
    editFamilyContainer.classList.add("hidden");
    showCode(familyData, getNATResult);
  } else {
    toEditFamily(familyData);
  }
};

initDB()
  .then(() => init())
  .catch(() => alert("init error"));
