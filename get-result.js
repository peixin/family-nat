import { usersInfo, familyInfo } from "./js/data.js";
import axios from "axios";
import { fileURLToPath } from 'url';


const parseResult = ({ data }) => {
  if (!data || !data.length) {
    console.error("response empty data");
    return;
  }
  const item = data[0];
  const userName = item.name.padEnd(3, "　");
  if (item.detResult === "1") {
    console.log(userName, item.collectTime, "阴性");
  } else {
    console.log(userName, item.collectTime, item.detResult, "💥💥💥");
  }
};

const getNATResult = async (userName, userId) => {
  const options = {
    method: "POST",
    url: "https://yqpt.xa.gov.cn/prod-api/naat/open/api/getResultByCardNumAndName",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    data: JSON.stringify({ name: userName, cardNum: userId }),
  };

  try {
    const { data } = await axios(options);
    // console.log(data);

    // const item = {
    //   name: userName,
    //   detResult: "1",
    //   collectTime: "2022-01-11 10:07:07",
    // };
    // parseResult({ data: [item] });

    parseResult(data);
  } catch (error) {
    console.error(error);
  }
};

const main = async () => {
  for (let i = 0; i < familyInfo.members.length; i += 1) {
    const user = usersInfo[familyInfo.members[i]];
    await getNATResult(user.name, user.id);
  }
};

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}