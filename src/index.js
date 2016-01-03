/**
 * @class Criteria
 *
 * A class to wrap a QURI string creation
 */
export default class Criteria {
  /**
   * Criteria constructor
   *
   * @param andOr Sets the and|or for all expressions at this level
   */
  constructor(andOr = 'and') {
    this.andOr = andOr;
    this.criteria = [];
  }

  /**
   * Appends a new expression.
   *
   * @example appendExpression('customer_name', 'like', 'Greg%')
   *
   * @param {string} fieldName Field name
   * @param {string} operator Operator like '==', '!=', 'like', '>=', etc.
   * @param {string,number,array} value Value(s) that match the operator.
   * The only operators that allow array values are in|out|nin
   */
  appendExpression(fieldName, operator, value) {
    this.criteria.push({
      fieldName:fieldName,
      operator:operator,
      value:value
    });
  }

  /**
   * Appends a criteria object to the current criteria array.
   * The criteria object may be a new Criteria class or any object with a toString method.
   *
   * @param {Criteria} criteria
   */
  appendCriteria(criteria) {
    this.criteria.push({
      criteria:criteria
    });
  }

  /**
   * Returns the formatted QURI string
   *
   * @returns {string}
   */
  toString() {
    let criteriaMap = this.criteria.map(expression => {
      if(expression.hasOwnProperty('criteria')){
        return '(' + expression.criteria.toString() + ')';
      }
      let operator = Criteria.operatorToString(expression.operator);
      return JSON.stringify(expression.fieldName) + '.' + operator + '(' + JSON.stringify(expression.value) + ')';
    });
    return criteriaMap.join(this.andOr == 'and' ? ',' : '|');
  }

  /**
   * Takes the operator string from the user and returns the corresponding string in the QURI specificiation.
   *
   * @example operatorToString('=='); // 'eq'
   *
   * @param {string} operatorStr
   * @returns {string}
   */
  static operatorToString(operatorStr) {
    switch (operatorStr){
      case '=':
      case '==':
      case 'eq':
        return 'eq';
        break;
    }
  }
}