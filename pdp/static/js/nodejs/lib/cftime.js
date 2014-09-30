"use strict";

var cftime;

module.exports = cftime = function(units, sDate) {
    this.units = units;
    this.sDate = sDate;
};

cftime.prototype.setMaxTimeByIndex = function(index) {
    this.maxIndex =  index;
    this.eDate = this.toDate(index);
    return this.eDate;
};

cftime.prototype.toDate = function(index) {
    if (index === undefined) {
        return this.sDate;
    }
    if (this.units === "days") {
        var d = new Date(this.sDate.getTime());
        d.setDate(this.sDate.getDate() + index);
        if (this.eDate && d > this.eDate) {
            return undefined;
        }
        return d;
    }
};

cftime.prototype.toIndex = function(d) {
    if (d < this.sDate || (this.eDate && this.eDate < d)) {
        return;
    }

    if (this.units === "days") {
        var msPerDay = 1000 * 60 * 60 * 24;
        var msDiff = d.getTime() - this.sDate.getTime();
        var days = msDiff / msPerDay;
        return Math.floor(days);
    }
};