require('./globals-helpers').importGlobals([
  { module: 'js/condExport', name: 'condExport' },
  // { module: 'js/classes.js', name: 'classes' },
  { module: 'js/utils.js', name: 'utils' },
], '../..');

const { binarySearch, nearestIndex } = utils;


function range (start, end, step) {
  // Return an array filled with values from start to end by step.
  const n = Math.floor((end - start) / step);
  return Array(n).fill().map(
    function (item, index) {
      return start + index * step;
    }
  );
}


describe('binarySearch', function() {
  const a1 = range(0, 10, 0.1);

  it.each([
    [a1, 0, 0, a1.length-1, 0],
    [a1, 2.01, 0, a1.length-1, 20],
    [a1, 2.11, 0, a1.length-1, 21],
    [a1, 2.91, 0, a1.length-1, 29],
    [a1, 3.19, 0, a1.length-1, 31],
  ])(
    '%#',
    function (a, v, i, j, expected) {
      const result = binarySearch(a, v, i, j);
      expect(result).toBe(expected);
    }
  )
});


describe('nearestIndex', function() {
  const a1 = range(0, 10, 0.1);

  it.each([
    [a1, -17, 0],
    [a1, 0, 0],
    [a1, 0.2, 2],
    [a1, 2.11, 21],
    [a1, 2.91, 29],
    [a1, 2.96, 30],
    [a1, 3.11, 31],
    [a1, 3.19, 32],
    [a1, 42, 99],
  ])(
    '%#',
    function (a, v, expected) {
      const result = nearestIndex(a, v);
      expect(result).toBe(expected);
    }
  )
});

