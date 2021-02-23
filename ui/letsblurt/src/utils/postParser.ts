import {Platform} from 'react-native';
import {get, has} from 'lodash';
import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import {getActiveVotes, calculateReputation} from '~/providers/blurt/dblurtApi';
import {Discussion} from 'dblurt';
import {renderPostBody, postBodySummary} from './render-helpers';
import {getResizedAvatar, getResizedImage} from './image';
import {BLURT_IMAGE_SERVERS} from '~/constants';
import {PostState, PostData, CommentData, MetaData} from '~/contexts/types';

const POST_SUMMARY_LENGTH = 80;
const webp = Platform.OS === 'ios' ? false : true;
let IMAGE_SERVER = BLURT_IMAGE_SERVERS[0];

export const parsePosts = async (
  posts: Discussion[],
  username: string,
  imageServer?: string,
) => {
  // set image server
  if (imageServer) {
    IMAGE_SERVER = imageServer;
  }
  if (posts) {
    const promises = posts.map((post) =>
      parsePost(post, username, IMAGE_SERVER),
    );
    const formattedPosts = await Promise.all(promises);
    return formattedPosts;
  }
  return null;
};

export const parsePost = async (
  post: Discussion,
  username: string,
  imageServer: string,
  promoted: boolean = false,
): Promise<PostData | null> => {
  if (!post) {
    return null;
  }

  // create a post data object
  const postData: PostData = {
    // post
    id: post.id,
    body: post.body,
    markdownBody: '',
    summary: '',
    image: '',
    url: post.url,

    // meta
    json_metadata: '',
    metadata: {
      image: [],
      tags: [],
    },

    // children
    depth: post.depth,
    children: post.children,

    state: {
      createdAt: post.created,
      // stats
      vote_count: 0,
      resteem_count: 0,
      comment_count: 0,
      bookmark_count: 0,
      payout: '',
      voters: [],
      nsfw: false,
      isPromoted: false,

      // post reference
      parent_ref: {
        author: post.parent_author,
        permlink: post.parent_permlink,
      },
      post_ref: {
        author: post.author,
        permlink: post.permlink,
      },
      title: post.title,

      // user's actions related
      voted: false,
      bookmarked: false,
      resteemed: false,
      favorite: false,
      commented: false,
      votePercent: 0,

      // author
      avatar: '',
      nickname: '',
      reputation: 25,
      // comments
      isComment: false,
    },
  };

  // get account nickname
  //  const profile = await fetchProfile(postData.state.post_ref.author);
  try {
    postData.metadata = JSON.parse(post.json_metadata);
  } catch (error) {
    postData.json_metadata = '{}';
  }

  const profile = {
    post_count: post.post_count,
    metadata: {
      profile: postData.metadata.about,
    },
    name: postData.metadata.name,
    reputation: 0,
  };

  postData.state.nickname = get(profile, 'name');
  // get active voters
  const activeVotes = await getActiveVotes(
    postData.state.post_ref.author,
    postData.state.post_ref.permlink,
  );
  // store markdown body to edit later for the user
  //  if (username === postData.state.post_ref.author) {
  postData.markdownBody = post.body;
  //  }
  postData.state.isPromoted = promoted;
  // thumbnail image
  postData.image = postImage(postData.metadata, post.body);
  postData.state.voters = activeVotes;
  postData.state.voters!.sort((a, b) => b.rshares - a.rshares);

  postData.state.vote_count = activeVotes.length;
  postData.state.reputation = get(profile, 'reputation');

  postData.state.avatar = getResizedAvatar(post.author, imageServer);
  postData.state.voters!.sort((a, b) => b.rshares - a.rshares);
  postData.body = renderPostBody(post.body, true);
  postData.summary = postBodySummary(post, POST_SUMMARY_LENGTH);
  //  extPost.is_declined_payout = Number(parseFloat(post.max_accepted_payout)) === 0;

  if (username && postData.state.voters) {
    postData.state.voted = isVoted(postData.state.voters, username);
    //    post.is_down_voted = isDownVoted(post.active_votes, username);
  } else {
    postData.state.voted = false;
    //    post.is_down_voted = false;
  }

  postData.state.voters = parseActiveVotes(post, username, postData);

  postData.state.comment_count = post.children;
  // TODO: implement this
  //  postState.reblogs = await getPostReblogs(post);
  // if (extPost.reblogs) extPost.reblogCount = extPost.reblogs.length;

  // TODO: fetch bookmarks, favorite from firebase, and then update postState

  return postData;
};

const isVoted = (activeVotes: any[], username: string) => {
  const result = activeVotes.find(
    (element) => element.voter === username && element.percent > 0,
  );
  if (result) {
    return true;
  }
  return false;
};

const parseActiveVotes = (
  post: Discussion,
  username: string,
  postData: PostData,
) => {
  const totalPayout =
    parseFloat(post.pending_payout_value as string) +
    parseFloat(post.total_payout_value as string) +
    parseFloat(post.curator_payout_value as string);

  postData.state.payout = totalPayout.toFixed(2);

  const voteRshares = postData.state.voters.reduce(
    (a, b) => a + parseFloat(b.rshares),
    0,
  );
  const ratio = totalPayout / voteRshares || 0;

  if (!isEmpty(postData.state.voters)) {
    forEach(postData.state.voters, (value, index) => {
      postData.state.votePercent =
        value.voter === username ? value.percent : null;
      value.value = (value.rshares * ratio).toFixed(2);
      value.reputation = calculateReputation(value.reputation);
      value.percent /= 100;
      value.is_down_vote = Math.sign(value.percent) < 0;
      value.avatar = getResizedAvatar(value.voter, IMAGE_SERVER);
      postData.state.voters[index] = `${value.voter} (${value.value})`;
    });
  }

  return postData.state.voters;
};

////
const postImage = (metaData: MetaData, body: string) => {
  const imgTagRegex = /(<img[^>]*>)/g;
  const markdownImageRegex = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g;
  // eslint-disable-next-line max-len
  const urlRegex = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gm;
  const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
  let imageLink;
  try {
    if (metaData && metaData.image && metaData.image[0]) {
      [imageLink] = metaData.image;
    } else if (!imageLink && body && markdownImageRegex.test(body)) {
      const markdownMatch = body.match(markdownImageRegex);
      if (markdownMatch[0]) {
        const firstMarkdownMatch = markdownMatch[0];
        [imageLink] = firstMarkdownMatch.match(urlRegex);
      }
    }

    if (!imageLink && imageRegex.test(body)) {
      const imageMatch = body.match(imageRegex);
      [imageLink] = imageMatch;
    }

    if (!imageLink && imgTagRegex.test(body)) {
      const _imgTag = body.match(imgTagRegex);
      const match = _imgTag[0].match(urlRegex);

      if (match && match[0]) {
        [imageLink] = match;
      }
    }
  } catch (error) {
    console.log('[postImage] failed to get image link', error);
    return '';
  }
  if (imageLink) {
    return getResizedImage(imageLink, 600);
  }
  return '';
};

export const filterNSFWPosts = (posts: PostData[]) => {
  const updatedPosts: PostData[] = [];
  if (posts) {
    posts.map((post) => {
      if (
        post.state.parent_ref.permlink !== 'nsfw' &&
        !post.metadata.tags.includes('nsfw')
      ) {
        updatedPosts.push(post);
        post.state.nsfw = true;
      }
    });
    return updatedPosts;
  }
};

export const parseComment = async (comment: Discussion, username: string) => {
  // create a post state object
  const commentData: CommentData = {
    // comment
    id: comment.id,
    body: comment.body,
    markdownBody: '',
    summary: '',
    image: '',
    url: comment.url,
    // comment
    comments: [],
    // children
    depth: comment.depth,
    children: comment.children,

    // meta
    json_metadata: '',
    metadata: {
      image: [],
      tags: [],
    },

    // stats
    state: {
      createdAt: comment.created,
      vote_count: 0,
      resteem_count: 0,
      comment_count: 0,
      bookmark_count: 0,
      payout: '',
      voters: [],
      nsfw: false,
      isPromoted: false,

      // post reference
      parent_ref: {
        author: comment.parent_author,
        permlink: comment.parent_permlink,
      },
      post_ref: {
        author: comment.author,
        permlink: comment.permlink,
      },
      title: comment.title,

      // user's actions related
      voted: false,
      bookmarked: false,
      resteemed: false,
      favorite: false,
      commented: false,
      votePercent: 0,

      // author
      avatar: '',
      nickname: '',
      reputation: 25,
      // comments
      isComment: true,
    },
  };

  try {
    commentData.metadata = JSON.parse(comment.json_metadata);
  } catch (error) {
    commentData.json_metadata = '{}';
  }

  const profile = {
    post_count: comment.post_count,
    metadata: {
      profile: commentData.metadata.about,
    },
    name: commentData.metadata.name,
    reputation: 0,
  };

  //  const profile = await fetchProfile(commentData.state.post_ref.author);
  commentData.state.nickname = get(profile, 'metadata.profile.name');

  const activeVotes = await getActiveVotes(comment.author, comment.permlink);
  commentData.state.voters = activeVotes;
  commentData.state.voters!.sort((a, b) => b.rshares - a.rshares);

  // extComment.pending_payout_value = parseFloat(
  //   comment.pending_payout_value as string,
  // ).toFixed(2);

  commentData.state.reputation = get(profile, 'reputation');
  //  extComment.postUserState.reputation = calculateReputation(
  //    comment.author_reputation,
  //  );
  commentData.state.avatar = getResizedAvatar(
    get(comment, 'author'),
    IMAGE_SERVER,
  );
  commentData.state.voters!.sort((a, b) => b.rshares - a.rshares);
  commentData.markdownBody = get(comment, 'body');
  commentData.body = renderPostBody(comment.body, true, webp);
  commentData.state.voters = activeVotes;
  commentData.state.vote_count = activeVotes && activeVotes.length;

  if (username && commentData.state.voters) {
    commentData.state.voted = isVoted(commentData.state.voters, username);
  } else {
    commentData.state.voted = false;
  }

  commentData.state.voters = parseActiveVotes(comment, username, commentData);

  commentData.state.comment_count = comment.children;

  return commentData;
};
