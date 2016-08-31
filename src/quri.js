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

      if (
        item instanceof Quri ||
        !(item.fieldName || item.field) ||
        !item.operator
      ) {
        return `(${item.toString()})`;
      }

      const fieldName = item.fieldName || item.field;
      const fieldNameString = JSON.stringify(fieldName);
      const operatorString = Quri.operatorToString(item.operator);
      let valueString = JSON.stringify(item.value);

      if (valueString.charAt(0) === '[') {
        // If it's an array we need to remove the [ ] from the outside.
        valueString = valueString.substring(1, valueString.length - 1);
      }
      return `${fieldNameString}.${operatorString}(${valueString})`;
    });

    return criteriaMap.join(this._conjunction === CONJUNCTION_AND ? ',' : '|');
  }

  /**
   * Exports the criteria as a plain JS object.
   *
   * @param {Object} options - Formatting options.
   * @param {bool} options.verbose - If true, output expressions as objects,
   *   otherwise output expressions as arrays. Defaults to false.
   * @param {bool} options.field - If true, export 'field' keys instead of 'fieldName' ones.
   * @returns {Object}
   */
  serialize(options = {}) {
    const object = { criteria: [] };

    if (options.verbose || this._conjunction !== defaultConjunction) {
      object.conjunction = this._conjunction;
    }

    for (const item of this._criteria) {
      if (item instanceof Quri) {
        object.criteria.push(item.serialize(options));
      } else if (
        typeof item === 'string' ||
        !(item.fieldName || item.field) ||
        !item.operator
      ) {
        object.criteria.push(item);
      } else {
        const { operator, value } = item;
        const fieldName = item.fieldName || item.field;

        if (options.verbose) {
          if (options.field) {
            object.criteria.push({ field: fieldName, operator, value });
          } else {
            object.criteria.push({ fieldName, operator, value });
          }
        } else {
          object.criteria.push([fieldName, operator, value]);
        }
      }
    }

    return object;
  }

  /**
   * Alias of `serialize`.
   *
   * @param {Object} options - Formatting options.
   * @param {bool} options.verbose - If true, output expressions as objects,
   *   otherwise output expressions as arrays. Defaults to false.
   * @returns {Object}
   */
  serialise(options) {
    return this.serialize(options);
  }

  /**
   * Convert this Quri instance to a JSON string,
   * using the object returned from `serialize`.
   *
   * @returns {string} The JSON string.
   */
  toJSON() {
    return JSON.stringify(this.serialize());
  }

  /**
   * Alias of `toJSON`.
   *
   * @returns {string} The JSON string.
   */
  stringify() {
    return this.toJSON();
  }

  /**
   * Imports the criteria from a plain JS object.
   *
   * @param {Object} object - The input object.
   * @returns {Quri}
   */
  static deserialize(object) {
    if (!object) { return new Quri(); }

    const quri = new Quri(object.conjunction);

    for (const item of object.criteria) {
      if (item instanceof Quri || item.criteria) {
        // Clone quri instances with deserialize to avoid mutating data.
        // Assume any objects with a criteria property should become Quri instances.
        quri.appendQuri(Quri.deserialize(item));
      } else if ((item.fieldName || item.field) && item.operator) {
        // Assume an expression object
        const { operator, value } = item;
        const fieldName = item.fieldName || item.field;

        quri.appendExpression(fieldName, operator, value);
      } else if (Array.isArray(item) && item.length === 3) {
        // Assume an array with 3 items is an expression.
        const [fieldName, operator, value] = item;

        quri.appendExpression(fieldName, operator, value);
      } else {
        // Assume anything else is a string or toString-able criteria object.
        quri.appendCriteria(item);
      }
    }

    return quri;
  }

  /**
   * Alias of `deserialize`.
   *
   * @param {Object} object - The input object.
   * @returns {Quri}
   */
  static deserialise(object) {
    return Quri.deserialize(object);
  }

  /**
   * Parses a JSON string into a Quri instance.
   *
   * @param {string} json - The JSON string representing serialized Quri data.
   * @returns {Quri} The parsed Quri instance.
   */
  static fromJSON(json) {
    if (!json) { return new Quri(); }

    const object = JSON.parse(json);

    return Quri.deserialize(object);
  }

  /**
   * If given a string, parses it with `fromJSON`, or if given an object,
   * parses it with `deserialize`.
   *
   * @param {string|Object} raw - The JSON string, or serialized quri data.
   * @returns {Quri} The parsed Quri instance.
   */
  static parse(raw) {
    return typeof raw === 'string' ?
      Quri.fromJSON(raw) :
      Quri.deserialize(raw);
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
