export type TTabTime = {
  time_second: number;
};

export type TTabTimingRandom = {
  max_second?: number;
  min_second?: number;
};
export type TTabInfo = {
  hostname: string;
  full_url: string;
  path_name: string;
  isDisbale: boolean;
};

export type TTab = {
  tabId: string | number;
  tab_info?: TTabInfo;
  time: TTabTime;
  random: TTabTimingRandom | boolean | undefined;
};
