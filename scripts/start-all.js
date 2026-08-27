import { spawn } from 'child_process';

console.log('🚀 Starting Brained OS (Backend on :4000 + Frontend on :5173)...\n');

const backend = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

const frontend = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

const cleanup = () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
