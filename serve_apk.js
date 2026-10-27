const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const APK_PATH = 'C:\\helper\\mobile\\android\\app\\build\\outputs\\apk\\customer\\release\\app-customer-release.apk';
const APK_DEBUG = 'C:\\helper\\mobile\\android\\app\\build\\outputs\\apk\\customer\\debug\\app-customer-debug.apk';

const server = http.createServer((req, res) => {
  if (req.url === '/download' || req.url === '/app-customer-release.apk') {
    if (!fs.existsSync(APK_PATH)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('APK not found');
    }
    const stat = fs.statSync(APK_PATH);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename="Helper-Customer-Update.apk"'
    });
    const readStream = fs.createReadStream(APK_PATH);
    readStream.pipe(res);
  } else if (req.url === '/debug') {
    if (!fs.existsSync(APK_DEBUG)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Debug APK not found');
    }
    const stat = fs.statSync(APK_DEBUG);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename="Helper-Customer-Debug.apk"'
    });
    const readStream = fs.createReadStream(APK_DEBUG);
    readStream.pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Helper App Download</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
          .card { background: #1e293b; border-radius: 20px; padding: 32px 24px; max-width: 400px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }
          h1 { margin: 0 0 10px; font-size: 24px; color: #38bdf8; }
          p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
          .btn { display: block; background: #0284c7; color: white; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-weight: bold; font-size: 16px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4); }
          .btn:active { background: #0369a1; }
          .btn-secondary { background: #334155; color: #cbd5e1; box-shadow: none; font-size: 14px; }
          .badge { display: inline-block; background: #22c55e; color: #000; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 999px; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">LATEST UPDATE READY</div>
          <h1>Helper Customer App</h1>
          <p>Updated Release APK (Ready to install on Mobile)</p>
          <a class="btn" href="/download">📥 Download Updated App (Release)</a>
          <a class="btn btn-secondary" href="/debug">📥 Download Debug APK</a>
        </div>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('APK Server running at http://192.168.1.9:' + PORT);
});
