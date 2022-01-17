import Swiper from "./swiper-bundle.esm.browser.min.js";
import { getData } from "./db.js";

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

export const showCode = (familyData) => {
  let swiper;
  const swiperContainer = document.querySelector(".swiper-wrapper");
  const userInfoContainer = document.querySelector(".user-info");

  const setCountInfo = (currentIndex) => {
    userInfoContainer.querySelector("#userCounts").textContent = `${currentIndex + 1} / ${
      Object.keys(familyData).length
    }`;
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
    const membersContainer = userInfoContainer.querySelector("#members");
    membersContainer.onclick = onClickUser;

    const fragment = document.createDocumentFragment();

    Object.keys(familyData).forEach((userId, index) => {
      const span = document.createElement("span");
      span.textContent = familyData[userId].displayName || familyData[userId].name;
      if (index === 0) {
        span.className = "current";
      }
      fragment.appendChild(span);
    });

    membersContainer.appendChild(fragment);
  };

  const initSlides = (qrCodes) => {
    const fragment = document.createDocumentFragment();

    Object.keys(familyData).forEach((userId, index) => {
      let element;
      const base64Data = qrCodes[index];

      if (!base64Data || familyData[userId].noQRCode) {
        element = document.createElement("div");
        const img = document.createElement("img");
        img.src = `./images/404.jpeg?v=${window.appVersion}`;

        const span = document.createElement("span");
        span.textContent = `暂无二维码\n身份证号:\n${formatReadableUserId(userId)}`;
        span.className = "info-404";

        element.append(img);
        element.append(span);
      } else {
        element = document.createElement("img");
        element.src = base64Data;
      }

      element.className = "swiper-slide";
      fragment.appendChild(element);
    });

    swiperContainer.appendChild(fragment);
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
      const currentSpan = userInfoContainer.querySelector(".members>.current");
      currentSpan.classList.remove("current");
      userInfoContainer.querySelectorAll(".members>span")[swiper.realIndex].classList.add("current");
    });
  };

  Promise.all(Object.keys(familyData).map((id) => getData(id))).then((qrCodes) => {
    initSlides(qrCodes);
    initSwiper();
    setCountInfo(0);
    setMembersName();
  });
};
