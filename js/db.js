const DB_NAME = "family-nat";
const TABLE_NAME = "image-data";
const DB_VERSION = 1;
let dbInstance;

export const saveData = async (id, imageB64Data) => {
  return await dbInstance.transaction(TABLE_NAME, "readwrite").objectStore(TABLE_NAME).put({
    id: id,
    imageB64Data: imageB64Data,
  });
};

export const getData = (id) => {
  return new Promise((resolve) => {
    const transaction = dbInstance.transaction(TABLE_NAME, "readonly");
    const imageTable = transaction.objectStore(TABLE_NAME);
    const imageItem = imageTable.get(id);

    imageItem.onsuccess = (event) => {
      resolve(event.target.result ? event.target.result.imageB64Data : undefined);
    };

    imageItem.onerror = () => resolve(undefined);
  });
};

export const init = () => {
  return new Promise((resolve, reject) => {
    const DBOpenRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

    DBOpenRequest.onsuccess = () => {
      dbInstance = DBOpenRequest.result;
      resolve();
    };

    DBOpenRequest.onerror = () => reject();

    DBOpenRequest.onupgradeneeded = async (event) => {
      dbInstance = event.target.result;
      const imageStore = dbInstance.createObjectStore(TABLE_NAME, {
        keyPath: "id",
      });

      imageStore.createIndex("id", "id", {
        unique: true,
      });
      imageStore.createIndex("imageB64Data", "imageB64Data");
    };
  });
};
