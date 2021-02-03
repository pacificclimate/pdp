// This module contains general utility functions used by PDP.

(function () {

  function binarySearch(a, v, i, j) {
    // Given an array `a` in ascending order, and a value `v`,
    // return the index `k` such that `a[k] <= v < a[k+1]` and `i <= k < j`.
    // This is a utility function for constructing searches of `a`.

    // Conditions:
    // n = len(a) > 1
    // 0 <= i < j < n
    // a[i] <= v < a[j]

    const f = 0.5;
    const d = j - i;
    if (d <= 1) {
      return i;
    }
    const k = Math.floor(i + f * d);
    return v < a[k] ? binarySearch(a, v, i, k) : binarySearch(a, v, k, j);
  }


  function nearestIndex(a, v) {
    // Given an array `a` in ascending order, and a value `v`, return the index
    // `k` such that `a[k] <= v < a[k+1]` if `a[0] <= v < a[n-1]`, and
    // `0` or `n-1` if v is below or above the range of `a`, respectively,
    // where `n = a.length`.

    // Edge cases
    if (v <= a[0]) {
      return 0;
    }
    if (v >= a[-1]) {
      return a.length - 1;
    }

    const k = binarySearch(a, v, 0, a.length-1);
    return v <= (a[k] + a[k+1]) / 2 ? k : k + 1;
  }


  const exports = {
    binarySearch: binarySearch,
    nearestIndex: nearestIndex,
  };

  condExport(module, exports, 'utils');
})();