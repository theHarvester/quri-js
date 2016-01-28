/**
 * Enum for the possible operator string values.
 *
 * @readonly
 * @enum {string}
 */
export const operators = [
  '=', '==', '===', 'eq',
  '!=', '!==', 'neq',
  '>', 'gt',
  '>=', 'gte',
  '<', 'lt',
  '<=', 'lte',
  'in',
  'not_in', 'nin',
  'like',
  'between',
];


/**
 * Enum for the logical conjunctions used to join expressions.
 *
 * @readonly
 * @enum {string}
 */
export const conjunctions = ['and', 'or'];
export const defaultConjunction = 'and';


/**
 * A class to wrap a QURI string creation.
 *
 * @class Quri
 */
export default class Quri {
  /**
   * Quri constructor
   *
   * @param {conjunctions} conjunction - Sets the logical conjunction (and|or)
   *   for all expressions at this level.
   */
  constructor(conjunction = defaultConjunction) {
    this._conjunction = conjunction;
    this._criteria = [];
  }

  /**
   * Return the logical conjunction (and|or) for this Quri instance.
   *
   * @returns {conjunctions}
   */
  get conjunction() {
    return this._conjunction;
  }

  /**
   * Change the logical conjunction (and|or) for all expressions.
   *
   * @param {conjunctions} conjunction - Sets the logical conjunction (and|or)
   *   for all expressions at this level.
   */
  set conjunction(conjunction = defaultConjunction) {
    this._conjunction = conjunction;
  }

  /**
   * Appends a new expression.
   *
   * @example appendExpression('customer_name', 'like', 'Greg%')
   *
   * @param {string} fieldName - Field name.
   * @param {operators} operator - The operator string.
   * @param {string|number|Array} value - Value(s) that match the operator.
   *   The only operators that allow array values are in|nin.
   * @returns {Quri}
   */
  appendExpression(fieldName, operator, value) {
    this._criteria.push({
      fieldName,
      operator,
      value,
    });
    return this;
  }

  /**
   * Appends a criteria object to the current criteria array.
   *
   * @param {Quri|object|string} criteria - A Quri instance, or any object
   *   with a toString method.
   * @returns {Quri}
   */
  appendCriteria(criteria) {
    this._criteria.push({
      criteria,
    });
    return this;
  }

  /**
   * Alias for appendCriteria.
   *
   * @param {Quri} quri - A Quri instance.
   * @returns {Quri}
   */
  appendQuri(quri) {
    return this.appendCriteria(quri);
  }

  /**
   * Returns the formatted QURI string.
   *
   * @returns {string}
   */
  toString() {
    const criteriaMap = this._criteria.map(item => {
      if (item.criteria != null) {
        return `(${item.criteria.toString()})`;
      }
      const fieldNameString = JSON.stringify(item.fieldName);
      const operatorString = Quri.operatorToString(item.operator);
      let valueString = JSON.stringify(item.value);

      if (valueString.charAt(0) === '[') {
        // If it's an array we need to remove the [ ] from the outside.
        valueString = valueString.substring(1, valueString.length - 1);
      }
      return `${fieldNameString}.${operatorString}(${valueString})`;
    });

    return criteriaMap.join(this._conjunction === 'and' ? ',' : '|');
  }

  /**
   * Parses a QURI string back into a Quri instance.
   *
   * @param {string} string - The formatted QURI string.
   * @returns {Quri}
   */
  static parse(string) {
    const quri = new Quri();

    // TODO: parse the QURI string

    return quri;
  }

  /**
   * Exports the criteria as a plain JS object.
   *
   * @returns {object}
   */
  toJS() {
    const object = { criteria: [] };

    if (this._conjunction !== defaultConjunction) {
      object.conjunction = this._conjunction;
    }

    for (const item of this._criteria) {
      if (item.criteria != null) {
        object.criteria.push(item.criteria.toJS());
      } else {
        const { fieldName, operator, value } = item;

        object.criteria.push([fieldName, operator, value]);
      }
    }

    return object;
  }

  /**
   * Imports the criteria from a plain JS object
   *
   * @param {object} object - The input object
   * @returns {Quri}
   */
  static fromJS(object) {
    const quri = new Quri(object.conjunction);

    for (const item of object.criteria) {
      if (item.criteria) {
        // Assume objects with a criteria property
        // should become Quri instances.
        const innerQuri = Quri.fromJS(item);

        quri.appendQuri(innerQuri);
      } else if (item.length === 3) {
        // Assume an iterable with 3 items is an expression.
        const [fieldName, operator, value] = item;

        quri.appendExpression(fieldName, operator, value);
      } else {
        // Assume anything else is a criteria object.
        quri.appendCriteria(item);
      }
    }

    return quri;
  }

  /**
   * Takes the operator string from the user and returns the corresponding
   * string in the QURI specificiation.
   *
   * @example operatorToString('=='); // 'eq'
   *
   * @param {operators} operator - A valid operator string.
   * @returns {string}
   * @see operators
   */
  static operatorToString(operator) {
    switch (operator) {
      case '=':
      case '==':
      case '===':
      case 'eq':
        return 'eq';

      case '!=':
      case '!==':
      case 'neq':
        return 'neq';

      case '>':
      case 'gt':
        return 'gt';

      case '>=':
      case 'gte':
        return 'gte';

      case '<':
      case 'lt':
        return 'lt';

      case '<=':
      case 'lte':
        return 'lte';

      case 'in':
        return 'in';

      case 'not_in':
      case 'nin':
        return 'nin';

      case 'like':
        return 'like';

      case 'between':
        return 'between';

      default:
        throw new Error(`Unsupported operator '${operator}'`);
    }
  }
}
