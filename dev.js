const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

console.log('🚀 Starting Clinical Laboratory Management System...');
console.log('📦 Starting Backend API Server (Port 5000)...');
console.log('💻 Starting Frontend Web Client (Port 5173)...');

const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
});

const client = spawn(npxCmd, ['vite', '--host', '--port', '5173'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

setTimeout(() => {
  console.log('\n🌐 Opening app in browser at http://localhost:5173 ...');
  if (isWindows) {
    spawn('cmd', ['/c', 'start', 'http://localhost:5173'], { stdio: 'ignore' });
  }
}, 2500);

const cleanup = () => {
  console.log('\n🛑 Shutting down services...');
  if (isWindows) {
    if (server.pid) spawn('taskkill', ['/pid', server.pid, '/f', '/t']);
    if (client.pid) spawn('taskkill', ['/pid', client.pid, '/f', '/t']);
  } else {
    server.kill();
    client.kill();
  }
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
