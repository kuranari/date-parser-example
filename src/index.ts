import * as P from 'parsimmon';

process.env.TZ = "UTC";

function fromToday(diff: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + diff)
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)

  return date
}

const longMonthNames: { [key: string]: number; } = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const shortMonthNames: { [key: string]: number; } = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
}

const longNamedMonthParser = P.letters.chain(s => {
  const n = longMonthNames[s.toLowerCase()];
  if (n) {
    return P.succeed(n);
  } else {
    return P.fail(`${s} is not a valid month`);
  }
});

const shortNamedMonthParser = P.letters.chain(s => {
  const n = shortMonthNames[s.toLowerCase()];
  if (n) {
    return P.succeed(n);
  } else {
    return P.fail(`${s} is not a valid month`);
  }
});

const numberMonthParser = P.regexp(/[0-9]+/).map(Number).chain(number => {
  if (1 <= number && number <= 12) {
    return P.succeed(number);
  } else {
    return P.fail('Month must be between 1 and 12');
  }
});

const monthParser = P.alt(numberMonthParser, longNamedMonthParser, shortNamedMonthParser)

const numberDaySuffixParser = P.alt(
  P.string("st"),
  P.string("nd"),
  P.string("rd"),
  P.string("th")
);

const dayOfMonthParser = P.regexp(/[0-9]+/).map(Number).chain(number => {
  return numberDaySuffixParser.fallback("").chain(() => {
    if (1 <= number && number <= 31) {
      return P.succeed(number)
    } else {
      return P.fail('Day must be between 1 and 31')
    }
  })
})

const yearParser = P.regexp(/[0-9]+/)
  .map(Number)
  .chain(number => {
    if (0 <= number && number < 30) {
      return P.succeed(2000 + number)
    } else if (30 <= number && number < 100) {
      return P.succeed(1900 + number)
    } else if (1000 <= number && number < 10000) {
      return P.succeed(number)
    } else {
      return P.fail("Invalid year")
    }
  })

const separatorParser = P.oneOf(",-/ .").many();

const yearMonthParser = P.seq(yearParser, separatorParser, monthParser).map(([year, _, month]) => {
  return new Date(year, month - 1, 1)
})

const fullDateParser = P.seq(yearParser, separatorParser, monthParser, separatorParser, dayOfMonthParser).map(([year, _1, month, _2, day]) => {
  return new Date(year, month - 1, day)
})

const todayParser = P.alt(
  P.string("today"),
  P.string("now"),
).map(() => fromToday(0))

const tomorrowParser = P.string("tomorrow").map(() => fromToday(+1))
const yestardayParser = P.string("yesterday").map(() => fromToday(-1))

const stringParser = P.alt(
  todayParser,
  yestardayParser,
  tomorrowParser
)

const dateParser = P.alt(
  fullDateParser,
  stringParser,
  yearMonthParser,
)

const inputs = [
  'today',
  'tomorrow',
  'yesterday',
  '90.01.04',
  '2020-01-04',
  '2020/1/4',
  '2020/March/4',
  '2020 Feb 4',
  '20 Mar 4th'
]

console.table(inputs.map(string => [string, dateParser.tryParse(string)]))
