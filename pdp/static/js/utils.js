// This module contains general utility functions used by PDP.

(function () {

  function binarySearch(a, asc, v, i, j) {
    // Given a sorted array `a`, value `v`, and indices 0 <= `i` < `j` < `n`,
    // where `n = a.length > 1`, such that
    //    `a[i] <= v < a[j]`. if `a` in ascending order, or
    //    `a[i] >= v > a[j]`. if `a` in descending order,
    // return the index `k` such that `i <= k < j`
    //    `a[k] <= v < a[k+1]` if `a` in ascending order, or
    //    `a[k] >= v > a[k+1]` if `a` in descending order.
    // Argument `asc` is a boolean indicating ascending order.
    // This is a utility function for constructing searches of `a`.
    // It will fail if any of the conditions above are violated.

    const f = 0.5;
    const d = j - i;
    if (d <= 1) {
      return i;
    }
    const k = Math.floor(i + f * d);
    return (asc ? v < a[k] : v > a[k]) ?
      binarySearch(a, asc, v, i, k) :
      binarySearch(a, asc, v, k, j);
  }


  function nearestIndex(a, v) {
    // Given an array `a` and a value `v`, return the index
    // `k` such that `abs(a[k] - v)` is minimized for all `0 <= k < n`.
    // where `n = a.length`.

    const asc = a[1] > a[0];

    // Edge cases
    if (asc ? v <= a[0] : v >= a[0]) {
      return 0;
    }
    if (asc ? v >= a[-1] : v <= a[-1]) {
      return a.length - 1;
    }

    const k = binarySearch(a, asc, v, 0, a.length-1);
    const mid = (a[k] + a[k+1]) / 2;
    return (asc ? v <= mid : v >= mid) ? k : k + 1;
  }


  const exports = {
    binarySearch: binarySearch,
    nearestIndex: nearestIndex,
  };

  condExport(module, exports, 'utils');
})();