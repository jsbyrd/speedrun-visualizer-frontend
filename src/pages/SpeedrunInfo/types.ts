export type Game = {
  id: string;
  names: {
    international: string;
  };
  weblink: string;
  discord?: string;
  assets: {
    "cover-medium": {
      uri: string;
    };
  };
  categories: {
    data: Category[];
  };
  variables: {
    data: Variable[];
  };
  platforms: {
    data: Platform[];
  };
  publishers: {
    data: Publisher[];
  };
};

export type Category = {
  id: string;
  name: string;
  type: string;
};

export type Variable = {
  id: string;
  name: string;
  values: {
    values: VariableValues;
  };
  scope: {
    type: string;
  };
  category: string;
  mandatory: boolean;
};

export type VariableValues = {
  [key: string]: {
    label: string;
    id: string;
    rules: string;
  };
};

export type Platform = {
  id: string;
  name: string;
};

export type Publisher = {
  id: string;
  name: string;
};

export type Run = {
  place: number;
  run: RunDetails;
};

export type RunDetails = {
  id: string;
  times: {
    primary_t: number;
  };
  date: string;
  data: Player[];
  players: Player[];
  videos: {
    links: VideoLink[];
  };
};

export type RunData = {
  id: string;
  times: {
    primary_t: number;
  };
  date: string;
  data: Player[];
  players: {
    data: Player[];
  };
  values: Record<string, string>;
  videos: {
    links: VideoLink[];
  };
};

export type Player = {
  id: string;
  name: string;
  names: {
    international: string;
    japanese: string;
  };
  rel: string;
};

export type VideoLink = {
  uri: string;
};

export type Leaderboard = {
  runs: Run[];
  players: {
    data: Player[];
  };
};
