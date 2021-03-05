// require('dotenv').config();
const request = require("supertest");
const app = require("../src/index");

const Datauri = require("datauri");

const chainLib = require("@blurtfoundation/blurtjs");

const {
  PrivateKey,
  PublicKey,
  Signature,
} = require("@blurtfoundation/blurtjs/lib/auth/ecc");

//= =================== API test ====================

/**
 * Testing upload api
 */
describe("POST /:username/:sig", () => {
  const username = process.env.TEST_ACCOUNT_NAME;
  const datauri = new Datauri("test/test_img.png");

   console.log(datauri.content); //=> "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
   console.log(datauri.mimetype); //=> "image/png"
   console.log(datauri.base64); //=> "iVBORw0KGgoAAAANSUhEUgAA..."

  // console.log(datauri.content);

  let data_sign = Signature.signBuffer(
    Buffer.from(datauri.base64, "base64"),
    process.env.TEST_POSTING_KEY
  )
    .toBuffer()
    .toString("base64");
  data_sign = encodeURIComponent(data_sign);
  // console.log(data_sign);
  // let sign_data = Signature.fromBuffer(new Buffer(sig, 'base64'));

  console.log(`/${username}/${data_sign}`);

  it("should return ok", (done) => {
    // use request('https://blurt.world/imageupload') to test remote endpoint
    request(app)
      .post(`/${username}/${data_sign}`)
      .set("Accept", "application/json")
      .send({ data: datauri.content })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        console.log(`res.body=${JSON.stringify(res.body)}`);

        if (res.body.status !== "ok") {
          throw new Error("not return ok");
        } else {
          console.log(`uploaded file url = ${res.body.data}`);
        }
      })
      .end(done);
  });

  it("should return error as rate-limit hit", (done) => {
    // use request('https://blurt.world/imageupload') to test remote endpoint
    request(app)
      .post(`/${username}/${data_sign}`)
      .set("Accept", "application/json")
      .send({ data: datauri.content })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        // console.log(`res.body=${res.body.status}`);

        if (res.body.status !== "error") {
          throw new Error("not return error");
        } else {
          console.log(`uploaded file url = ${res.body.data}`);
        }
      })
      .end(done);
  });
});
