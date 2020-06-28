import {
  Event,
  EventEmitter,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
} from "vscode";
import { join } from "path";
import { QueueProvider, QueueTreeItem } from "./queueProvider";
import { PlaylistContent, PlaylistItem } from "../constant/type";
import { AccountManager } from "../api/accountManager";
import { PlaylistManager } from "../api/playlistManager";

export class PlaylistProvider
  implements TreeDataProvider<PlaylistItemTreeItem | PlaylistContentTreeItem> {
  private _onDidChangeTreeData: EventEmitter<
    PlaylistItemTreeItem | PlaylistContentTreeItem | undefined | void
  > = new EventEmitter<
    PlaylistItemTreeItem | PlaylistContentTreeItem | undefined | void
  >();

  readonly onDidChangeTreeData: Event<
    PlaylistItemTreeItem | PlaylistContentTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  private accountManager: AccountManager = AccountManager.getInstance();
  private playlistManager: PlaylistManager = PlaylistManager.getInstance();
  private queueProvider: QueueProvider = QueueProvider.getInstance();

  private treeView: Map<number, PlaylistContentTreeItem[]> = new Map<
    number,
    PlaylistContentTreeItem[]
  >();

  constructor() {}

  refresh(element?: PlaylistItemTreeItem): void {
    if (element) {
      this._onDidChangeTreeData.fire(element);
    } else {
      this._onDidChangeTreeData.fire();
    }
  }

  getTreeItem(
    element: PlaylistItemTreeItem | PlaylistContentTreeItem
  ): TreeItem {
    return element;
  }

  async getChildren(
    element?: PlaylistItemTreeItem | PlaylistContentTreeItem
  ): Promise<PlaylistItemTreeItem[] | PlaylistContentTreeItem[]> {
    return element
      ? await this.getPlaylistContent(element.item.id)
      : await this.getPlaylistItem();
  }

  async playPlaylist(id: number, index?: PlaylistContentTreeItem) {
    this.queueProvider.clear();
    const items = this.treeView.get(id);
    if (items) {
      this.queueProvider.add(items);
    } else {
      this.queueProvider.add(await this.getPlaylistContent(id));
    }
    if (index) {
      this.queueProvider.shift(index.toQueueTreeItem());
    }
    this.queueProvider.refresh();
  }

  async addPlaylist(id: number) {
    const items = this.treeView.get(id);
    if (items) {
      this.queueProvider.add(items);
    } else {
      this.queueProvider.add(await this.getPlaylistContent(id));
    }
    this.queueProvider.refresh();
  }

  private async getPlaylistContent(
    id: number
  ): Promise<PlaylistContentTreeItem[]> {
    const songs = await this.playlistManager.tracks(id);
    const ret = songs.map((song) => {
      return new PlaylistContentTreeItem(
        `${song.name}${song.alia ? ` (${song.alia})` : ""}`,
        song,
        id,
        TreeItemCollapsibleState.None
      );
    });
    this.treeView.set(id, ret);
    return ret;
  }

  private async getPlaylistItem(): Promise<PlaylistItemTreeItem[]> {
    const playlists = await this.accountManager.playlist();
    return playlists.map((playlist) => {
      return new PlaylistItemTreeItem(
        playlist.name,
        playlist,
        TreeItemCollapsibleState.Collapsed
      );
    });
  }

  addSong(element: PlaylistContentTreeItem) {
    this.queueProvider.add([element]);
    this.queueProvider.refresh();
  }

  playSongWithPlaylist(element: PlaylistContentTreeItem) {
    this.queueProvider.clear();
    this.playPlaylist(element.pid, element);
  }
}

export class PlaylistItemTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly item: PlaylistItem,
    public readonly collapsibleState: TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    const { description, playCount, subscribedCount, trackCount } = this.item;
    return `
    ${description ? description : ""}
    ${trackCount}
    ${playCount}
    ${subscribedCount}
    `;
  }

  iconPath = {
    light: join(__filename, "../../..", "resources", "light", "list.svg"),
    dark: join(__filename, "../../..", "resources", "dark", "list.svg"),
  };

  contextValue = "PlaylistItemTreeItem";
}

export class PlaylistContentTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly item: PlaylistContent,
    public readonly pid: number,
    public readonly collapsibleState: TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    return ``;
  }

  get description(): string {
    return this.item.arName;
  }

  toQueueTreeItem(): QueueTreeItem {
    return new QueueTreeItem(this.label, this.item, this.collapsibleState);
  }

  iconPath = {
    light: join(__filename, "../../..", "resources", "light", "music.svg"),
    dark: join(__filename, "../../..", "resources", "dark", "music.svg"),
  };

  contextValue = "PlaylistContentTreeItem";
}