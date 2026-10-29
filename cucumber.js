module.exports = {
  default: {
    paths: ['src/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['src/features/step-definitions/**/*.ts', 'src/hooks/**/*.ts'],
    format: [
      'progress',
      'json:reports/cucumber-report.json',
      'html:reports/cucumber-report.html',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    publishQuiet: true,
    parallel: 1,
  },
};
