const { white, green, red, cyan } = require('chalk');
const boxen = require('boxen');

const box = (message, title, boxTitle, options) =>
  boxen(
    [boxTitle, title, '', white(message)].join('\n'),
    Object.assign(
      {
        borderColor: 'white',
        borderStyle: 'round',
        padding: 1,
        margin: 1
      },
      options
    )
  ) + '\n';

const successBox = (message, title) =>
  box(message, green(title), green('Success'), {
    borderColor: 'green'
  });

const errorBox = (message, title) =>
  box(message, red(title), red('Error'), {
    borderColor: 'red'
  });

const infoBox = (message, title) =>
  box(message, cyan(title), cyan('Info'), {
    borderColor: 'cyan'
  });

module.exports = {
  box,
  successBox,
  errorBox,
  infoBox
};
