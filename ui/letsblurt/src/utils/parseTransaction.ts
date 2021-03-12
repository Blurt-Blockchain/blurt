export const parseBlurtTransaction = (transaction) => {
  if (!transaction) {
    return [];
  }

  const result = {
    value: '0',
    icon: 'local-activity',
    iconType: 'MaterialIcons',
    details: '',
    textKey: '',
    created: '',
    memo: '',
  };

  [result.textKey] = transaction[1].op;
  const opData = transaction[1].op[1];
  const {timestamp} = transaction[1];

  result.created = timestamp;

  //TODO: Format other wallet related operations

  switch (result.textKey) {
    case 'curation_reward':
      const {reward} = opData;
      const {
        comment_author: commentAuthor,
        comment_permlink: commentPermlink,
      } = opData;
      result.iconType = 'font-awesome-5';
      result.icon = 'hand-holding-heart';
      result.value = reward;
      result.details = commentAuthor
        ? `@${commentAuthor}/${commentPermlink}`
        : null;
      break;
    case 'author_reward':
    case 'comment_benefactor_reward':
      result.iconType = 'font-awesome';
      result.icon = 'smile-o';
      result.value = opData.vesting_payout;
      break;
    case 'claim_reward_balance':
      let {reward_blurt, reward_vests} = opData;
      result.value = reward_vests;
      break;
    case 'transfer':
    case 'transfer_to_savings':
    case 'transfer_from_savings':
    case 'transfer_to_vesting':
      const {amount, memo, from, to} = opData;

      result.value = `${amount}`;
      result.iconType = 'font-awesome';
      result.icon = 'exchange';
      result.details = from && to ? `@${from} to @${to}` : null;
      result.memo = memo || null;
      break;
    case 'withdraw_vesting':
      break;
    case 'fill_order':
      const {current_pays: currentPays, open_pays: openPays} = opData;

      result.value = `${currentPays} = ${openPays}`;
      result.icon = 'reorder';
      break;
    case 'escrow_transfer':
    case 'escrow_dispute':
    case 'escrow_release':
    case 'escrow_approve':
      const {agent, escrow_id} = opData;
      let {from: frome} = opData;
      let {to: toe} = opData;

      result.value = `${escrow_id}`;
      result.icon = 'wb-iridescent';
      result.details = frome && toe ? `@${frome} to @${toe}` : null;
      result.memo = agent || null;
      break;
    case 'delegate_vesting_shares':
      const {delegator, delegatee, vesting_shares} = opData;

      result.value = `${vesting_shares}`;
      result.icon = 'change-history';
      result.details =
        delegatee && delegator ? `@${delegator} to @${delegatee}` : null;
      break;
    case 'cancel_transfer_from_savings':
      let {from: from_who, request_id: requestId} = opData;

      result.value = `${0}`;
      result.icon = 'cancel';
      result.details = from_who ? `from @${from_who}, id: ${requestId}` : null;
      break;
    case 'fill_convert_request':
      let {owner: who, requestid: requestedId, amount_out: amount_out} = opData;

      result.value = `${amount_out}`;
      result.icon = 'hourglass-full';
      result.details = who ? `@${who}, id: ${requestedId}` : null;
      break;
    case 'fill_transfer_from_savings':
      let {
        from: fillwho,
        to: fillto,
        amount: fillamount,
        request_id: fillrequestId,
      } = opData;

      result.value = `${fillamount}`;
      result.icon = 'hourglass-full';
      result.details = fillwho
        ? `@${fillwho} to @${fillto}, id: ${fillrequestId}`
        : null;
      break;
    case 'fill_vesting_withdraw':
      let {
        from_account: pd_who,
        to_account: pd_to,
        deposited: deposited,
      } = opData;

      result.value = `${deposited}`;
      result.icon = 'hourglass-full';
      result.details = pd_who ? `@${pd_who} to ${pd_to}` : null;
      break;
    default:
      return [];
  }
  return result;
};
