const blurt = require("../lib");

const resultP = blurt.api.getContentAsync(
  "hiveio",
  "announcing-the-launch-of-hive-blockchain"
);
resultP.then((result) => console.log(result));
