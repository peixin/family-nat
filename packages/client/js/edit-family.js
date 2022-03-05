import { saveData } from "./db.js";

export const showEditFamily = (familyData) => {
  const listUserContainer = document.querySelector(".user-list");

  const listUser = () => {
    const fragment = document.createDocumentFragment();

    for (let user of Object.values(familyData)) {
      const span = document.createElement("span");
      span.textContent = `${user.name} | ${user.id} | ${user.noQRCode ? "未上传二维码" : "已上传二维码"} `;
      fragment.appendChild(span);
    }

    listUserContainer.replaceChildren(fragment);
  };

  const reader = new FileReader();
  const imageInput = document.querySelector("#userQrCode");
  const previewImg = document.querySelector(".preview");
  const userNameInput = document.querySelector(".user-name");
  const userIdInput = document.querySelector(".user-id");
  let currentUserHasQrCode = false;

  reader.onload = () => {
    previewImg.src = event.target.result;
    previewImg.classList.remove("hidden");

    const userId = userIdInput.value.trim();

    saveData(userId, reader.result);
  };

  imageInput.addEventListener("change", (event) => {
    const userId = userIdInput.value.trim();
    if (!userId) {
      alert("先输入身份证号");
      return;
    }
    const file = event.target.files[0];
    if (file.type.indexOf("image") == 0) {
      currentUserHasQrCode = true;
      reader.readAsDataURL(file);
    }
    event.currentTarget.value = "";
  });

  const addUser = () => {
    const userName = userNameInput.value.trim();
    const userId = userIdInput.value.trim();

    if (!userName || !userId) {
      alert("请输入姓名和身份证号");
      return;
    }

    familyData[userId] = {
      name: userName,
      noQRCode: !currentUserHasQrCode,
      id: userId,
    };

    localStorage.setItem("familyData", JSON.stringify(familyData));

    userNameInput.value = "";
    userIdInput.value = "";
    previewImg.src = "";
    previewImg.classList.add("hidden");
    currentUserHasQrCode = false;

    listUser(familyData);
  };

  addUserButton.addEventListener("click", addUser);
  listUser(familyData);
};
