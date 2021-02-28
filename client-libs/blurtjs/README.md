[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://gitlab.com/blurt/openblurt/blurtjs/-/blob/master/LICENSE)

# Blurt.js

Blurt.js the Official JavaScript API for Blurt blockchain

# Documentation

- [Install](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#install)
- [Browser](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#browser)
- [Config](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#config)
- [Database API](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#api)
  - [Subscriptions](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#subscriptions)
  - [Tags](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#tags)
  - [Blocks and transactions](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#blocks-and-transactions)
  - [Globals](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#globals)
  - [Keys](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#keys)
  - [Accounts](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#accounts)
  - [Authority / validation](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#authority--validation)
  - [Votes](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#votes)
  - [Content](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#content)
  - [Witnesses](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#witnesses)
- [Login API](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#login)
- [Follow API](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#follow-api)
- [Broadcast API](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#broadcast-api)
- [Broadcast](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#broadcast)
- [Auth](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc#auth)

Here is full documentation:
https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/doc

## Browser

```html
<script src="./blurt.min.js"></script>
<script>
  blurt.api.getAccounts(
    ["baabeetaa", "jacobgadikian"],
    function (err, response) {
      console.log(err, response);
    }
  );
</script>
```

## CDN

https://cdn.jsdelivr.net/npm/@blurtfoundation/blurtjs/dist/blurt.min.js<br/>

```html
<script src="https://cdn.jsdelivr.net/npm/@blurtfoundation/blurtjs/dist/blurt.min.js"></script>
```

## Webpack

[Please have a look at the webpack usage example.](https://gitlab.com/blurt/openblurt/blurtjs/-/tree/master/examples/webpack-example)

## Server

## Install

```
$ npm install @blurtfoundation/blurtjs --save
```

## RPC Servers

https://rpc.blurt.world By Default<br/>
<sub>[List of Hive nodes](https://hivekings.com/nodes)</sub><br/>

## Examples

### Broadcast Vote

```js
var blurt = require("@blurtfoundation/blurt-js");

var wif = blurt.auth.toWif(username, password, "posting");
blurt.broadcast.vote(
  wif,
  voter,
  author,
  permlink,
  weight,
  function (err, result) {
    console.log(err, result);
  }
);
```

### Get Accounts

```js
blurt.api.getAccounts(["megadrive", "jacobgadikian"], function (err, result) {
  console.log(err, result);
});
```

### Get State

```js
blurt.api.getState("/trends/funny", function (err, result) {
  console.log(err, result);
});
```

### Reputation Formatter

```js
var reputation = blurt.formatter.reputation(user.reputation);
console.log(reputation);
```

## Contributions

Patches are welcome! Contributors are listed in the package.json file. Please run the tests before opening a pull request and make sure that you are passing all of them.

## Issues

When you find issues, please report them!

## License

MIT
