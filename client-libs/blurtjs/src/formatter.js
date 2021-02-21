import get from "lodash/get";
import { key_utils } from "./auth/ecc";

module.exports = steemAPI => {
  function numberWithCommas(x) {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function vestingSteem(account, gprops) {
    const vests = parseFloat(account.vesting_shares.split(" ")[0]);
    const total_vests = parseFloat(gprops.total_vesting_shares.split(" ")[0]);
    const total_vest_steem = parseFloat(
      gprops.total_vesting_fund_steem.split(" ")[0]
    );
    const vesting_steemf = total_vest_steem * (vests / total_vests);
    return vesting_steemf;
  }

  function calculateSaving(savings_withdraws) {
    let savings_pending = 0;
    savings_withdraws.forEach(withdraw => {
      const [amount, asset] = withdraw.amount.split(" ");
      if (asset === "BLURT") savings_pending += parseFloat(amount);
    });
    return { savings_pending };
  }

  function estimateAccountValue(
    account,
    { gprops, savings_withdraws, vesting_steem } = {}
  ) {
    const promises = [];
    const username = account.name;
    const assetPrecision = 1000;
    let savings;

    if (!vesting_steem) {
      if (!gprops) {
        promises.push(
          steemAPI.getStateAsync(`/@${username}`).then(data => {
            gprops = data.props;
            vesting_steem = vestingSteem(account, gprops);
          })
        );
      } else {
        vesting_steem = vestingSteem(account, gprops);
      }
    }

    if (!savings_withdraws) {
      promises.push(
        steemAPI
          .getSavingsWithdrawFromAsync(username)
          .then(savings_withdraws => {
            savings = calculateSaving(savings_withdraws);
          })
      );
    } else {
      savings = calculateSaving(savings_withdraws);
    }

    return Promise.all(promises).then(() => {
      const savings_balance = account.savings_balance;
      const balance_steem = parseFloat(account.balance.split(" ")[0]);
      const saving_balance_steem = parseFloat(savings_balance.split(" ")[0]);

      const total_steem =
        vesting_steem +
        balance_steem +
        saving_balance_steem +
        savings.savings_pending;

      return (total_steem).toFixed(2);
    });
  }

  function createSuggestedPassword() {
    const PASSWORD_LENGTH = 32;
    const privateKey = key_utils.get_random_key();
    return privateKey.toWif().substring(3, 3 + PASSWORD_LENGTH);
  }

  return {
    reputation: function(reputation) {
      if (reputation == null) return reputation;
      reputation = parseInt(reputation);
      let rep = String(reputation);
      const neg = rep.charAt(0) === "-";
      rep = neg ? rep.substring(1) : rep;
      const str = rep;
      const leadingDigits = parseInt(str.substring(0, 4));
      const log = Math.log(leadingDigits) / Math.log(10);
      const n = str.length - 1;
      let out = n + (log - parseInt(log));
      if (isNaN(out)) out = 0;
      out = Math.max(out - 9, 0);
      out = (neg ? -1 : 1) * out;
      out = out * 9 + 25;
      out = parseInt(out);
      return out;
    },

    vestToSteem: function(
      vestingShares,
      totalVestingShares,
      totalVestingFundSteem
    ) {
      return (
        parseFloat(totalVestingFundSteem) *
        (parseFloat(vestingShares) / parseFloat(totalVestingShares))
      );
    },

    commentPermlink: function(parentAuthor, parentPermlink) {
      const timeStr = new Date()
        .toISOString()
        .replace(/[^a-zA-Z0-9]+/g, "")
        .toLowerCase();
      parentPermlink = parentPermlink.replace(/(-\d{8}t\d{9}z)/g, "");
      return "re-" + parentAuthor + "-" + parentPermlink + "-" + timeStr;
    },

    amount: function(amount, asset) {
      return amount.toFixed(3) + " " + asset;
    },
    numberWithCommas,
    vestingSteem,
    estimateAccountValue,
    createSuggestedPassword
  };
};
