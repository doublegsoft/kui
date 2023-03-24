"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.AggregateOperator = exports.Dataset = void 0;
var AggregateOperator = /** @class */ (function () {
    function AggregateOperator(operator) {
        this.operator = operator;
    }
    AggregateOperator.COUNT = new AggregateOperator("*");
    AggregateOperator.SUM = new AggregateOperator("+");
    return AggregateOperator;
}());
exports.AggregateOperator = AggregateOperator;
var Dataset = /** @class */ (function () {
    function Dataset(rows) {
        this.transformedRows = new Array();
        this.groupingFields = new Array();
        this.sortingFields = new Array();
        this.aggregatingFields = new Array();
        this.aggregatingOperators = new Array();
        this.rows = rows;
    }
    Dataset.prototype.groupBy = function (fields) {
        this.groupingFields = this.groupingFields.concat(fields);
        return this;
    };
    Dataset.prototype.sortBy = function (fields) {
        this.sortingFields = this.sortingFields.concat(fields);
        return this;
    };
    Dataset.prototype.aggregateBy = function (field, operator) {
        this.aggregatingFields.push(field);
        this.aggregatingOperators.push(operator);
        return this;
    };
    Dataset.prototype.transform = function () {
        var groups = new Map();
        for (var i = 0; i < this.rows.length; i++) {
            var row = this.rows[i];
            var group = this.group(this.groupingFields, row);
            for (var j = 0; j < this.aggregatingFields.length; j++) {
                var aggregateField = this.aggregatingFields[j];
                var aggregateOperator = this.aggregatingOperators[j];
                var aggregateValue = row[aggregateField] || 0;
                groups[group] = groups[group] || {};
                groups[group][aggregateField] = groups[group][aggregateField] || 0;
                for (var m = 0; m < this.groupingFields.length; m++) {
                    groups[group][this.groupingFields[m]] = row[this.groupingFields[m]];
                }
                if (aggregateOperator === AggregateOperator.COUNT) {
                    groups[group][aggregateField] += 1;
                }
                else if (aggregateOperator === AggregateOperator.SUM) {
                    groups[group][aggregateField] += aggregateValue;
                }
            }
        }
        var newGroupName = "";
        for (var j = 0; j < this.groupingFields.length; j++) {
            var groupingField = this.groupingFields[j];
            if (newGroupName !== "") {
                newGroupName += "#";
            }
            newGroupName += groupingField;
        }
        for (var key in groups) {
            var row = __assign({}, groups[key]);
            row[newGroupName] = key;
            this.transformedRows.push(row);
        }
        return this;
    };
    Dataset.prototype.series = function (categories, field) {
        var ret = [];
        for (var i = 0; i < this.transformedRows.length; i++) {
            var srow = [];
            var trow = this.transformedRows[i];
            for (var j = 0; j < categories.length; j++) {
                srow.push(trow[categories[j]]);
            }
            srow.push(trow[field]);
            if (categories.length == 0) {
                ret.push(trow[field]);
            }
            else {
                ret.push(srow);
            }
        }
        return ret;
    };
    Dataset.prototype.treerize = function (fields, valueField) {
        return this.children(fields, 0, null, valueField);
    };
    Dataset.prototype.children = function (levels, index, parentValue, valueField) {
        var ret = new Array();
        var nameField = levels[index];
        var parentField = null;
        if (index > 0) {
            parentField = levels[index - 1];
        }
        var cached = {};
        for (var i = 0; i < this.transformedRows.length; i++) {
            var row = this.transformedRows[i];
            if (parentField == null || row[parentField] === parentValue) {
                var map = new Map();
                map['name'] = row[nameField];
                if (index == levels.length - 1) {
                    map['value'] = row[valueField];
                }
                else {
                    map['children'] = this.children(levels, index + 1, row[nameField], valueField);
                }
                if (!cached[map['name']]) {
                    ret.push(map);
                    cached[map['name']] = map['name'];
                }
            }
        }
        return ret;
    };
    Dataset.prototype.group = function (fields, row) {
        var ret = "";
        for (var j = 0; j < fields.length; j++) {
            var groupingField = fields[j];
            var groupingValue = row[groupingField];
            if (ret !== "") {
                ret += "#";
            }
            ret += groupingValue;
        }
        return ret;
    };
    return Dataset;
}());
exports.Dataset = Dataset;
