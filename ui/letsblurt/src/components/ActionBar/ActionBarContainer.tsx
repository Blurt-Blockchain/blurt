//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {Share} from 'react-native';
//// config
//// language
import {useIntl} from 'react-intl';
import {navigate} from '~/navigation/service';
import {PostState, PostsTypes} from '~/contexts/types';
import {AuthContext, PostsContext, UserContext, UIContext} from '~/contexts';
import {ActionBarView} from './ActionBarView';
import {ActionBarStyle} from '~/constants/actionBarTypes';
import {reblog} from '~/providers/blurt/dblurtApi';
import {BLURT_BASE_URL} from '~/constants';
interface Props {
  actionBarStyle: ActionBarStyle;
  postState: PostState;
  postUrl?: string;
  postsType: PostsTypes;
  postIndex: number;
  ttsText?: string;
  handlePressComments?: () => void;
  handlePressEditComment?: () => void;
  handlePressReply?: () => void;
  handlePressTranslation?: (showOriginal: boolean) => void;
}

const ActionBarContainer = (props: Props): JSX.Element => {
  //// props
  const {actionBarStyle, postUrl, postsType, postIndex, ttsText} = props;
  //// language
  const intl = useIntl();
  //// contexts
  const {upvote, bookmarkPost} = useContext(PostsContext);
  const {authState} = useContext(AuthContext);
  const {userState} = useContext(UserContext);
  const {uiState, setToastMessage, setAuthorParam, setEditMode} = useContext(
    UIContext,
  );
  //// states
  const [postState, setPostState] = useState<PostState>(props.postState);
  const [voting, setVoting] = useState(false);
  const [votingWeight, setVotingWeight] = useState(100);
  const [votingDollar, setVotingDollar] = useState<string>(postState.payout);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showTTSModal, setShowTTSModal] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);
  //// events

  // // event: post state changes
  // useEffect(() => {
  //   // only for post
  //   if (!postState.isComment) {
  //     // update voted flag
  //     const _state = {...postState, voted: }
  //     setVoted(postState.voted);
  //     // update payout
  //     setVotingDollar(postState.payout);
  //   }
  // }, [postState]);

  //// handle press vote icon of action bar
  const _handlePressVoteIcon = () => {
    console.log('user state', userState);
    // get vote amount of ther user
    const voteAmount = parseFloat(userState.profileData.profile.voteAmount);
    console.log('[Action] _onPressVoteIcon');
    // set vote amount to string state which is a string
    setVotingDollar(voteAmount.toFixed(2));
    if (!authState.loggedIn) {
      console.log('You need to login to vote');
      setToastMessage(intl.formatMessage({id: 'Actionbar.vote_wo_login'}));
      return;
    }
    console.log('[_onPressVoteIcon] voted', postState.voted);
    // check if the user votes before
    if (postState.voted) {
      console.log('You already voted on this post');
      setToastMessage(intl.formatMessage({id: 'Actionbar.vote_again'}));
      return;
    }
    console.log('vote amount', voteAmount);
    // show voting modal
    setShowVotingModal(true);
  };

  //// handle press the vote button in the voting modal
  const _handlePressVote = async () => {
    // check sanity
    if (!authState.loggedIn) return;
    // get credentials
    const {username, password} = authState.currentCredentials;
    // set loading
    setVoting(true);
    // hide voting modal
    setShowVotingModal(false);
    // submit upvote transaction
    const results = await upvote(
      postsType,
      postIndex,
      postState.isComment,
      postState.post_ref,
      username,
      password,
      votingWeight,
      parseFloat(userState.profileData.profile.voteAmount),
    );
    console.log('[ActionBarContainer|_processVoting] results', results);
    if (results) {
      // show toast
      setToastMessage(intl.formatMessage({id: 'Actionbar.voted'}));
      //// update voting related states
      // get vote amount of ther user
      const voteAmount = parseFloat(userState.profileData.profile.voteAmount);
      // new payout estimate
      const _payout = (
        parseFloat(postState.payout) +
        (voteAmount * votingWeight) / 100
      ).toFixed(2);
      // append the user to ther voters
      const _voters = [`${username} (${voteAmount})`, ...postState.voters];
      // update states
      const _state = {
        ...postState,
        voted: true,
        payout: _payout,
        voters: _voters,
      };
      setPostState(_state);
    }
    // cancel loading
    setVoting(false);
  };

  //// handle press a voter
  const _handlePressVoter = (voter: string) => {
    // set author param in the UIContext
    setAuthorParam(voter);
    // if the author is the user, then navigate to the profile, otherwise, navigate to the author profile
    if (authState.currentCredentials.username === voter) {
      navigate({name: 'Profile'});
    } else {
      navigate({name: 'AuthorProfile'});
    }
  };

  //// handle press edit button
  const _handlePressEditPost = () => {
    // set edit mode in the UIContext
    setEditMode(true);
    // navigate to the posting
    navigate({name: 'Posting'});
  };

  //// handle press bookmark
  const _handlePressBookmark = () => {
    // check sanity: logged in
    if (!authState.loggedIn) return;
    // create or append collection in firebase
    bookmarkPost(
      postState.post_ref,
      authState.currentCredentials.username,
      postState.title,
    );
    // update the post state
    const _state = {...postState, bookmarked: true};
    setPostState(_state);
  };

  //// handle press a reblog button
  const _handlePressReblog = async () => {
    // check sanity
    if (!authState.loggedIn) return;
    const {username, password} = authState.currentCredentials;
    const {author, permlink} = postState.post_ref;
    const {chainProps} = userState.globalProps;
    const op_fee = parseFloat(chainProps.operation_flat_fee.split(' ')[0]);
    const bw_fee = parseFloat(chainProps.bandwidth_kbytes_fee.split(' ')[0]);
    // submit reblog transaction
    const result = await reblog(
      username,
      password,
      author,
      permlink,
      op_fee,
      bw_fee,
    );
    // handle the result
    if (result) {
      setToastMessage(intl.formatMessage({id: 'Actionbar.reblogged'}));
    }
  };

  //// handle press the translation button
  const _handlePressTranslation = () => {
    const _showOriginal = !showOriginal;
    setShowOriginal(showOriginal);
    // call the given function
    props.handlePressTranslation(_showOriginal);
  };

  //// handle press the share button
  const _handlePressShare = () => {
    // open sharing ui
    const message = `${BLURT_BASE_URL}${postUrl}`;
    console.log('_handlePressShare. message', message);
    Share.share({
      title: intl.formatMessage({id: 'title'}),
      message: message,
    });
  };

  //// handle slide completion event
  const _handleVotingSlidingComplete = (weight: number) => {
    // get vote amount of ther user
    const voteAmount = parseFloat(userState.profileData.profile.voteAmount);
    const price = (voteAmount * weight) / 100;
    setVotingDollar(price.toFixed(2));
    setVotingWeight(weight);
  };

  //// handle cancel voting modal
  const handleCancelVotingModal = () => {
    setShowVotingModal(false);
  };

  //// handle press speak
  const _handlePressSpeakIcon = () => {
    // show modal
    setShowTTSModal(!showTTSModal);
  };

  return (
    <ActionBarView
      actionBarStyle={actionBarStyle}
      postState={postState}
      postIndex={postIndex}
      username={authState.currentCredentials.username}
      isUser={
        authState.currentCredentials.username === postState.post_ref.author
      }
      showVotingModal={showVotingModal}
      showTTSModal={showTTSModal}
      ttsText={ttsText}
      voting={voting}
      votingDollar={votingDollar}
      votingWeight={votingWeight}
      voteAmount={parseFloat(userState.profileData.profile.voteAmount)}
      showOriginal={showOriginal}
      handleCancelVotingModal={handleCancelVotingModal}
      handlePressVoteIcon={_handlePressVoteIcon}
      handleVotingSlidingComplete={_handleVotingSlidingComplete}
      handlePressVoting={_handlePressVote}
      handlePressEditPost={_handlePressEditPost}
      handlePressReply={props.handlePressReply}
      handlePressComments={props.handlePressComments}
      handlePressEditComment={props.handlePressEditComment}
      handlePressVoter={_handlePressVoter}
      handlePressBookmark={_handlePressBookmark}
      handlePressReblog={_handlePressReblog}
      handlePressTranslation={_handlePressTranslation}
      handlePressShare={_handlePressShare}
      handlePressSpeakIcon={_handlePressSpeakIcon}
    />
  );
};

export {ActionBarContainer};
