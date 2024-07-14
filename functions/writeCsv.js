const fsp = require('fs/promises');
const {stringify} = require('csv-stringify/sync');

/**
 * Write data to csv file. 
 * - Will overwrite existing file.
 * - Header will be included.
 *
 * @param {string} csvfullfile absolute file path of the csv
 * @param {object[]} data array of data that need to be written to the csv.
 */
async function writeCsv(csvfullfile, data) {
    const csvStr = stringify(data, {
      header: true,
    });
    await fsp.writeFile(csvfullfile, csvStr);
  }
  
  module.exports = writeCsv;