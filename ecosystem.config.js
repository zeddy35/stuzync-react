module.exports = {
  apps: [
    {
      name: 'stuzync',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
    },
  ],
};

