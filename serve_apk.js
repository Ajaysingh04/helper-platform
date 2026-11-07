const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const os = require('os');
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '10.252.42.228';
}
const LOCAL_IP = getLocalIp();

const APK_PATHS = {
  customer: {
    release: 'C:\\helper\\mobile\\android\\app\\build\\outputs\\apk\\customer\\release\\app-customer-release.apk',
    debug: 'C:\\helper\\mobile\\android\\app\\build\\outputs\\apk\\customer\\debug\\app-customer-debug.apk',
    label: 'Helper Customer App',
    emoji: '🏠',
    color: '#0284c7',
  },
  partner: {
    release: 'C:\\helper\\mobile\\android\\app\\build\\outputs\\apk\\partner\\release\\app-partner-release.apk',
    debug: 'C:\\helper\\mobile\\android\\app\\build\\outputs\\apk\\partner\\debug\\app-partner-debug.apk',
    label: 'Helper Vendor / Partner App',
    emoji: '🏢',
    color: '#10b981',
  },
  worker: {
    release: 'C:\\helper\\mobile\\android\\app\\build\\outputs\\apk\\worker\\release\\app-worker-release.apk',
    debug: 'C:\\helper\\mobile\\android\\app\\build\\outputs\\apk\\worker\\debug\\app-worker-debug.apk',
    label: 'Helper Worker / Crew App',
    emoji: '🔧',
    color: '#f59e0b',
  },
};

function serveApk(res, filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`
      <html><body style="font-family:sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;">
        <div>
          <div style="font-size:48px">❌</div>
          <h2>APK Not Found</h2>
          <p style="color:#94a3b8">File not found: ${path.basename(filePath)}</p>
          <p style="color:#94a3b8;font-size:12px">Please build the APK first using Gradle.</p>
          <a href="/" style="color:#38bdf8">← Back to Downloads</a>
        </div>
      </body></html>
    `);
  }
  const stat = fs.statSync(filePath);
  const sizeMB = (stat.size / 1024 / 1024).toFixed(1);
  console.log(`[${new Date().toLocaleTimeString()}] Serving: ${fileName} (${sizeMB} MB)`);
  res.writeHead(200, {
    'Content-Type': 'application/vnd.android.package-archive',
    'Content-Length': stat.size,
    'Content-Disposition': `attachment; filename="${fileName}"`,
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = req.url;

  // Customer APK routes
  if (url === '/customer' || url === '/customer-release') {
    return serveApk(res, APK_PATHS.customer.release, 'Helper-Customer.apk');
  }
  if (url === '/customer-debug') {
    return serveApk(res, APK_PATHS.customer.debug, 'Helper-Customer-Debug.apk');
  }

  // Vendor/Partner APK routes
  if (url === '/vendor' || url === '/partner' || url === '/partner-release') {
    return serveApk(res, APK_PATHS.partner.release, 'Helper-Vendor.apk');
  }
  if (url === '/vendor-debug' || url === '/partner-debug') {
    return serveApk(res, APK_PATHS.partner.debug, 'Helper-Vendor-Debug.apk');
  }

  // Worker APK routes
  if (url === '/worker' || url === '/worker-release') {
    return serveApk(res, APK_PATHS.worker.release, 'Helper-Worker.apk');
  }
  if (url === '/worker-debug') {
    return serveApk(res, APK_PATHS.worker.debug, 'Helper-Worker-Debug.apk');
  }

  // Home page with all download links
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Helper App Downloads</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          min-height: 100vh;
          padding: 24px 16px;
        }
        .container { max-width: 420px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 28px; }
        .header h1 { font-size: 26px; font-weight: 900; color: #f8fafc; margin-bottom: 6px; }
        .header p { color: #94a3b8; font-size: 13px; }
        .badge {
          display: inline-block;
          background: linear-gradient(90deg, #10b981, #0284c7);
          color: #000;
          font-size: 10px;
          font-weight: 900;
          padding: 4px 12px;
          border-radius: 999px;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .app-card {
          background: #1e293b;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 16px;
          border: 1px solid #334155;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .app-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .app-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          flex-shrink: 0;
        }
        .app-info h3 { font-size: 16px; font-weight: 800; margin-bottom: 3px; }
        .app-info p { color: #94a3b8; font-size: 12px; line-height: 1.4; }
        .btn {
          display: block;
          text-decoration: none;
          padding: 13px 16px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          text-align: center;
          margin-bottom: 8px;
          transition: opacity 0.15s;
          letter-spacing: 0.3px;
        }
        .btn:active { opacity: 0.75; }
        .btn-secondary {
          background: #0f172a;
          color: #64748b;
          border: 1px solid #334155;
          font-size: 12px;
          padding: 10px 16px;
        }
        .instruction-box {
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 14px;
          padding: 14px;
          margin-top: 20px;
        }
        .instruction-box h4 { color: #38bdf8; font-size: 12px; font-weight: 800; margin-bottom: 8px; letter-spacing: 0.5px; }
        .instruction-box li { color: #94a3b8; font-size: 12px; line-height: 1.7; margin-left: 14px; }
        .server-info {
          text-align: center;
          color: #334155;
          font-size: 11px;
          margin-top: 20px;
          padding-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">✅ APK SERVER LIVE</div>
          <h1>Helper App Downloads</h1>
          <p>Tap any button to download and install on your phone</p>
        </div>

        <!-- Customer App -->
        <div class="app-card">
          <div class="app-header">
            <div class="app-icon" style="background: rgba(2, 132, 199, 0.15); border: 1px solid rgba(2,132,199,0.3);">🏠</div>
            <div class="app-info">
              <h3>Customer App</h3>
              <p>Book home services, track workers,<br>make payments via QR code</p>
            </div>
          </div>
          <a class="btn" style="background: #0284c7; color: #fff; box-shadow: 0 4px 14px rgba(2,132,199,0.4);" href="/customer">
            📥 Download Customer APK (Release)
          </a>
          <a class="btn btn-secondary" href="/customer-debug">🔧 Download Debug Build</a>
        </div>

        <!-- Vendor App -->
        <div class="app-card">
          <div class="app-header">
            <div class="app-icon" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16,185,129,0.3);">🏢</div>
            <div class="app-info">
              <h3>Vendor / Partner App</h3>
              <p>Manage workers, accept bookings,<br>live radar & wallet settlement</p>
            </div>
          </div>
          <a class="btn" style="background: #10b981; color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,0.4);" href="/vendor">
            📥 Download Vendor APK (Release)
          </a>
          <a class="btn btn-secondary" href="/vendor-debug">🔧 Download Debug Build</a>
        </div>

        <!-- Worker App -->
        <div class="app-card">
          <div class="app-header">
            <div class="app-icon" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245,158,11,0.3);">🔧</div>
            <div class="app-info">
              <h3>Worker / Crew App</h3>
              <p>Accept jobs, navigate to customers,<br>OTP verify & start work timer</p>
            </div>
          </div>
          <a class="btn" style="background: #f59e0b; color: #000; box-shadow: 0 4px 14px rgba(245,158,11,0.35);" href="/worker">
            📥 Download Worker APK (Release)
          </a>
          <a class="btn btn-secondary" href="/worker-debug">🔧 Download Debug Build</a>
        </div>

        <div class="instruction-box">
          <h4>📱 INSTALLATION INSTRUCTIONS</h4>
          <ol>
            <li>Open this page on your phone browser</li>
            <li>Tap the download button for the app you need</li>
            <li>Go to <strong>Settings → Security</strong> on your phone</li>
            <li>Enable <strong>"Install from Unknown Sources"</strong></li>
            <li>Open the downloaded APK from your Downloads folder</li>
            <li>Tap <strong>Install</strong> and wait for it to complete</li>
          </ol>
        </div>

        <div class="server-info">
          Helper APK Server • ${LOCAL_IP}:${PORT} • All apps connect to ${LOCAL_IP}:5000
        </div>
      </div>
    </body>
    </html>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log(`║  ✅ Helper APK Server is LIVE on port ${PORT}       ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  📱 Open on phone: http://${LOCAL_IP}:${PORT}     ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  🏠 Customer APK:  http://${LOCAL_IP}:${PORT}/customer  ║`);
  console.log(`║  🏢 Vendor APK:    http://${LOCAL_IP}:${PORT}/vendor    ║`);
  console.log(`║  🔧 Worker APK:    http://${LOCAL_IP}:${PORT}/worker    ║`);
  console.log('╚══════════════════════════════════════════════════╝\n');
});
