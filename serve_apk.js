const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;

function getAllLocalIps() {
  const ips = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips.length > 0 ? ips : ['192.168.1.8'];
}

const LOCAL_IPS = getAllLocalIps();
const PRIMARY_IP = LOCAL_IPS.find(ip => ip.startsWith('192.168.')) || LOCAL_IPS[0];

const APK_PATHS = {
  customer: {
    release: 'C:\\helper\\mobile\\android\\app\\build\\outputs\\apk\\customer\\release\\app-customer-release.apk',
    label: 'Helper Customer App',
    fileName: 'Helper-Customer.apk',
  },
  partner: {
    release: 'C:\\helper\\mobile\\android\\app\\build\\outputs\\apk\\partner\\release\\app-partner-release.apk',
    label: 'Helper Vendor / Partner App',
    fileName: 'Helper-Vendor.apk',
  },
  worker: {
    release: 'C:\\helper\\mobile\\android\\app\\build\\outputs\\apk\\worker\\release\\app-worker-release.apk',
    label: 'Helper Worker / Crew App',
    fileName: 'Helper-Worker.apk',
  },
};

function serveApk(req, res, filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`
      <html><body style="font-family:sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;">
        <div>
          <div style="font-size:48px">❌</div>
          <h2>APK Not Found</h2>
          <p style="color:#94a3b8">File not found: ${path.basename(filePath)}</p>
          <a href="/" style="color:#38bdf8">← Back to Downloads</a>
        </div>
      </body></html>
    `);
  }

  const stat = fs.statSync(filePath);
  const total = stat.size;
  const sizeMB = (total / 1024 / 1024).toFixed(1);
  console.log(`[${new Date().toLocaleTimeString()}] Serving: ${fileName} (${sizeMB} MB) to ${req.socket.remoteAddress}`);

  // Support range requests for fast chunked mobile downloads
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const partialstart = parts[0];
    const partialend = parts[1];
    const start = parseInt(partialstart, 10);
    const end = partialend ? parseInt(partialend, 10) : total - 1;
    const chunksize = (end - start) + 1;

    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath, { start: start, end: end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': total,
      'Accept-Ranges': 'bytes',
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/vendor' || url === '/partner' || url === '/vendor.apk' || url === '/partner.apk' || url === '/Helper-Vendor.apk') {
    return serveApk(req, res, APK_PATHS.partner.release, 'Helper-Vendor.apk');
  }

  if (url === '/customer' || url === '/customer.apk' || url === '/Helper-Customer.apk') {
    return serveApk(req, res, APK_PATHS.customer.release, 'Helper-Customer.apk');
  }

  if (url === '/worker' || url === '/worker.apk' || url === '/Helper-Worker.apk') {
    return serveApk(req, res, APK_PATHS.worker.release, 'Helper-Worker.apk');
  }

  // Home Download Portal
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Helper App Downloads</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0f172a;
          color: #fff;
          min-height: 100vh;
          padding: 24px 16px;
        }
        .container { max-width: 440px; margin: 0 auto; }
        .badge {
          display: inline-block;
          background: #10b981;
          color: #000;
          font-size: 11px;
          font-weight: 900;
          padding: 5px 12px;
          border-radius: 999px;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .header { text-align: center; margin-bottom: 24px; }
        .header h1 { font-size: 24px; font-weight: 900; color: #f8fafc; margin-bottom: 6px; }
        .header p { color: #94a3b8; font-size: 13px; }
        .app-card {
          background: #1e293b;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 16px;
          border: 1px solid #334155;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .app-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .app-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; flex-shrink: 0;
        }
        .app-info h3 { font-size: 17px; font-weight: 800; }
        .app-info p { color: #94a3b8; font-size: 12px; margin-top: 3px; }
        .btn {
          display: block; text-decoration: none; padding: 14px 16px;
          border-radius: 12px; font-weight: 900; font-size: 15px;
          text-align: center; letter-spacing: 0.3px;
        }
        .instruction-box {
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 14px;
          padding: 16px;
          margin-top: 20px;
        }
        .instruction-box h4 { color: #38bdf8; font-size: 13px; font-weight: 800; margin-bottom: 8px; }
        .instruction-box li { color: #94a3b8; font-size: 12.5px; line-height: 1.7; margin-left: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">🚀 LIVE APK SERVER</div>
          <h1>Helper App Downloads</h1>
          <p>Tap below to download and install on your Android device</p>
        </div>

        <!-- Vendor App -->
        <div class="app-card">
          <div class="app-header">
            <div class="app-icon" style="background: rgba(16, 185, 129, 0.15); border: 1.5px solid #10b981;">🏢</div>
            <div class="app-info">
              <h3>Vendor / Partner App</h3>
              <p>Native Mobile UI • Radar • Siren Alert • Add Service with Photo</p>
            </div>
          </div>
          <a class="btn" style="background: #10b981; color: #fff;" href="/vendor">
            📥 Download Vendor APK (36.8 MB)
          </a>
        </div>

        <!-- Customer App -->
        <div class="app-card">
          <div class="app-header">
            <div class="app-icon" style="background: rgba(2, 132, 199, 0.15); border: 1.5px solid #0284c7;">🏠</div>
            <div class="app-info">
              <h3>Customer App</h3>
              <p>Book Services • Live Tracking • Doorstep Pro</p>
            </div>
          </div>
          <a class="btn" style="background: #0284c7; color: #fff;" href="/customer">
            📥 Download Customer APK (36.8 MB)
          </a>
        </div>

        <div class="instruction-box">
          <h4>📱 INSTALLATION INSTRUCTIONS:</h4>
          <ol>
            <li>Tap the green <strong>Download Vendor APK</strong> button above</li>
            <li>If prompted with <em>"File might be harmful"</em>, tap <strong>Download anyway</strong></li>
            <li>Once downloaded, tap <strong>Open</strong> and click <strong>Install</strong></li>
            <li>If asked to <em>"Install unknown apps"</em>, toggle <strong>Allow from this source</strong></li>
          </ol>
        </div>
      </div>
    </body>
    </html>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Helper APK Server LIVE on port ${PORT}`);
  LOCAL_IPS.forEach(ip => {
    console.log(`📱 http://${ip}:${PORT}`);
    console.log(`🏢 http://${ip}:${PORT}/vendor`);
  });
});
