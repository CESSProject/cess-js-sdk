let fs = null;
let FormDataNode = null;
const axios = require("axios");

const isBrower =
  typeof window != "undefined" && typeof window.document != "undefined";
async function download(url, savePath, log) {
  let result = "";
  if (isBrower) {
    result = await downloadForBrower(url, savePath, log);
  } else {
    result = await downloadForNodejs(url, savePath, log);
  }
  return result;
}
function downloadForBrower(url, savePath, log) {
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
          },
          responseType: "arraybuffer",
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
          // response.data.pipe(fs.createWriteStream(savePath));
          let arrayBuffer = response.data;
          let totalLength = arrayBuffer.byteLength;
          const result = new Uint8Array(totalLength);
          result.set(new Uint8Array(arrayBuffer), 0);
          savePath = savePath.split("\\").join("/");
          let fileName = savePath.split("/").slice(-1);
          fileName = fileName[0];
          saveFile(result, fileName);
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
  let result = "";
  if (isBrower) {
    result = await uploadForBrower(url, filePath, header, log);
  } else {
    result = await uploadForNodejs(url, filePath, header, log);
  }
  return result;
}
async function uploadForBrower(url, file, header, log) {
  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      log("uploading to ", url);
      axios
        .put(url, formData, {
          headers:header,
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
async function uploadForNodejs(url, filePath, header, log) {
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
function saveFile(blob, name) {
  if (!(blob instanceof Blob)) {
    blob = arrayBufferToBlob(blob);
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
