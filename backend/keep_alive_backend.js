const { spawn } = require('child_process');
const path = require('path');

function run() {
  console.log('[KeepAlive] Launching Backend server.js...');
  const child = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  child.on('exit', (code, signal) => {
    console.log('[KeepAlive] Backend exited with code ' + code + ' (' + signal + '). Restarting in 2s...');
    setTimeout(run, 2000);
  });
}

run();

