<<<<<<< HEAD
const { white, green, red, cyan } = require('chalk');
=======
const { white, green, red } = require('chalk');
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
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
<<<<<<< HEAD
  box(message, green(title), green('Success'), {
=======
  box(message, green(title), green('✔ Success'), {
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
    borderColor: 'green'
  });

const errorBox = (message, title) =>
<<<<<<< HEAD
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
=======
  box(message, red(title), red('✖ Error'), {
    borderColor: 'red'
  });

module.exports = {
  box,
  successBox,
  errorBox
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
};
