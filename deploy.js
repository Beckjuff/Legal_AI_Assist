var sys = require("sys");
var exec = require("child_process").exec;
const version = require("./package.json").version;

dir.on("exit", function (code) {
  console.log(code);
  // exit code is code
});
