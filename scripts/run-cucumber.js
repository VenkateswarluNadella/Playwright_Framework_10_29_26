const { spawn } = require('node:child_process');
const { existsSync, rmSync } = require('node:fs');
const path = require('node:path');

const cucumberPackageDirectory = path.resolve(
  path.dirname(require.resolve('@cucumber/cucumber')),
  '..',
);
const cucumberCli = path.join(cucumberPackageDirectory, 'bin', 'cucumber.js');
const reportPath = path.resolve(process.cwd(), 'reports', 'cucumber-report.html');
rmSync(reportPath, { force: true });
const cucumber = spawn(process.execPath, [cucumberCli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

cucumber.on('error', (error) => {
  console.error('Unable to start Cucumber:', error);
  process.exitCode = 1;
});

cucumber.on('close', (code, signal) => {
  if (existsSync(reportPath)) {
    if (process.env.CI) {
      console.log(`Cucumber HTML report: ${reportPath}`);
    } else {
      openReport(reportPath);
    }
  } else {
    console.error(`Cucumber HTML report was not generated: ${reportPath}`);
    process.exitCode = process.exitCode || 1;
  }

  if (signal) {
    console.error(`Cucumber exited due to signal ${signal}.`);
    process.exitCode = process.exitCode || 1;
  } else if (code !== 0) {
    process.exitCode = code || 1;
  }
});

function openReport(filePath) {
  const command = process.platform === 'win32'
    ? 'rundll32.exe'
    : process.platform === 'darwin'
      ? 'open'
      : 'xdg-open';
  const args = process.platform === 'win32'
    ? ['url.dll,FileProtocolHandler', filePath]
    : [filePath];

  const opener = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  opener.on('error', (error) => {
    console.error(`Could not open the Cucumber report automatically: ${error.message}`);
    console.error(`Open it manually: ${filePath}`);
  });
  opener.unref();
}
