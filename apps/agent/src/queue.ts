import type { BillStatus } from "@gpbm/shared";

export type QueueItem = {
  id: string;
  file_path: string;
  duplicate_key?: string;
  status: BillStatus;
  attempts: number;
  last_error?: string;
};

export class LocalQueue {
  private readonly items = new Map<string, QueueItem>();

  upsert(item: QueueItem): void {
    this.items.set(item.id, item);
  }

  findByDuplicateKey(duplicateKey: string): QueueItem | undefined {
    return Array.from(this.items.values()).find((item) => item.duplicate_key === duplicateKey);
  }

  pending(): QueueItem[] {
    return Array.from(this.items.values()).filter((item) => ["queued", "failed", "retrying"].includes(item.status));
  }
}
