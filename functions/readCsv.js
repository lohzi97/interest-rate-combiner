const fsp = require('fs/promises');
const {parse} = require('csv-parse/sync');

/**
 * Read the csv file.
 *
 * @param {string} csvPath csv file to read
 */
async function readCsv(csvPath) {
  const fileContent = await fsp.readFile(csvPath);
  const csvRecords = parse(fileContent, {
    columns: true,
    trim: true,
    skip_empty_lines: true,
  });
  if (!csvRecords || csvRecords.length == 0) {
    throw new Error(`Invalid input csv. No content.`);
  }
  return csvRecords;
}

module.exports = readCsv;
