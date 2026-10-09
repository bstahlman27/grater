export type FriendProfile = {
  id: string;
  username: string;
  displayName: string;
};

export type FriendRequestSummary = {
  id: string;
  profile: FriendProfile;
  updatedAt: string;
};

export type FriendsPageData = {
  currentProfile: FriendProfile | null;
  friends: FriendRequestSummary[];
  incomingRequests: FriendRequestSummary[];
  outgoingRequests: FriendRequestSummary[];
};
