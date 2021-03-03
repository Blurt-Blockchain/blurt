const blurt = require('../lib')

blurt.api.getAccountCount((err, result) => {
  console.log(err, result)
})

blurt.api.getAccounts(['hiveio'], (err, result) => {
  console.log(err, result)
  const reputation = blurt.formatter.reputation(result[0].reputation)
  console.log(reputation)
})

blurt.api.getState('trending/hive', (err, result) => {
  console.log(err, result)
})

blurt.api.getFollowing('hiveio', 0, 'blog', 10, (err, result) => {
  console.log(err, result)
})

blurt.api.getFollowers('hiveio', 0, 'blog', 10, (err, result) => {
  console.log(err, result)
})

blurt.api.streamOperations((err, result) => {
  console.log(err, result)
})

blurt.api.getDiscussionsByActive(
  {
    limit: 10,
    start_author: 'thecastle',
    start_permlink: 'this-week-in-level-design-1-22-2017'
  },
  (err, result) => {
    console.log(err, result)
  }
)
