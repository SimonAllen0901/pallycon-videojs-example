const liffId = "1660736305-gpWYY58m";

window.onload = function () {
  const liffCheck = document.getElementById("liffCheck");

  const script = document.createElement("script");
  script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
  script.onload = () => {
    liff
      .init({ liffId })
      .then(() => {
        liffCheck.innerText = "LIFF 初始化成功";
      })
      .catch((err) => {
        liffCheck.innerText = "LIFF 初始化失敗: " + err;
      });
  };
  document.head.appendChild(script);
};
