var moment = require('moment');
let chalk = require('chalk');


let log = function(msg,type){
    var time = moment().format('h:mm:ss ');
    switch (type) {

        case 'ok':
            console.log(time + '   ' + chalk.green('Success   ') + msg);
          break;

        case 'err':
            console.log(time + '   ' + chalk.red('Error   ') + msg);
          break;

        case 'info':
            console.log(time + '   ' + chalk.cyan('Info   ') + msg);
          break;

        case 'res':
            console.log(time + '   ' + chalk.gray('Response   ') + msg);
         break;

        case 'init':
            console.log(time + '   ' + chalk.yellow('Initializing   ') + msg);
         break;
        case 'log':
            console.log(time + '   ' + chalk.cyanBright('LOG   ') + msg);
         break;

        default:
            console.log(time + '   ' + chalk.white('Common   ') + msg);
          break;
      }
}



module.exports = log;