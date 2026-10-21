import { createServer } from 'node:http';

createServer((request, response) => {
  if (request.method !== 'GET' || request.url !== '/waitlist-form') {
    response.writeHead(404).end();
    return;
  }
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'none'");
  response.end('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Local waiting-list fixture</title><main><h1>Local waiting-list destination</h1><p>This disposable navigation fixture collects no email and saves nothing. The release must use the verified Google Form supplied by AIW-549.</p></main></html>');
}).listen(5194, '127.0.0.1', () => console.log('Disposable no-collection fixture: http://127.0.0.1:5194/waitlist-form'));
