
class AggregateOperator {

  public static readonly COUNT = new AggregateOperator("*");

  public static readonly SUM = new AggregateOperator("+");

  operator: string;

  constructor(operator: string) {
    this.operator = operator;
  }

}

class Dataset {

  rows: Array<any>;

  transformedRows: Array<any> = new Array<any>();

  groupingFields: Array<string> = new Array<string>();

  sortingFields: Array<string> = new Array<string>();

  aggregatingFields: Array<string> = new Array<string>();

  aggregatingOperators: Array<AggregateOperator> = new Array<AggregateOperator>();

  constructor(rows: Array<any>) {
    this.rows = rows;
  }

  public groupBy(fields: string | string[]): Dataset {
    this.groupingFields = this.groupingFields.concat(fields);
    return this;
  }

  public sortBy(fields: string | string[]): Dataset {
    this.sortingFields = this.sortingFields.concat(fields);
    return this;
  }

  public aggregateBy(field: string, operator: AggregateOperator): Dataset {
    this.aggregatingFields.push(field);
    this.aggregatingOperators.push(operator);
    return this;
  }

  public transform(): Dataset {
    let groups = new Map<string, any>();
    for (let i = 0; i < this.rows.length; i++) {
      let row = this.rows[i] as Map<string, any>;
      let group = this.group(this.groupingFields, row);

      for (let j = 0; j < this.aggregatingFields.length; j++) {
        let aggregateField = this.aggregatingFields[j];
        let aggregateOperator = this.aggregatingOperators[j];
        let aggregateValue = row[aggregateField] || 0;
        groups[group] = groups[group] || {};
        groups[group][aggregateField] = groups[group][aggregateField] || 0;
        for (let m = 0; m < this.groupingFields.length; m++) {
          groups[group][this.groupingFields[m]] = row[this.groupingFields[m]];
        }
        if (aggregateOperator === AggregateOperator.COUNT) {
          groups[group][aggregateField] += 1;
        } else if (aggregateOperator === AggregateOperator.SUM) {
          groups[group][aggregateField] += aggregateValue;
        }
      }
    }
    let newGroupName = "";
    for (let j = 0; j < this.groupingFields.length; j++) {
      let groupingField = this.groupingFields[j];
      if (newGroupName !== "") {
        newGroupName += "#";
      }
      newGroupName += groupingField;
    }
    for (let key in groups) {
      let row = {...groups[key]};
      row[newGroupName] = key;
      this.transformedRows.push(row);
    }
    return this;
  }

  public series(categories: string[], field: string): Array<any> {
    let ret = [];
    for (let i = 0; i < this.transformedRows.length; i++) {
      let srow = [];
      let trow = this.transformedRows[i];
      for (let j = 0; j < categories.length; j++) {
        srow.push(trow[categories[j]]);
      }
      srow.push(trow[field]);
      if (categories.length == 0) {
        ret.push(trow[field]);
      } else {
        ret.push(srow);
      }
    }
    return ret;
  }

  public treerize(fields: string[], valueField: string): Array<Map<string, any>> {
    return this.children(fields, 0, null, valueField);
  }

  private children(levels: Array<string>, index: number, parentValue: string, valueField: string): Array<Map<string, any>> {
    let ret = new Array<Map<string, any>>();
    let nameField = levels[index];
    let parentField = null;
    if (index > 0) {
      parentField = levels[index - 1];
    }
    let cached = {};
    for (let i = 0; i < this.transformedRows.length; i++) {
      let row = this.transformedRows[i];
      if (parentField == null || row[parentField] === parentValue) {
        let map = new Map<string, any>();
        map['name'] = row[nameField];
        if (index == levels.length - 1) {
          map['value'] = row[valueField];
        } else {
          map['children'] = this.children(levels, index + 1, row[nameField], valueField);
        }
        if (!cached[map['name']]) {
          ret.push(map);
          cached[map['name']] = map['name'];
        }
      }
    }
    return ret;
  }

  private group(fields: Array<string>, row: Map<string, any>): string {
    let ret = "";
    for (let j = 0; j < fields.length; j++) {
      let groupingField = fields[j];
      let groupingValue = row[groupingField];
      if (ret !== "") {
        ret += "#";
      }
      ret += groupingValue;
    }
    return ret;
  }
}

export {Dataset, AggregateOperator};