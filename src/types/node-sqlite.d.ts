declare module 'node:sqlite' {
  export interface StatementSync {
    all(...params: any[]): any[];
    get(...params: any[]): any;
    run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
    iterate(...params: any[]): IterableIterator<any>;
  }

  export class DatabaseSync {
    constructor(location: string);
    open(): void;
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
