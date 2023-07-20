"use strict";
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

function download(url, savePath, log) {
  return new Promise((resolve, reject) => {
    try {
      log("Connecting …", url);
      axios
        .get(url, {
          headers: {
            Operation: "download",
          },
          responseType: "stream",
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            log(`Completed：${percentCompleted}%`);
            if (percentCompleted >= 100) {
              resolve({ msg: "ok", data: savePath });
            }
          },
        })
        .then((response) => {
          response.data.pipe(fs.createWriteStream(savePath));
        })
        .catch((error) => {
          console.error("Download fail：", error);
          reject(error);
        });
    } catch (e) {
      log(e);
      reject(e.message);
    }
  });
}
async function upload(url, filePath, header, log) {
  return new Promise((resolve, reject) => {
    try {
      const fileStream = fs.createReadStream(filePath);
      const formData = new FormData();
      formData.append("file", fileStream);
      const headers = formData.getHeaders();
      Object.keys(header).forEach((k) => {
        headers[k] = header[k];
      });
      log("Connecting …", url);
      axios
        .put(url, formData, {
          headers,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            log(`Completed：${percentCompleted}%`);
          },
        })
        .then((res) => {
          resolve({ msg: "ok", data: res.data });
        })
        .catch((error) => {
          console.error("Download fail：", error);
          reject(error);
        });
    } catch (e) {
      log(e);
      reject(e.message);
    }
  });
}

module.exports = {
  download,
  upload,
};
