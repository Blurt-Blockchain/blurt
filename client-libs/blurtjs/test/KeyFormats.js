import { PrivateKey, PublicKey, Address } from "../src/auth/ecc";
import assert from "assert";

const test = function (key) {
  describe("steem.auth: key_formats", function () {
    it("Calcualtes public key from private key", function () {
      const private_key = PrivateKey.fromHex(key.private_key);
      const public_key = private_key.toPublicKey();
      assert.equal(key.public_key, public_key.toPublicKeyString());
    });

    it("Create BTS short address", function () {
      const public_key = PublicKey.fromString(key.public_key);
      assert.equal(key.bts_address, public_key.toAddressString());
    });

    it("Blockchain Address", function () {
      const public_key = PublicKey.fromString(key.public_key);
      assert.equal(
        key.blockchain_address,
        public_key.toBlockchainAddress().toString("hex")
      );
    });

    it("BTS public key import / export", function () {
      const public_key = PublicKey.fromString(key.public_key);
      assert.equal(key.public_key, public_key.toPublicKeyString());
    });

    it("PTS", function () {
      const private_key = PrivateKey.fromHex(key.private_key);
      const public_key = private_key.toPublicKey();
      assert.equal(key.pts_address, public_key.toPtsAddy());
    });

    it("To WIF", function () {
      const private_key = PrivateKey.fromHex(key.private_key);
      assert.equal(key.private_key_WIF_format, private_key.toWif());
    });

    it("From WIF", function () {
      const private_key = PrivateKey.fromWif(key.private_key_WIF_format);
      assert.equal(private_key.toHex(), key.private_key);
    });

    it("Calc public key", function () {
      const private_key = PrivateKey.fromHex(key.private_key);
      const public_key = private_key.toPublicKey();
      assert.equal(key.bts_address, public_key.toAddressString());
    });

    it("BTS/BTC uncompressed", function () {
      const public_key = PublicKey.fromString(key.public_key);
      const address = Address.fromPublic(public_key, false, 0);
      assert.equal(key.Uncompressed_BTC, address.toString());
    });

    it("BTS/BTC compressed", function () {
      const public_key = PublicKey.fromString(key.public_key);
      const address = Address.fromPublic(public_key, true, 0);
      assert.equal(key.Compressed_BTC, address.toString());
    });

    it("BTS/PTS uncompressed", function () {
      const public_key = PublicKey.fromString(key.public_key);
      const address = Address.fromPublic(public_key, false, 56);
      assert.equal(key.Uncompressed_PTS, address.toString());
    });

    it("BTS/PTS compressed", function () {
      const public_key = PublicKey.fromString(key.public_key);
      const address = Address.fromPublic(public_key, true, 56);
      assert.equal(key.Compressed_PTS, address.toString());
    });

    it("null hex to pubkey", function () {
      const public_key = PublicKey.fromHex(key.null_hex);
      assert.equal(key.null_address, public_key.toPublicKeyString());
    });

    it("null pubkey to hex", function () {
      const public_key = PublicKey.fromString(key.null_address);
      assert.equal(key.null_hex, public_key.toHex());
    });
  });
};

test({
  // delegate0
  // sourced from: ./bitshares/programs/utils/bts_create_key
  public_key: "BLT7jDPoMwyjVH5obFmqzFNp4Ffp7G2nvC7FKFkrMBpo7Sy4uq5Mj",
  private_key:
    "20991828d456b389d0768ed7fb69bf26b9bb87208dd699ef49f10481c20d3e18",
  private_key_WIF_format: "5J4eFhjREJA7hKG6KcvHofHMXyGQZCDpQE463PAaKo9xXY6UDPq",
  bts_address: "BLT8DvGQqzbgCR5FHiNsFf8kotEXr8VKD3mR",
  pts_address: "Po3mqkgMzBL4F1VXJArwQxeWf3fWEpxUf3",
  encrypted_private_key:
    "5e1ae410919c450dce1c476ae3ed3e5fe779ad248081d85b3dcf2888e698744d0a4b60efb7e854453bec3f6883bcbd1d",
  blockchain_address: "4f3a560442a05e4fbb257e8dc5859b736306bace",
  // https://github.com/BitShares/bitshares/blob/2602504998dcd63788e106260895769697f62b07/libraries/wallet/wallet_db.cpp#L103-L108
  Uncompressed_BTC: "BLTLAFmEtM8as1mbmjVcj5dphLdPguXquimn",
  Compressed_BTC: "BLTANNTSEaUviJgWLzJBersPmyFZBY4jJETY",
  Uncompressed_PTS: "BLTEgj7RM6FBwSoccGaESJLC3Mi18785bM3T",
  Compressed_PTS: "BLTD5rYtofD6D4UHJH6mo953P5wpBfMhdMEi",
  // https://github.com/steemit/steem-js/issues/267
  null_hex:
    "000000000000000000000000000000000000000000000000000000000000000000",
  null_address: "BLT1111111111111111111111111111111114T1Anm",
});
