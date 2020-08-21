import { workspace } from "vscode";

const conf = workspace.getConfiguration("cloudmusic");

export const MEDIA_CONTROL = conf.get("player.mediaControl") as boolean;

const defaultLibrary = conf.get("player.defaultLibrary") as string;
const librarys = ["Rodio", "Miniaudio"].filter((i) => i !== defaultLibrary);
librarys.unshift(defaultLibrary);
export const LIBRARYS = librarys;

export const AUTO_CHECK = conf.get("account.autoCheck") as boolean;

export const PROXY: string | undefined = conf.get("music.proxy") ?? undefined;
export const REAL_IP: string | undefined =
  conf.get("music.realIP") ?? undefined;

export const MUSIC_QUALITY = conf.get("music.quality") as number;

export const LOCAL_FILE_DIR: string | undefined =
  conf.get("cache.localDirectory.path") ?? undefined;

export const MUSIC_CACHE_SIZE =
  (conf.get("cache.size") as number) * 1024 * 1024;
