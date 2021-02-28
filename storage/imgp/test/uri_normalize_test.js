const uri_normalize = require("../src/uri_normalize");

const urls = [
  "https://scontent.fcpt7-1.fna.fbcdn.net/v/t1.0-9/12592532_10209053945290937_1144428847558380163_n.jpg?_nc_cat=106&oh=6bbb92ff6fc1a7141d3e7a7b48aa832a&oe=5C5A4562",
];

for (const url of urls) {
  const after = uri_normalize(url);
  console.log(`before: ${url}`);
  console.log(`after : ${after}`);
}
