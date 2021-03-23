# Documentation

- [Install](#install)
- [Browser](#browser)
- [Config](#config)
- [JSON-RPC](#jsonrpc)
- [Database API](#api)
  - [Subscriptions](#subscriptions)
  - [Tags](#tags)
  - [Blocks and transactions](#blocks-and-transactions)
  - [Globals](#globals)
  - [Keys](#keys)
  - [Accounts](#accounts)
  - [Market](#market)
  - [Authority / validation](#authority--validation)
  - [Votes](#votes)
  - [Content](#content)
  - [Witnesses](#witnesses)
- [Login API](#login)
- [Follow API](#follow-api)
- [Broadcast API](#broadcast-api)
- [Broadcast](#broadcast)
- [Auth](#auth)
- [Formatter](#formatter)

# Install

```
$ npm install @hiveio/blurt-js --save
```

# Browser

```html
<script src="./blurt.min.js"></script>
<script>
  blurt.api.getAccounts(["mahdiyari", "hiveio"], function (err, response) {
    console.log(err, response);
  });
</script>
```

## Config

Default config should work with Hive. However you can change default config.
as

```js
blurt.api.setOptions({ url: "https://rpc.blurt.world", useAppbaseApi: true });
blurt.config.set("address_prefix", "BLT");
blurt.config.set(
  "chain_id",
  "cd8d90f29ae273abec3eaa7731e25934c63eb654d55080caff2ebb7f5df6381f"
);
blurt.config.set("alternative_api_endpoints", [
  "https://rpc.blurt.world",
  "https://rpc.blurt.world",
]);
```

### set

```
blurt.config.set('address_prefix','BLT');
```

### get

```
blurt.config.get('chain_id');
```

## JSON-RPC

Here is how to activate JSON-RPC transport:

```js
blurt.api.setOptions({ url: "https://rpc.blurt.world" });
```

# API

## Subscriptions

### Set Subscribe Callback

```
blurt.api.setSubscribeCallback(callback, clearFilter, function(err, result) {
  console.log(err, result);
});
```

### Set Pending Transaction Callback

```
blurt.api.setPendingTransactionCallback(cb, function(err, result) {
  console.log(err, result);
});
```

### Set Block Applied Callback

```
blurt.api.setBlockAppliedCallback(cb, function(err, result) {
  console.log(err, result);
});
```

### Cancel All Subscriptions

```
blurt.api.cancelAllSubscriptions(function(err, result) {
  console.log(err, result);
});
```

## Tags

### Get Trending Tags

```
blurt.api.getTrendingTags(afterTag, limit, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Trending

```
blurt.api.getDiscussionsByTrending(query, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Created

```
blurt.api.getDiscussionsByCreated(query, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Active

```
blurt.api.getDiscussionsByActive(query, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Cashout

```
blurt.api.getDiscussionsByCashout(query, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Payout

```
blurt.api.getDiscussionsByPayout(query, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Votes

```
blurt.api.getDiscussionsByVotes(query, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Children

```
blurt.api.getDiscussionsByChildren(query, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Hot

```
blurt.api.getDiscussionsByHot(query, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Feed

```
blurt.api.getDiscussionsByFeed(query, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Blog

```
blurt.api.getDiscussionsByBlog(query, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Comments

```
blurt.api.getDiscussionsByComments(query, function(err, result) {
  console.log(err, result);
});
```

## Blocks and transactions

### Get Block Header

```
blurt.api.getBlockHeader(blockNum, function(err, result) {
  console.log(err, result);
});
```

### Get Block

```
blurt.api.getBlock(blockNum, function(err, result) {
  console.log(err, result);
});
```

### Get State

```
blurt.api.getState(path, function(err, result) {
  console.log(err, result);
});
```

### Get Trending Categories

```
blurt.api.getTrendingCategories(after, limit, function(err, result) {
  console.log(err, result);
});
```

### Get Best Categories

```
blurt.api.getBestCategories(after, limit, function(err, result) {
  console.log(err, result);
});
```

### Get Active Categories

```
blurt.api.getActiveCategories(after, limit, function(err, result) {
  console.log(err, result);
});
```

### Get Recent Categories

```
blurt.api.getRecentCategories(after, limit, function(err, result) {
  console.log(err, result);
});
```

## Globals

### Get Config

```
blurt.api.getConfig(function(err, result) {
  console.log(err, result);
});
```

### Get Dynamic Global Properties

```
blurt.api.getDynamicGlobalProperties(function(err, result) {
  console.log(err, result);
});
```

### Get Chain Properties

```
blurt.api.getChainProperties(function(err, result) {
  console.log(err, result);
});
```

### Get Feed History

```
blurt.api.getFeedHistory(function(err, result) {
  console.log(err, result);
});
```

### Get Current Median History Price

```
blurt.api.getCurrentMedianHistoryPrice(function(err, result) {
  console.log(err, result);
});
```

### Get Hardfork Version

```
blurt.api.getHardforkVersion(function(err, result) {
  console.log(err, result);
});
```

### Get Next Scheduled Hardfork

```
blurt.api.getNextScheduledHardfork(function(err, result) {
  console.log(err, result);
});
```

### Get Reward Fund

```
blurt.api.getRewardFund(name, function(err, result) {
  console.log(err, result);
});
```

### Get Vesting Delegations

```
blurt.api.getVestingDelegations(account, from, limit, function(err, result) {
  console.log(err, result);
});
```

## Keys

### Get Key References

```
blurt.api.getKeyReferences(key, function(err, result) {
  console.log(err, result);
});
```

## Accounts

### Get Accounts

```
blurt.api.getAccounts(names, function(err, result) {
  console.log(err, result);
});
```

### Get Account References

```
blurt.api.getAccountReferences(accountId, function(err, result) {
  console.log(err, result);
});
```

### Lookup Account Names

```
blurt.api.lookupAccountNames(accountNames, function(err, result) {
  console.log(err, result);
});
```

### Lookup Accounts

```
blurt.api.lookupAccounts(lowerBoundName, limit, function(err, result) {
  console.log(err, result);
});
```

### Get Account Count

```
blurt.api.getAccountCount(function(err, result) {
  console.log(err, result);
});
```

### Get Conversion Requests

```
blurt.api.getConversionRequests(accountName, function(err, result) {
  console.log(err, result);
});
```

### Get Account History

```
blurt.api.getAccountHistory(account, from, limit, function(err, result) {
  console.log(err, result);
});
```

### Get Owner History

```
blurt.api.getOwnerHistory(account, function(err, result) {
  console.log(err, result);
});
```

### Get Recovery Request

```
blurt.api.getRecoveryRequest(account, function(err, result) {
  console.log(err, result);
});
```

## Authority / validation

### Get Transaction Hex

```
blurt.api.getTransactionHex(trx, function(err, result) {
  console.log(err, result);
});
```

### Get Transaction

```
blurt.api.getTransaction(trxId, function(err, result) {
  console.log(err, result);
});
```

### Get Required Signatures

```
blurt.api.getRequiredSignatures(trx, availableKeys, function(err, result) {
  console.log(err, result);
});
```

### Get Potential Signatures

```
blurt.api.getPotentialSignatures(trx, function(err, result) {
  console.log(err, result);
});
```

### Verify Authority

```
blurt.api.verifyAuthority(trx, function(err, result) {
  console.log(err, result);
});
```

### Verify Account Authority

```
blurt.api.verifyAccountAuthority(nameOrId, signers, function(err, result) {
  console.log(err, result);
});
```

## Votes

### Get Active Votes

```
blurt.api.getActiveVotes(author, permlink, function(err, result) {
  console.log(err, result);
});
```

### Get Account Votes

```
blurt.api.getAccountVotes(voter, function(err, result) {
  console.log(err, result);
});
```

## Content

### Get Content

```
blurt.api.getContent(author, permlink, function(err, result) {
  console.log(err, result);
});
```

### Get Content Replies

```
blurt.api.getContentReplies(author, permlink, function(err, result) {
  console.log(err, result);
});
```

### Get Discussions By Author Before Date

```
blurt.api.getDiscussionsByAuthorBeforeDate(author, startPermlink, beforeDate, limit, function(err, result) {
  console.log(err, result);
});
```

### Get Replies By Last Update

```
blurt.api.getRepliesByLastUpdate(startAuthor, startPermlink, limit, function(err, result) {
  console.log(err, result);
});
```

## Witnesses

### Get Witnesses

```
blurt.api.getWitnesses(witnessIds, function(err, result) {
  console.log(err, result);
});
```

### Get Witness By Account

```
blurt.api.getWitnessByAccount(accountName, function(err, result) {
  console.log(err, result);
});
```

### Get Witnesses By Vote

```
blurt.api.getWitnessesByVote(from, limit, function(err, result) {
  console.log(err, result);
});
```

### Lookup Witness Accounts

```
blurt.api.lookupWitnessAccounts(lowerBoundName, limit, function(err, result) {
  console.log(err, result);
});
```

### Get Witness Count

```
blurt.api.getWitnessCount(function(err, result) {
  console.log(err, result);
});
```

### Get Active Witnesses

```
blurt.api.getActiveWitnesses(function(err, result) {
  console.log(err, result);
});
```

### Get Miner Queue

```
blurt.api.getMinerQueue(function(err, result) {
  console.log(err, result);
});
```

## Login API

### Login

/!\ It's **not safe** to use this method with your username and password. This method always return `true` and is only used in intern with empty values to enable broadcast.

```
blurt.api.login('', '', function(err, result) {
  console.log(err, result);
});
```

### Get Api By Name

```
blurt.api.getApiByName(apiName, function(err, result) {
  console.log(err, result);
});
```

## Follow API

### Get Followers

```
blurt.api.getFollowers(following, startFollower, followType, limit, function(err, result) {
  console.log(err, result);
});
```

### Get Following

```
blurt.api.getFollowing(follower, startFollowing, followType, limit, function(err, result) {
  console.log(err, result);
});
```

### Get Follow Count

```
blurt.api.getFollowCount(account, function(err, result) {
  console.log(err, result);
});
```

## Broadcast API

### Broadcast Transaction Synchronous

```
blurt.api.broadcastTransactionSynchronous(trx, function(err, result) {
  console.log(err, result);
});
```

### Broadcast Block

```
blurt.api.broadcastBlock(b, function(err, result) {
  console.log(err, result);
});
```

# Broadcast

### Account Create

```
blurt.broadcast.accountCreate(wif, fee, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata, function(err, result) {
  console.log(err, result);
});
```

### Account Create With Delegation

```
blurt.broadcast.accountCreateWithDelegation(wif, fee, delegation, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata, extensions, function(err, result) {
  console.log(err, result);
});
```

### Delegate Vesting Shares

```
blurt.broadcast.delegateVestingShares(wif, delegator, delegatee, vesting_shares, function(err, result) {
  console.log(err, result);
});
```

### Account Update

```
blurt.broadcast.accountUpdate(wif, account, owner, active, posting, memoKey, jsonMetadata, function(err, result) {
  console.log(err, result);
});
```

### Account Witness Proxy

```
blurt.broadcast.accountWitnessProxy(wif, account, proxy, function(err, result) {
  console.log(err, result);
});
```

### Account Witness Vote

```
blurt.broadcast.accountWitnessVote(wif, account, witness, approve, function(err, result) {
  console.log(err, result);
});
```

### Challenge Authority

```
blurt.broadcast.challengeAuthority(wif, challenger, challenged, requireOwner, function(err, result) {
  console.log(err, result);
});
```

### Change Recovery Account

```
blurt.broadcast.changeRecoveryAccount(wif, accountToRecover, newRecoveryAccount, extensions, function(err, result) {
  console.log(err, result);
});
```

### Comment

```
blurt.broadcast.comment(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata, function(err, result) {
  console.log(err, result);
});
```

### Comment Options

```
blurt.broadcast.commentOptions(wif, author, permlink, maxAcceptedPayout, percentBlurt, allowVotes, allowCurationRewards, extensions, function(err, result) {
  console.log(err, result);
});
```

### Comment Payout

```
blurt.broadcast.commentPayout(wif, author, permlink, payout, function(err, result) {
  console.log(err, result);
});
```

### Comment Reward

```
blurt.broadcast.commentReward(wif, author, permlink, hbdPayout, vestingPayout, function(err, result) {
  console.log(err, result);
});
```

### Curate Reward

```
blurt.broadcast.curateReward(wif, curator, reward, commentAuthor, commentPermlink, function(err, result) {
  console.log(err, result);
});
```

### Custom

```
blurt.broadcast.custom(wif, requiredAuths, id, data, function(err, result) {
  console.log(err, result);
});
```

### Custom Binary

```
blurt.broadcast.customBinary(wif, id, data, function(err, result) {
  console.log(err, result);
});
```

### Custom Json

```
blurt.broadcast.customJson(wif, requiredAuths, requiredPostingAuths, id, json, function(err, result) {
  console.log(err, result);
});
```

### Delete Comment

```
blurt.broadcast.deleteComment(wif, author, permlink, function(err, result) {
  console.log(err, result);
});
```

### Escrow Dispute

```
blurt.broadcast.escrowDispute(wif, from, to, agent, who, escrowId, function(err, result) {
  console.log(err, result);
});
```

### Escrow Release

```
blurt.broadcast.escrowRelease(wif, from, to, agent, who, receiver, escrowId, hbdAmount, hiveAmount, function(err, result) {
  console.log(err, result);
});
```

### Escrow Transfer

```
blurt.broadcast.escrowTransfer(wif, from, to, agent, escrowId, hbdAmount, hiveAmount, fee, ratificationDeadline, escrowExpiration, jsonMeta, function(err, result) {
  console.log(err, result);
});
```

### Fill Vesting Withdraw

```
blurt.broadcast.fillVestingWithdraw(wif, fromAccount, toAccount, withdrawn, deposited, function(err, result) {
  console.log(err, result);
});
```

### Prove Authority

```
blurt.broadcast.proveAuthority(wif, challenged, requireOwner, function(err, result) {
  console.log(err, result);
});
```

### Recover Account

```
blurt.broadcast.recoverAccount(wif, accountToRecover, newOwnerAuthority, recentOwnerAuthority, extensions, function(err, result) {
  console.log(err, result);
});
```

### Report Over Production

```
blurt.broadcast.reportOverProduction(wif, reporter, firstBlock, secondBlock, function(err, result) {
  console.log(err, result);
});
```

### Request Account Recovery

```
blurt.broadcast.requestAccountRecovery(wif, recoveryAccount, accountToRecover, newOwnerAuthority, extensions, function(err, result) {
  console.log(err, result);
});
```

### Escrow Approve

```
blurt.broadcast.escrowApprove(wif, from, to, agent, who, escrowId, approve, function(err, result) {
  console.log(err, result);
});
```

### Set Withdraw Vesting Route

```
blurt.broadcast.setWithdrawVestingRoute(wif, fromAccount, toAccount, percent, autoVest, function(err, result) {
  console.log(err, result);
});
```

### Transfer

```
blurt.broadcast.transfer(wif, from, to, amount, memo, function(err, result) {
  console.log(err, result);
});
```

### Transfer To Vesting

```
blurt.broadcast.transferToVesting(wif, from, to, amount, function(err, result) {
  console.log(err, result);
});
```

### Vote

```
blurt.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
  console.log(err, result);
});
```

### Withdraw Vesting

```
blurt.broadcast.withdrawVesting(wif, account, vestingShares, function(err, result) {
  console.log(err, result);
});
```

### Witness Update

```
blurt.broadcast.witnessUpdate(wif, owner, url, blockSigningKey, props, fee, function(err, result) {
  console.log(err, result);
});
```

### Fill Vesting Withdraw

```
blurt.broadcast.fillVestingWithdraw(wif, fromAccount, toAccount, withdrawn, deposited, function(err, result) {
  console.log(err, result);
});
```

### Fill Transfer From Savings

```
blurt.broadcast.fillTransferFromSavings(wif, from, to, amount, requestId, memo, function(err, result) {
  console.log(err, result);
});
```

### Comment Payout

```
blurt.broadcast.commentPayout(wif, author, permlink, payout, function(err, result) {
  console.log(err, result);
});
```

### Transfer To Savings

```
blurt.broadcast.transferToSavings(wif, from, to, amount, memo, function(err, result) {
  console.log(err, result);
});
```

### Transfer From Savings

```
blurt.broadcast.transferFromSavings(wif, from, requestId, to, amount, memo, function(err, result) {
  console.log(err, result);
});
```

### Cancel Transfer From Savings

```
blurt.broadcast.cancelTransferFromSavings(wif, from, requestId, function(err, result) {
  console.log(err, result);
});
```

### Multisig

You can use multisignature to broadcast an operation.

```
blurt.broadcast.send({
  extensions: [],
  operations: [
    ['vote', {
      voter: 'guest123',
      author: 'fabien',
      permlink: 'test',
      weight: 1000
    }]
  ]}, [privPostingWif1, privPostingWif2], (err, result) => {
  console.log(err, result);
});
```

# Auth

### Verify

```
blurt.auth.verify(name, password, auths);
```

### Generate Keys

```
blurt.auth.generateKeys(name, password, roles);
```

### Get Private Keys

```
blurt.auth.getPrivateKeys(name, password, roles);
```

### Is Wif

```
blurt.auth.isWif(privWif);
```

### To Wif

```
blurt.auth.toWif(name, password, role);
```

### Wif Is Valid

```
blurt.auth.wifIsValid(privWif, pubWif);
```

### Wif To Public

```
blurt.auth.wifToPublic(privWif);
```

### Sign Transaction

```
blurt.auth.signTransaction(trx, keys);
```

# Formatter

### Create Suggested Password

```
var password = blurt.formatter.createSuggestedPassword();
console.log(password);
// => 'GAz3GYFvvQvgm7t2fQmwMDuXEzDqTzn9'
```

### Comment Permlink

```
var parentAuthor = 'hiveio';
var parentPermlink = 'announcing-the-launch-of-hive-blockchain';
var commentPermlink = hive.formatter.commentPermlink(parentAuthor, parentPermlink);
console.log(commentPermlink);
```

### Estimate Account Value

```
var hivePower = blurt.formatter.estimateAccountValue(account);
```

### Reputation

```
var reputation = blurt.formatter.reputation(3512485230915);
console.log(reputation);
// => 56
```

### Vest To Blurt

**Warning:** hive.formatter.vestToSteem() is deprecated and will be removed in the future releases.
Use the following method instead:

```
var hivePower = blurt.formatter.vestToSteem(vestingShares, totalVestingShares, totalVestingFundHive);
console.log(hivePower);
```

# Utils

### Validate Username

```
var isValidUsername = blurt.utils.validateAccountName('test1234');
console.log(isValidUsername);
// => 'null'

var isValidUsername = blurt.utils.validateAccountName('a1');
console.log(isValidUsername);
// => 'Account name should be longer.'
```
