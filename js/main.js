import Swiper from "./swiper-bundle.esm.browser.min.js";
import { usersInfo, familyInfo } from "./data.js";

let swiper;

const setCountInfo = (currentIndex) => {
  document.querySelector("#userCounts").textContent = `${currentIndex + 1} / ${familyInfo.members.length}`;
};

const onClickUser = (evt) => {
  if (evt.target.classList.contains("current")) {
    return;
  }
  const index = Array.prototype.findIndex.call(evt.currentTarget.children, (child) => child == evt.target);
  if (index !== -1) {
    swiper.slideTo(index + 1);
  }
};

const setMembersName = () => {
  const membersContainer = document.querySelector("#members");
  membersContainer.onclick = onClickUser;

  const fragment = document.createDocumentFragment();

  familyInfo.members.forEach((member, index) => {
    const span = document.createElement("span");
    span.textContent = usersInfo[member].displayName || usersInfo[member].name;
    if (index === 0) {
      span.className = "current";
    }
    fragment.appendChild(span);
  });

  membersContainer.appendChild(fragment);
};

const formatReadableUserId = (userId) => {
  const idSplitIndex = [6, 4, 4, 4];

  return idSplitIndex
    .reduce((arr, size) => {
      const start = arr.join("").length;
      arr.push(userId.substring(start, start + size));
      return arr;
    }, [])
    .join(" ");
};

const initSlides = () => {
  const container = document.querySelector(".swiper-wrapper");
  const fragment = document.createDocumentFragment();

  familyInfo.members.forEach((member) => {
    let element;
    if (usersInfo[member].noQRCode) {
      element = document.createElement("div");
      const img = document.createElement("img");
      img.src = `./qr-codes/404.jpeg?v=${window.appVersion}`;

      const userId = usersInfo[member].id;
      const span = document.createElement("span");
      span.textContent = `暂无二维码\n身份证号:\n${formatReadableUserId(userId)}`;
      span.className = "info-404";

      element.append(img);
      element.append(span);
    } else {
      element = document.createElement("img");
      element.src = `./qr-codes/${member}.jpeg?v=${window.appVersion}`;
    }

    element.className = "swiper-slide";
    fragment.appendChild(element);
  });

  container.appendChild(fragment);
};

const initSwiper = () => {
  swiper = new Swiper(".swiper", {
    direction: "horizontal",
    slidesPerView: 1,
    loop: true,
    effect: "coverflow",
    coverflowEffect: {
      slideShadows: false,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    pagination: {
      el: ".swiper-pagination",
    },
  });
  swiper.on("activeIndexChange", () => {
    setCountInfo(swiper.realIndex);
    const currentSpan = document.querySelector(".members>.current");
    currentSpan.classList.remove("current");
    document.querySelectorAll(".members>span")[swiper.realIndex].classList.add("current");
  });
};

initSlides();
initSwiper();
setCountInfo(0);
setMembersName();
