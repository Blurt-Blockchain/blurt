//// action types
export enum PostsActionTypes {
  UPVOTE,
  UPVOTE_COMMENT,
  SET_POSTS,
  SET_POSTS_TYPE,
  SET_POST_INDEX,
  SET_FETCHED,
  SET_NEED_FETCH,
  CLEAR_POSTS,
  APPEND_POSTS,
  SET_TAG_INDEX,
  SET_TAG_LIST,
  SET_FILTER_INDEX,
  SET_POST_DETAILS,
  SET_TAG_AND_FILTER,
  BOOKMARK_POST,
  RESTEEM_POST,
  FAVORITE_POST,
  COMMENT_POST,
  SET_POST_REF,
  SET_COMMUNITIES,
  SELECT_TAG,
  SELECT_FILTER,
  RETRY_FETCHING,
  APPEND_TAG,
}

// post meta data
export interface MetaData {
  image: string[];
  tags: string[];
  [key: string]: any;
}

// post reference
export interface PostRef {
  author: string;
  permlink: string;
}

// posts types
export enum PostsTypes {
  FEED = 'feed',
  AUTHOR = 'author',
  HASH_TAG = 'hash',
}

// post state to be shown in actionbar, avatar
export interface PostState {
  createdAt: string;
  // stats
  vote_count: number;
  resteem_count: number;
  comment_count: number;
  bookmark_count?: number;
  payout: string;
  voters: any[];
  nsfw?: boolean;
  isPromoted: boolean;

  // post reference
  parent_ref?: PostRef;
  post_ref: PostRef;
  title: string;

  // user's actions related
  voted: boolean;
  bookmarked?: boolean;
  resteemed?: boolean;
  favorite?: boolean;
  commented?: boolean;
  votePercent?: number;

  // author
  avatar: string;
  nickname?: string;
  reputation: number;

  // comments
  isComment: boolean;
}

// complete post data including PostState
export interface PostData {
  // post
  id: number;
  body: string;
  markdownBody: string;
  summary: string;
  image: string;
  url: string;

  // meta
  json_metadata: string;
  metadata: MetaData;

  // children
  depth: number;
  children: number;

  // state
  state: PostState;
}

// comment data, including comments tree
export interface CommentData extends PostData {
  comments: CommentData[];
}

// initial post data
export const INIT_POST_DATA = {
  // id
  id: -1,
  // post
  body: '',
  markdownBody: '',
  summary: '',
  image: '',
  tags: [],
  url: '',

  // meta
  json_metadata: '',
  metadata: {
    image: [],
    tags: [],
  },

  // children
  depth: 0,
  children: 0,

  // stats
  state: {
    createdAt: '',

    vote_count: 0,
    resteem_count: 0,
    comment_count: 0,
    bookmark_count: 0,
    payout: '',
    voters: [],
    nsfw: false,
    isPromoted: false,

    // post reference
    parent_ref: null,
    post_ref: null,
    title: '',

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

// meta posts
export interface MetaPosts {
  posts: PostData[];
  startPostRef: PostRef;
  index: number;
}

// posts state
export interface PostsState {
  // target type: feed, author's blog, tag posts
  feed: MetaPosts;
  author: MetaPosts;
  hash: MetaPosts;

  //// current post
  postsType: PostsTypes;
  // post details ref
  postRef: PostRef;
  // post details
  postDetails: PostData;
  // fetched flag
  fetched: boolean;
  // need to fetch flag
  needToFetch: boolean;
  // fetch retry count;
  retryCount: number;

  //// tag, filter selection
  tagList: any[];
  // tag index
  tagIndex: number;
  // community list
  communityList: any[];
  // filter: trending, created
  filterList: string[];
  // filter index
  filterIndex: number;
}

// initial posts
export const INIT_POSTS_DATA: MetaPosts = {
  posts: [],
  startPostRef: {
    author: null,
    permlink: null,
  },
  index: 0,
};

export interface PostingContent {
  author: string;
  title: string;
  body: string;
  parent_author: string;
  parent_permlink: string;
  json_metadata: string;
  permlink: string;
}

// default filter list
export const INIT_FILTER_LIST = ['trending', 'created', 'hot'];
// initial tag item for friends posts of feed posts
export const INIT_FRIENDS_TAG = ['Friends', '', ''];
// initial tag item for my posts of feed posts
export const INIT_MY_TAG = ['My', '', ''];
// initial tag item for author posts
export const INIT_AUTHOR_TAG = ['Author', '', ''];

//// actions
// fetching posts
interface SetPostsAction {
  type: PostsActionTypes.SET_POSTS;
  payload: {
    postsType: PostsTypes;
    metaposts: MetaPosts;
  };
}
interface SetPostsTypeAction {
  type: PostsActionTypes.SET_POSTS_TYPE;
  payload: PostsTypes;
}
interface SetPostIndexAction {
  type: PostsActionTypes.SET_POST_INDEX;
  payload: {
    postsType: PostsTypes;
    postIndex: number;
  };
}
// set fetched flag
interface SetFetchedAction {
  type: PostsActionTypes.SET_FETCHED;
  payload: boolean;
}
// set need to fetch flat
interface SetNeedToFetchAction {
  type: PostsActionTypes.SET_NEED_FETCH;
  payload: boolean;
}
// clear posts of the given type
interface ClearPostsAction {
  type: PostsActionTypes.CLEAR_POSTS;
  payload: PostsTypes;
}
// append posts
interface AppendPostsAction {
  type: PostsActionTypes.APPEND_POSTS;
  payload: {
    postsType: PostsTypes;
    metaposts: MetaPosts;
  };
}
// set tag list
interface SetTagListAction {
  type: PostsActionTypes.SET_TAG_LIST;
  payload: any[];
}
// append a tag
interface AppendTagAction {
  type: PostsActionTypes.APPEND_TAG;
  payload: {
    tagList: any[];
    tagIndex: number;
    filterIndex: number;
  };
}
// set tag and filter index
interface SetTagAndFilterAction {
  type: PostsActionTypes.SET_TAG_AND_FILTER;
  payload: {
    tagIndex: number;
    filterIndex: number;
  };
}
// set tag index
interface SetTagIndexAction {
  type: PostsActionTypes.SET_TAG_INDEX;
  payload: number;
}
// set filter index
interface SetFilterIndexAction {
  type: PostsActionTypes.SET_FILTER_INDEX;
  payload: number;
}
// set post details
interface SetPostDetailsAction {
  type: PostsActionTypes.SET_POST_DETAILS;
  payload: PostData;
}
// voting
interface UpVoteAction {
  type: PostsActionTypes.UPVOTE;
  payload: {
    postsType: PostsTypes;
    postIndex: number;
    postState: PostState;
  };
}
// voting comment
interface UpVoteCommentAction {
  type: PostsActionTypes.UPVOTE_COMMENT;
  payload: {
    postIndex: number;
    comments: CommentData[];
  };
}
// commenting
interface CommentAction {
  type: PostsActionTypes.COMMENT_POST;
  payload: {
    postIndex: number;
    username: string;
  };
}

// bookmarking
interface BookmarkAction {
  type: PostsActionTypes.BOOKMARK_POST;
  payload: boolean;
}
// set post details erf
interface SetPostRefAction {
  type: PostsActionTypes.SET_POST_REF;
  payload: PostRef;
}
// set communities
interface SetCommunitiesAction {
  type: PostsActionTypes.SET_COMMUNITIES;
  payload: any[];
}
// retry fetching
interface RetryFetchingAction {
  type: PostsActionTypes.RETRY_FETCHING;
}
// posts context type
export interface PostsContextType {
  // posts state
  postsState: PostsState;
  //// action creators
  // fetch posts
  fetchPosts: (
    postsType: PostsTypes,
    tagIndex: number,
    filterIndex: number,
    username?: string,
    noFollowings?: boolean,
    appending?: boolean,
    author?: string,
  ) => Promise<{fetchedPosts: PostData[]; fetchedAll: boolean}>;
  // set posts type
  setPostsType: (postsType: PostsTypes) => void;
  // clear posts
  clearPosts: (postsType: PostsTypes) => void;
  // get post details
  getPostDetails: (postRef: PostRef, username: string) => Promise<PostData>;
  // set post details
  setPostDetails: (post: PostData) => void;
  // upvote
  upvote: (
    postsType: PostsTypes,
    postIndex: number,
    isComment: boolean,
    postRef: PostRef,
    username: string,
    password: string,
    votingWeight: number,
    voteAmount: number,
  ) => Promise<any>;
  // submit post
  submitPost: (
    postingContent: PostingContent,
    password: string,
    isComment: boolean,
    options?: any[],
    postIndex?: number,
  ) => Promise<any>;
  // update post
  updatePost: (
    originalBody: string,
    originalPermlink: string,
    originalParentPermlink: string,
    postingContent: PostingContent,
    password: string,
    isComment: boolean,
    postIndex?: number,
  ) => Promise<any>;
  // bookmark
  bookmarkPost: (postRef: PostRef, username: string, title: string) => void;
  // fetch database state
  fetchDatabaseState: (
    postRef: PostRef,
    username: string,
  ) => Promise<{bookmarked: boolean}>;
  // fetch all bookmarks
  fetchBookmarks: (username: string) => Promise<any[]>;
  // update favorite author
  updateFavoriteAuthor: (
    author: string,
    username: string,
    remove: boolean,
  ) => Promise<boolean>;
  // fetch all favorite authurs
  fetchFavorites: (username: string) => Promise<any[]>;
  // check if the author is in the favorites
  isFavoriteAuthor: (username: string, author: string) => Promise<boolean>;
  // set post ref
  setPostRef: (postRef: PostRef) => void;
  // set post index
  setPostIndex: (postsType: PostsTypes, postIndex: number) => void;
  // set tag and filter index
  setTagAndFilter: (
    tagIndex: number,
    filterIndex: number,
    postsType: PostsTypes,
    username?: string,
  ) => void;
  // fetch tag list
  getTagList: (username?: string) => void;
  // set communities
  //  fetchCommunities: (username: string) => void;
  // set tag index
  setTagIndex: (
    index: number,
    postsType: PostsTypes,
    username?: string,
  ) => void;
  // set filter index
  setFilterIndex: (index: number, username?: string) => void;
  // append a tag
  appendTag: (tag: string) => void;
  // set need to fetch flag
  setNeedToFetch: (needing: boolean) => void;
  // flag a post or a comment
  flagPost: (url: string, reporter: string) => void;
}

export type PostsAction =
  | SetPostsAction
  | SetPostsTypeAction
  | SetPostIndexAction
  | SetFetchedAction
  | SetNeedToFetchAction
  | SetPostRefAction
  | ClearPostsAction
  | AppendPostsAction
  | SetPostDetailsAction
  | UpVoteAction
  | UpVoteCommentAction
  | CommentAction
  | BookmarkAction
  | SetCommunitiesAction
  | SetTagAndFilterAction
  | SetTagIndexAction
  | SetTagListAction
  | SetFilterIndexAction
  | RetryFetchingAction
  | AppendTagAction;

/*
  export interface PostsQuery {
  sort: string;
  tag: string;
  observer?: string;
  limit: number;
  start_permlink: string;
  start_author: string;
  truncate_body?: number;
  filterNsfw?: boolean;
}

*/
