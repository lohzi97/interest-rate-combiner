const yargs = require('yargs');

const argv = yargs
    .option('folder', {
      describe: `Folder path to all the interest rates csv.`,
      type: 'string',
      demandOption: true,
    })
    .argv;

/**
 * Validate argv and return out the required args.
 *
 * @return {object} object with verified valid args
 */
function getArgs() {
  return {
    folder: argv.folder,
  };
}

module.exports = getArgs();