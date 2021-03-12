export interface ActionBarStyle {
  styles: {
    alignItems: string;
    alignSelf?: string;
    marginVertical?: number;
  };
  textSize: number;
  iconSize: number;
  reply?: boolean;
  edit?: boolean;
  share?: boolean;
  bookmark?: boolean;
  resteem?: boolean;
  translation?: boolean;
  read?: boolean;
}

export const ActionBarStyleFeed: ActionBarStyle = {
  textSize: 16,
  iconSize: 20,
  styles: {
    alignItems: 'flex-start',
  },
  reply: false,
  edit: false,
};

export const ActionBarStyleProfile: ActionBarStyle = {
  textSize: 14,
  iconSize: 16,
  styles: {
    alignItems: 'flex-start',
  },
  reply: false,
  edit: false,
};

export const ActionBarStylePost: ActionBarStyle = {
  textSize: 14,
  iconSize: 16,
  styles: {
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  reply: false,
  edit: false,
  bookmark: true,
  resteem: true,
  share: true,
  translation: true,
  read: true,
};

export const ActionBarStyleComment: ActionBarStyle = {
  textSize: 14,
  iconSize: 14,
  styles: {
    alignItems: 'flex-start',
  },
  reply: true,
  edit: false,
  translation: true,
  read: true,
};

export const ActionBarStyleCommentEdit: ActionBarStyle = {
  ...ActionBarStyleComment,
  edit: true,
};
