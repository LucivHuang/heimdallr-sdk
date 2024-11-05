const { white, green, red } = require('chalk');
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
  box(message, green(title), green('✔ Success'), {
    borderColor: 'green'
  });

const errorBox = (message, title) =>
  box(message, red(title), red('✖ Error'), {
    borderColor: 'red'
  });

module.exports = {
  box,
  successBox,
  errorBox
};
