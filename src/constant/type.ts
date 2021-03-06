export type PlaylistItem = {
  description: string | null;
  id: number;
  name: string;
  playCount: number;
  subscribedCount: number;
  trackCount: number;
  userId: number;
};

export interface RawPlaylistItem extends PlaylistItem {
  bookCount?: number;
  copywriter?: string;
  creator?: { userId: number };
}

export type Artist = {
  name: string;
  id: number;
  alias: string[];
  briefDesc: string;
  albumSize: number;
  musicSize: number;
};

export type SongsItem = {
  name: string;
  id: number;
  dt: number;
  alia: string[];
  ar: {
    id: number;
    name: string;
  }[];
  al: {
    id: number;
    name: string;
  };
};

export type AnotherSongItem = {
  name: string;
  id: number;
  duration: number;
  alias: string[];
  artists: {
    id: number;
    name: string;
  }[];
  album: {
    id: number;
    name: string;
  };
};

export type AlbumsItem = {
  artists: Artist[];
  alias: string[];
  company: string;
  description: string;
  name: string;
  id: number;
};

export type SongDetail = {
  id: number;
  url: string;
  md5: string;
};

export type TrackIdsItem = {
  id: number;
  v: number;
  at: number;
};

export type LruCacheValue = {
  integrity: string;
  size: number;
};

export type Lyric = {
  index: number;
  delay: number;
  time: number[];
  text: string[];
};

export type LyricData = {
  time: number[];
  text: string[];
};

export type NativePlayer = {
  new <T>(): T;
  load(url: string): boolean;
  play(): boolean;
  pause(): void;
  stop(): void;
  setVolume(level: number): void;
  empty(): boolean;
  position(): number;
};

export interface Player {
  item: SongsItem;
  pid: number;
  time: number;
  level: number;
  stop(): void;
  load(url: string, pid: number, item: SongsItem): void;
  togglePlay(): void;
  volume(level: number): void;
}

export interface NativeModule {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Rodio: NativePlayer;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Miniaudio: NativePlayer;
  startKeyboardEvent(callback: (res: string) => void): void;
  download(
    url: string,
    path: string,
    callback: (err: string, res: boolean) => void
  ): void;
}
