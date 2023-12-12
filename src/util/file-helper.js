/*
 * @Description: js-sdk for cess storage
 * @Autor: cess lab
 *
 */
let fs = null;
let FormDataNode = null;
const axios = require("axios");

const isBrower = typeof window != "undefined" && typeof window.document != "undefined";

async function download(url, savePath, log) {
  let result = "";
  console.log({ isBrower });
  if (isBrower) {
    result = await downloadForBrower(url, savePath, log);
  } else {
    result = await downloadForNodejs(url, savePath, log);
  }
  return result;
}
function downloadForBrower(url, savePath, log) {
  return new Promise(async (resolve, reject) => {
    try {
      log("Connecting …", url);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Operation: "download",
          Account: "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe",
        },
        responseType: "blob",
      });
      let resData = await response.blob();
      savePath = savePath.split("\\").join("/");
      let fileName = savePath.split("/").slice(-1);
      fileName = fileName[0];
      saveFile(resData, fileName);
      resolve({ msg: "ok", data: savePath });
    } catch (e) {
      log(e);
      reject(e.message);
    }
  });
}
function downloadForNodejs(url, savePath, log) {
  return new Promise((resolve, reject) => {
    try {
      log("Connecting …", url);
      if (!fs) {
        fs = require("fs");
      }
      axios
        .get(url, {
          headers: {
            Operation: "download",
            Account: "cXh5StobuVP4B7mGH9xn8dSsDtXks4qLAou8ZdkZ6DbB6zzxe",
          },
          responseType: "stream",
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
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
async function upload(url, filePath, header, log, progressCb) {
  let result = "";
  console.log({ isBrower });
  if (isBrower) {
    result = await uploadForBrower(url, filePath, header, log, progressCb);
  } else {
    result = await uploadForNodejs(url, filePath, header, log, progressCb);
  }
  return result;
}
async function uploadForBrower(url, file, header, log, progressCb) {
  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      log("uploading to ", url);

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      // 设置请求头，根据需要添加其他请求头参数
      Object.keys(header).forEach((key) => {
        xhr.setRequestHeader(key, header[key]);
      });
      xhr.onload = function () {
        if (xhr.status === 200) {
          let data = xhr.response.split('"').join("");
          resolve({ msg: "ok", data });
        } else {
          reject(Error(xhr.statusText));
        }
      };
      xhr.onerror = function () {
        reject(Error("Network Error"));
      };
      if (progressCb && typeof progressCb == "function") {
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) {
            var percentComplete = Math.ceil((e.loaded / e.total) * 100);
            progressCb(percentComplete);
          }
        };
      }
      xhr.send(formData);
    } catch (e) {
      log(e);
      reject(e.message);
    }
  });
}
async function uploadForNodejs(url, filePath, header, log, progressCb) {
  return new Promise((resolve, reject) => {
    try {
      if (!FormDataNode) {
        FormDataNode = require("form-data");
      }
      if (!fs) {
        fs = require("fs");
      }
      const fileStream = fs.createReadStream(filePath);
      const formData = new FormDataNode();
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
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            log(`Completed：${percentCompleted}%`);
            if (progressCb && typeof progressCb == "function") {
              progressCb(percentCompleted);
            }
          },
        })
        .then((res) => {
          resolve({ msg: "ok", data: res.data });
        })
        .catch((error) => {
          console.error("Upload fail：", error.message);
          reject(error.message);
        });
    } catch (e) {
      log(e);
      reject(e.message);
    }
  });
}
function saveFile(blob, name) {
  // note: commented the following because `arrayBufferToBlob()` is not a valid function.
  // if (!(blob instanceof Blob)) {
  //   blob = arrayBufferToBlob(blob);
  // }
  if (!blob) {
    return console.log("blob is null");
  }
  let a = document.createElement("a");
  a.href = window.URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(blob);
}

module.exports = {
  download,
  upload,
};
