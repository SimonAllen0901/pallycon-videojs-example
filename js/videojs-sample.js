var player = videojs("my-player");

function configureDRM() {
  player.ready(async function () {
    let playerConfig;
    player.eme();
    console.log("drmType", drmType);
    if ("FairPlay" === drmType) {
      playerConfig = {
        src: hlsUri,
        type: "application/x-mpegurl",
        keySystems: {
          "com.apple.fps.1_0": {
            getCertificate: function (emeOptions, callback) {
              videojs.xhr(
                {
                  url: fairplayCertUri,
                  method: "GET",
                },
                function (err, response, responseBody) {
                  if (err) {
                    callback(err);
                    return;
                  }
                  callback(null, base64DecodeUint8Array(responseBody));
                }
              );
            },
            getContentId: function (emeOptions, initData) {
              const contentId = arrayToString(initData);
              return contentId.substring(contentId.indexOf("skd://") + 6);
            },
            getLicense: function (emeOptions, contentId, keyMessage, callback) {
              videojs.xhr(
                {
                  url: licenseUri,
                  method: "POST",
                  responseType: "text",
                  body: "spc=" + base64EncodeUint8Array(keyMessage),
                  headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                    "pallycon-customdata-v2": fairplayToken,
                  },
                },
                function (err, response, responseBody) {
                  if (err) {
                    callback(err);
                    return;
                  }
                  callback(null, base64DecodeUint8Array(responseBody));
                }
              );
            },
          },
        },
      };
    } else if ("PlayReady" === drmType) {
      playerConfig = {
        src: dashUri,
        type: "application/dash+xml",
        keySystemOptions: [
          {
            name: "com.microsoft.playready",
            options: {
              serverURL: licenseUri,
              httpRequestHeaders: {
                "pallycon-customdata-v2": playreadyToken,
              },
            },
          },
        ],
      };
    } else if ("Widevine" === drmType) {
      const widevineCert = await getWidevineCertBase64();
      playerConfig = {
        src: dashUri,
        type: "application/dash+xml",
        keySystemOptions: [
          {
            name: "com.widevine.alpha",
            options: {
              serverURL: licenseUri,
              serverCertificate: widevineCert,
              httpRequestHeaders: {
                "pallycon-customdata-v2": widevineToken,
              },
              persistentState: "required",
            },
          },
        ],
      };
    } else {
      console.log("No DRM supported in this browser");
    }
    player.src(playerConfig);
  });
}

checkSupportedDRM().then(() => {
  checkBrowser();
  player.ready(function () {
    configureDRM();
  });
  player.play();
});
