export type GroupSummary = {
  id: string;
  name: string;
  currencyCode: string;
  isArchived: boolean;
  myNetCents: number;
  role: "OWNER" | "MEMBER";
};

export type GroupMemberView = {
  id: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  status: "ACTIVE" | "INVITED";
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
};

export type GroupDetail = {
  id: string;
  name: string;
  currencyCode: string;
  isArchived: boolean;
  inviteCode: string;
  members: GroupMemberView[];
};

export type BalanceItem = {
  memberId: string;
  netCents: number;
  member?: {
    memberId: string;
    userId: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
};

export type SuggestedSettlement = {
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
  fromMember?: BalanceItem["member"];
  toMember?: BalanceItem["member"];
};

export type ExpenseFeedItem = {
  id: string;
  title: string;
  notes: string | null;
  amountCents: number;
  currencyCode: string;
  splitType: "EVEN" | "CUSTOM" | "PERCENTAGE" | "SHARES";
  spentAt: string;
  paidByMember: {
    id: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  participants: Array<{
    id: string;
    amountCents: number;
    percentageBps: number | null;
    shareUnits: number | null;
    member: {
      id: string;
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    };
  }>;
};

export type SettlementFeedItem = {
  id: string;
  amountCents: number;
  note: string | null;
  paidAt: string;
  fromMember: {
    id: string;
    user: {
      name: string | null;
      email: string;
    };
  };
  toMember: {
    id: string;
    user: {
      name: string | null;
      email: string;
    };
  };
};
