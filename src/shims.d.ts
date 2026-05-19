// Minimal shims to allow TypeScript compilation when node_modules are not installed in this environment.
// These declare modules silence "Cannot find module" errors for dev environment here.

declare module 'express' {
  import http = require('http');
  export interface Request extends http.IncomingMessage {
    params: { [key: string]: string };
    query: any;
    body: any;
    header(name: string): string | undefined;
  }
  export interface Response extends http.ServerResponse {
    json: (body: any) => void;
    status: (code: number) => Response;
  }
  export type NextFunction = (err?: any) => void;
  function express(): any;
  interface ExpressApp {
    use(...args: any[]): any;
    listen(port: number, cb?: () => void): any;
  function cors(options?: any): any;

  interface ExpressStatic {
    (): ExpressApp;
    json(): (req: any, res: any, next: any) => void;
    urlencoded(options?: any): (req: any, res: any, next: any) => void;
declare module 'multer' {

  const express: ExpressStatic;
  function multer(options?: any): any;
    function memoryStorage(): StorageEngine;
    interface Multer {
      single(fieldName: string): any;
    }
  }
  export default multer;
}

declare module 'uuid' {
  export function v4(): string;
}

// Basic process shim
declare var process: any;
