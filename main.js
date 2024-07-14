const fsp = require('fs/promises');
const path = require('path');
const {DateTime} = require('luxon');

const argv = require('./functions/getArgs');
const readCsv = require('./functions/readCsv');
const writeCsv = require('./functions/writeCsv');

// Main program
(async () => {

  // read all interest rate files
  const rawInterestRates = {};
  const files = await fsp.readdir(argv.folder);
  const csvFiles = files.filter(((file) => file.endsWith('.csv') && file !== 'Interest Rates.csv'));
  for (const csvFile of csvFiles) {
    rawInterestRates[path.parse(csvFile).name] = await readCsv(path.join(argv.folder, csvFile));
  }

  // find the earliest data
  let earliestDatetime;
  for (const filename in rawInterestRates) {
    const rawInterestRate = rawInterestRates[filename];
    const lastRow = rawInterestRate[rawInterestRate.length - 1];
    const lastDate = _extractDateTime(`${lastRow['Release Date']} | ${lastRow['Time']}`);
    if (!lastDate) {
      throw new Error(`Failed to parse the first 'Release Date' and 'Time' in ${filename}.csv`);
    }
    if (!earliestDatetime || lastDate < earliestDatetime) {
      earliestDatetime = lastDate;
    }
  }

  // generate 'Interest Rates.csv'

  // - create empty csv table
  const contents = [];
  const now = DateTime.now();
  const datetimeCol = _generateDateTimeSequence(earliestDatetime, now);
  for (const datetime of datetimeCol) {
    const content = {
      datetime: datetime.toISODate(), 
    };
    for (const filename in rawInterestRates) {
      content[filename] = '-';
    }
    contents.push(content);
  }

  // - fill it in with data
  for (const filename in rawInterestRates) {
    const rawInterestRate = rawInterestRates[filename];
    for (const row of rawInterestRate) {
      const date = _extractDateTime(`${row['Release Date']} | ${row['Time']}`);
      const content = contents.find((content) => content.datetime === date.toISODate());
      content[filename] = row.Actual;
    }
  }

  // - fill in data gaps
  for (let i = 1; i < contents.length; i++) {
    const prevContent = contents[i - 1];
    const currContent = contents[i];
    for (const filename in rawInterestRates) {
      if (currContent[filename] === '-' && prevContent[filename] !== '-') {
        currContent[filename] = prevContent[filename];
      }
    }
  }

  // - write it
  await writeCsv(path.join(argv.folder, 'Interest Rates.csv'), contents);

})();

function _extractDateTime(dateTimeString) {
  const dateTimePattern = /(\w{3} \d{2}, \d{4})(?: \(\w+\))? \| (\d{1,2}:\d{2})/;
  const match = dateTimeString.match(dateTimePattern);
  if (match) {
    const datePart = match[1];
    const timePart = match[2];
    const is12HourFormat = /^(\d{1,2}):(\d{2})$/.test(timePart) && parseInt(timePart.split(':')[0], 10) < 13;
    const formatString = is12HourFormat ? 'MMM dd, yyyy h:mm' : 'MMM dd, yyyy HH:mm';
    return DateTime.fromFormat(`${datePart} ${timePart}`, formatString);
  }
  return null;
}

function _generateDateTimeSequence(startDateTime, endDateTime) {
  const dates = [];
  let currentDate = startDateTime;
  while (currentDate <= endDateTime) {
    dates.push(currentDate);
    currentDate = currentDate.plus({ days: 1 });
  }
  return dates;
}