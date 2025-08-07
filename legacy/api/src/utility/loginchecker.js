// only in DbGate Premium

function markUserAsActive(_licenseUid, _token) {}

async function isLoginLicensed(_req, _licenseUid) {
  return true;
}

function markLoginAsLoggedOut(_licenseUid) {}

const LOGIN_LIMIT_ERROR = "";

module.exports = {
  markUserAsActive,
  isLoginLicensed,
  markLoginAsLoggedOut,
  LOGIN_LIMIT_ERROR,
};
