function checkLicense() {
  return {
    status: "ok",
    type: "community",
  };
}

function checkLicenseKey(_key) {
  return {
    status: "ok",
    type: "community",
  };
}

function isProApp() {
  return false;
}

module.exports = {
  checkLicense,
  checkLicenseKey,
  isProApp,
};
