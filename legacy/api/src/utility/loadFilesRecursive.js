const fs = require("fs-extra");
const _stream = require("node:stream");
const _readline = require("node:readline");
const path = require("node:path");

async function loadFilesRecursive(dir, root = null) {
  if (!root) root = dir;
  if (!root.endsWith(path.sep)) root += path.sep;
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.join(dir, dirent.name);
      return dirent.isDirectory() ? loadFilesRecursive(res, root) : res;
    })
  );
  const flatten = Array.prototype.concat(...files);
  return flatten.map((file) =>
    file.startsWith(root) ? file.substr(root.length) : file
  );
}

module.exports = loadFilesRecursive;
