var blurt = require('../lib');

blurt.api.getAccountCount(function(err, result) {
	console.log(err, result);
});

blurt.api.getAccounts(['hiveio'], function(err, result) {
	console.log(err, result);
	var reputation = blurt.formatter.reputation(result[0].reputation);
	console.log(reputation);
});

blurt.api.getState('trending/hive', function(err, result) {
	console.log(err, result);
});

blurt.api.getFollowing('hiveio', 0, 'blog', 10, function(err, result) {
	console.log(err, result);
});

blurt.api.getFollowers('hiveio', 0, 'blog', 10, function(err, result) {
	console.log(err, result);
});

blurt.api.streamOperations(function(err, result) {
	console.log(err, result);
});

blurt.api.getDiscussionsByActive({
  limit: 10,
  start_author: 'thecastle',
  start_permlink: 'this-week-in-level-design-1-22-2017'
}, function(err, result) {
	console.log(err, result);
});
