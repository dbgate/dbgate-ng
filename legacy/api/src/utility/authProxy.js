function isAuthProxySupported() {
  return false;
}

async function authProxyGetRedirectUrl(_options) {
  return null;
}

async function authProxyGetTokenFromCode(_options) {
  return null;
}

function startTokenChecking(_sid, _callback) {}

function getAuthProxyUrl() {
  return "https://auth.dbgate.eu";
}

function supportsAwsIam() {
  return false;
}

async function getAwsIamToken(_params) {
  return null;
}

async function callTextToSqlApi(_text, _structure, _dialect) {
  return null;
}

async function callCompleteOnCursorApi(_cursorId, _query, _position, _dialect) {
  return null;
}

async function callRefactorSqlQueryApi(_query, _task, _structure, _dialect) {
  return null;
}

function getLicenseHttpHeaders() {
  return {};
}

async function tryToGetRefreshedLicense(_oldLicenseKey) {
  return {
    status: "error",
  };
}

function getAiGatewayServer() {
  return {};
}

module.exports = {
  isAuthProxySupported,
  authProxyGetRedirectUrl,
  authProxyGetTokenFromCode,
  startTokenChecking,
  getAuthProxyUrl,
  supportsAwsIam,
  getAwsIamToken,
  callTextToSqlApi,
  callCompleteOnCursorApi,
  callRefactorSqlQueryApi,
  getLicenseHttpHeaders,
  tryToGetRefreshedLicense,
  getAiGatewayServer,
};
