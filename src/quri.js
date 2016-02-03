/**
 * Enum for the possible operator string values.
 *
 * @readonly
 * @enum {string}
 */
export const OPERATOR_EQ = 'eq';
export const OPERATOR_NEQ = 'neq';
export const OPERATOR_GT = 'gt';
export const OPERATOR_GTE = 'gte';
export const OPERATOR_LT = 'lt';
export const OPERATOR_LTE = 'lte';
export const OPERATOR_IN = 'in';
export const OPERATOR_NIN = 'nin';
export const OPERATOR_LIKE = 'like';
export const OPERATOR_BETWEEN = 'between';
export const operators = [
  '=', '==', '===', OPERATOR_EQ,
  '!=', '!==', OPERATOR_NEQ,
  '>', OPERATOR_GT,
  '>=', OPERATOR_GTE,
  '<', OPERATOR_LT,
  '<=', OPERATOR_LTE,
  OPERATOR_IN,
  'not_in', OPERATOR_NIN,
  OPERATOR_LIKE,
  OPERATOR_BETWEEN,
];


/**
 * Enum for the logical conjunctions used to join expressions.
 *
 * @readonly
 * @enum {string}
 */
export const CONJUNCTION_AND = 'and';
export const CONJUNCTION_OR = 'or';
export const conjunctions = [CONJUNCTION_AND, CONJUNCTION_OR];
export const defaultConjunction = CONJUNCTION_AND;


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
   * Return an array copy of the expressions
   *
   * @returns {Array}
   */
  get criteria() {
    return this._criteria.slice(0);
  }

  /**
   * Appends a new expression.
   *
   * @example appendExpression('customer_name', 'like', 'Greg%')
   *
   * @param {string} field - Field name.
   * @param {operators} operator - The operator string.
   * @param {string|number|Array} value - Value(s) that match the operator.
   *   The only operators that allow array values are in|nin.
   * @returns {Quri}
   */
  appendExpression(field, operator, value) {
    this._criteria.push({
      field,
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
    this._criteria.push(criteria);
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
      if (typeof item === 'string') {
        return `(${item})`;
      }

      if (item instanceof Quri || !item.field || !item.operator) {
        return `(${item.toString()})`;
      }

      const fieldString = JSON.stringify(item.field);
      const operatorString = Quri.operatorToString(item.operator);
      let valueString = JSON.stringify(item.value);

      if (valueString.charAt(0) === '[') {
        // If it's an array we need to remove the [ ] from the outside.
        valueString = valueString.substring(1, valueString.length - 1);
      }
      return `${fieldString}.${operatorString}(${valueString})`;
    });

    return criteriaMap.join(this._conjunction === CONJUNCTION_AND ? ',' : '|');
  }

  /**
   * Exports the criteria as a plain JS object.
   *
   * @returns {object}
   * @param {object} options - Formatting options.
   * @param {bool} options.verbose - If true, output expressions as objects,
   *   otherwise output expressions as arrays. Defaults to false.
   */
  toJS(options = {}) {
    const object = { criteria: [] };

    if (options.verbose || this._conjunction !== defaultConjunction) {
      object.conjunction = this._conjunction;
    }

    for (const item of this._criteria) {
      if (item instanceof Quri) {
        object.criteria.push(item.toJS(options));
      } else if (typeof item === 'string' || !item.field || !item.operator) {
        object.criteria.push(item);
      } else {
        const { field, operator, value } = item;

        if (options.verbose) {
          object.criteria.push({ field, operator, value });
        } else {
          object.criteria.push([field, operator, value]);
        }
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
    if (!object) { return new Quri(); }

    const quri = new Quri(object.conjunction);

    for (const item of object.criteria) {
      if (item instanceof Quri || item.criteria) {
        // Clone quri instances with fromJS to avoid mutating data.
        // Assume any objects with a criteria property should become Quri instances.
        quri.appendQuri(Quri.fromJS(item));
      } else if (item.field && item.operator) {
        // Assume an expression object
        const { field, operator, value } = item;

        quri.appendExpression(field, operator, value);
      } else if (Array.isArray(item) && item.length === 3) {
        // Assume an array with 3 items is an expression.
        const [field, operator, value] = item;

        quri.appendExpression(field, operator, value);
      } else {
        // Assume anything else is a string or toString-able criteria object.
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
      case OPERATOR_EQ:
        return OPERATOR_EQ;

      case '!=':
      case '!==':
      case OPERATOR_NEQ:
        return OPERATOR_NEQ;

      case '>':
      case OPERATOR_GT:
        return OPERATOR_GT;

      case '>=':
      case OPERATOR_GTE:
        return OPERATOR_GTE;

      case '<':
      case OPERATOR_LT:
        return OPERATOR_LT;

      case '<=':
      case OPERATOR_LTE:
        return OPERATOR_LTE;

      case OPERATOR_IN:
        return OPERATOR_IN;

      case 'not_in':
      case OPERATOR_NIN:
        return OPERATOR_NIN;

      case OPERATOR_LIKE:
        return OPERATOR_LIKE;

      case OPERATOR_BETWEEN:
        return OPERATOR_BETWEEN;

      default:
        throw new Error(`Unsupported operator '${operator}'`);
    }
  }
}
