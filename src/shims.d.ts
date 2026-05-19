// Minimal shims to allow TypeScript compilation when node_modules are not installed in this environment.
// These declarations are intentionally loose and only cover the server's usage.

declare module 'express' {
  import http = require('http');

  export interface Request extends http.IncomingMessage {
    params: { [key: string]: string };
    query: any;
    body: any;
    file?: any;
    userId?: string;
    header(name: string): string | undefined;
  }

  export interface Response extends http.ServerResponse {
    json(body: any): any;
    status(code: number): Response;
    sendFile(path: string): any;
  }

  export type NextFunction = (err?: any) => void;

  interface ExpressApp {
    use(...args: any[]): any;
    get(...args: any[]): any;
    post(...args: any[]): any;
    patch(...args: any[]): any;
    delete(...args: any[]): any;
    listen(port: number, cb?: () => void): any;
  }

  interface ExpressStatic {
    (): ExpressApp;
    json(): (req: any, res: any, next: any) => void;
    static(root: string): (req: any, res: any, next: any) => void;
  }

  const express: ExpressStatic;
  export default express;
}

declare module 'cors' {
  function cors(options?: any): any;
  export default cors;
}

declare module 'multer' {
  interface StorageEngine {}

  interface Multer {
    single(fieldName: string): any;
  }

  function multer(options?: any): Multer;

  namespace multer {
    function memoryStorage(): StorageEngine;
  }

  export default multer;
}

declare module 'uuid' {
  export function v4(): string;
}
