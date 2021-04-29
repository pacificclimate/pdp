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
  const a1 = range(0, 10, 0.1);  // ascending: 0, 0.1, ... 9.9
  const n1 = a1.length;
  const a2 = range(10, 0, -0.1);  // descending: 10, 9.9, ... 0.1
  const n2 = a2.length;

  it.each([
    [a1, 2.01, 0, n1-1, 20],
    [a1, 2.11, 0, n1-1, 21],
    [a1, 2.91, 0, n1-1, 29],
    [a1, 3.19, 0, n1-1, 31],
    // some edge-ish cases
    [a1, a1[0], 0, n1-1, 0],
    [a1, a1[1], 0, n1-1, 1],
    [a1, a1[10], 0, n1-1, 10],
    [a1, a1[98], 0, n1-1, 98],

    [a2, 9.99, 0, n2-1, 0],
    [a2, 9.91, 0, n2-1, 0],
    [a2, 0.11, 0, n2-1, n2-1 - 1],
    [a2, 2.01, 0, n2-1, n2-1 - 20],
    // some edge-ish cases
    [a2, a2[0], 0, n2-1, 0],
    [a2, a2[1], 0, n2-1, 1],
    [a2, a2[10], 0, n2-1, 10],
    [a2, a2[98], 0, n2-1, 98],
  ])(
    '%#',
    function (a, v, i, j, expected) {
      // Validity conditions for invoking binarySearch
      const n = a.length;
      expect(n).toBeGreaterThan(1);
      expect(0).toBeLessThanOrEqual(i);
      expect(i).toBeLessThan(j);
      expect(j).toBeLessThan(n);

      const asc = a[0] < a[1];
      const k = binarySearch(a, asc, v, i, j);
      
      expect(i).toBeLessThanOrEqual(k);
      expect(k).toBeLessThan(j);
      if (asc) {
        expect(a[k]).toBeLessThanOrEqual(v);
        expect(v).toBeLessThan(a[k+1]);
      } else {
        expect(a[k]).toBeGreaterThanOrEqual(v);
        expect(v).toBeGreaterThan(a[k+1]);
      }
      expect(k).toBe(expected);
    }
  )
});


describe('nearestIndex', function() {
  const a1 = range(0, 10, 0.1);  // ascending: 0, 0.1, ... 9.9
  const a2 = range(10, 0, -0.1);  // descending: 10, 9.9, ... 0.1

  it.each([
    [a1, -17],
    [a1, 0],
    [a1, 0.2],
    [a1, 2.11],
    [a1, 2.91],
    [a1, 2.96],
    [a1, 3.11],
    [a1, 3.19],
    [a1, 42],

    [a2, -17],
    [a2, 0],
    [a2, 0.21],
    [a2, 2.11],
    [a2, 2.91],
    [a2, 2.96],
    [a2, 3.11],
    [a2, 3.19],
    [a2, 42],
  ])(
    '%#',
    function (a, v) {
      const k = nearestIndex(a, v);

      const n = a.length;

      // Check edge cases
      const asc = a[0] < a[1];
      if (asc) {
        if (v < a[0]) {
          expect(k).toBe(0)
        } else if (v >= a[-1]) {
          expect(k).toBe(n-1);
        }
      } else {
        if (v >= a[0]) {
          expect(k).toBe(0)
        } else if (v <= a[-1]) {
          expect(k).toBe(n-1);
        }
      }

      // Check that `a[k]` is closest to `v` of all `a`
      const diff = a[k] - v;
      if (k > 0) {
        // console.log(`v = ${v}, k = ${k}; a[${k-1}]=${a[k-1]}, a[${k}]=${a[k]}`)
        expect(Math.abs(diff)).toBeLessThan(Math.abs(a[k-1] - v));
      }
      if (k < n - 1) {
        // console.log(`v = ${v}, k = ${k}; a[${k}]=${a[k]}, a[${k+1}]=${a[k+1]}`)
        expect(Math.abs(diff)).toBeLessThan(Math.abs(a[k + 1] - v));
      }
    }
  )
});

