import {
  Event,
  EventEmitter,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
} from "vscode";
import { SongsItem } from "../constant";
import { lock } from "../state";
import { unsortInplace } from "array-unsort";
import dedupe = require("dedupe");

export class QueueProvider implements TreeDataProvider<QueueItemTreeItem> {
  private static instance: QueueProvider;

  private _onDidChangeTreeData: EventEmitter<QueueItemTreeItem | void> = new EventEmitter<QueueItemTreeItem | void>();

  readonly onDidChangeTreeData: Event<QueueItemTreeItem | void> = this
    ._onDidChangeTreeData.event;

  private static action?: () => Promise<void>;
  static songs: QueueItemTreeItem[] = [];

  static getInstance(): QueueProvider {
    return this.instance || (this.instance = new QueueProvider());
  }

  static refresh(action: () => Promise<void>): void {
    if (!lock.queue) {
      lock.queue = true;
      QueueProvider.action = action;
      this.instance._onDidChangeTreeData.fire();
    }
  }

  getTreeItem(element: QueueItemTreeItem): TreeItem {
    return element;
  }

  async getChildren(): Promise<QueueItemTreeItem[]> {
    const localAction = QueueProvider.action;
    QueueProvider.action = undefined;
    if (localAction) {
      await localAction();
    }
    lock.queue = false;
    return QueueProvider.songs;
  }

  static indexOf(element: QueueItemTreeItem): number {
    for (let i = 0; i < this.songs.length; ++i) {
      if (this.songs[i].valueOf() === element.valueOf()) {
        return i;
      }
    }
    return -1;
  }

  static clear(): void {
    QueueProvider.songs = [];
  }

  static random(): void {
    QueueProvider.songs = [QueueProvider.songs[0]].concat(
      unsortInplace(QueueProvider.songs.slice(1))
    );
  }

  static shift(index: number): void {
    if (index) {
      while (index < 0) {
        index += QueueProvider.songs.length;
      }
      QueueProvider.songs = QueueProvider.songs
        .slice(index)
        .concat(QueueProvider.songs.slice(0, index));
    }
  }

  static add(elements: QueueItemTreeItem[]): void {
    QueueProvider.songs = dedupe(
      QueueProvider.songs.concat(elements),
      (element: QueueItemTreeItem) => element.valueOf()
    );
  }

  static delete(element: QueueItemTreeItem): void {
    const index = this.indexOf(element);
    if (index >= 0) {
      QueueProvider.songs.splice(index, 1);
    }
  }
}

export class QueueItemTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly item: SongsItem,
    public readonly pid: number,
    public readonly md5: string,
    public readonly collapsibleState: TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }

  valueOf(): number {
    return this.item.id;
  }

  description = (() => {
    const arName: string[] = [];
    for (const i of this.item.ar) {
      arName.push(i.name);
    }
    return arName.join("/");
  })();

  iconPath = new ThemeIcon("zap");

  contextValue = "QueueItemTreeItem";
}
