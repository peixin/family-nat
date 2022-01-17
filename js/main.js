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
    showCode(familyData);
  } else {
    toEditFamily(familyData);
  }
};

init();
