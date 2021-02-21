const blurt = require('../lib');

/* Generate private active WIF */
const username = process.env.BLURT_USERNAME;
const password = process.env.BLURT_PASSWORD;
const privActiveWif = blurt.auth.toWif(username, password, 'active');

/** Add posting key auth */
blurt.broadcast.addKeyAuth({
    signingKey: privActiveWif,
    username,
    authorizedKey: 'BLT88CPfhCmeEzCnvC1Cjc3DNd1DTjkMcmihih8SSxmm4LBqRq5Y9',
    role: 'posting',
  },
  (err, result) => {
    console.log(err, result);
  }
);
