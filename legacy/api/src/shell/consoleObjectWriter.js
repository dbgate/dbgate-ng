const stream = require("node:stream");

class ObjectWriterStream extends stream.Writable {
  _write(chunk, _enc, next) {
    console.log(JSON.stringify(chunk));
    next();
  }
}

async function consoleObjectWriter() {
  return new ObjectWriterStream({
    objectMode: true,
  });
}

module.exports = consoleObjectWriter;
