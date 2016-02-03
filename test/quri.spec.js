import test from 'tape';
import Quri, {
  CONJUNCTION_AND,
  CONJUNCTION_OR,
} from '../src/Quri.js';

test('test basic string can be created from criteria', (t) => {
  t.plan(1);
  const quri = new Quri();

  quri.appendExpression('field_1', '=', 'my value');
  const string = quri.toString();

  t.equal(string, '"field_1".eq("my value")');
});

test('test closure is applied to inner criteria', (t) => {
  t.plan(1);
  const quri = new Quri();
  const quriInner = new Quri(CONJUNCTION_OR);

  quri.appendExpression('field_1', '=', 'my value');
  quriInner.appendExpression('field_2', '=', 'my inner value');
  quriInner.appendExpression('field_3', '=', 'my inner value 2');
  quri.appendCriteria(quriInner);
  const string = quri.toString();

  t.equal(
    string,
    '"field_1".eq("my value"),("field_2".eq("my inner value")|"field_3".eq("my inner value 2"))'
  );
});

test('test get conjunction', (t) => {
  t.plan(1);
  const quri = new Quri(CONJUNCTION_AND);

  t.equal(quri.conjunction, CONJUNCTION_AND);
});

test('test set conjunction', (t) => {
  t.plan(2);
  const quri = new Quri(CONJUNCTION_AND);

  quri.appendExpression('field_1', '=', 'my value');
  quri.appendExpression('field_2', '=', 'my value 2');
  quri.conjunction = CONJUNCTION_OR;
  const string = quri.toString();

  t.equal(quri.conjunction, CONJUNCTION_OR);
  t.equal(string, '"field_1".eq("my value")|"field_2".eq("my value 2")');
});

test('test get criteria', (t) => {
  t.plan(1);
  const quri = new Quri();

  quri.appendExpression('field_1', '=', 'my value');
  quri.appendExpression('field_2', '=', 'my value 2');

  t.deepEqual(quri.criteria, [
    { field: 'field_1', operator: '=', value: 'my value' },
    { field: 'field_2', operator: '=', value: 'my value 2' },
  ]);
});

test('test quote escaping works correctly', (t) => {
  t.plan(1);
  const quri = new Quri();

  quri.appendExpression('field"1', '=', 'my"value');
  const string = quri.toString();

  t.equal(string, '"field\\"1".eq("my\\"value")');
});

test('test arrays are stringified correctly', (t) => {
  t.plan(1);
  const quri = new Quri();

  quri.appendExpression('field_1', 'not_in', [1, 2, 3, 4]);
  const string = quri.toString();

  t.equal(string, '"field_1".nin(1,2,3,4)');
});

test('test supported operator strings', (t) => {
  t.equal(Quri.operatorToString('='), 'eq');
  t.equal(Quri.operatorToString('=='), 'eq');
  t.equal(Quri.operatorToString('==='), 'eq');
  t.equal(Quri.operatorToString('eq'), 'eq');

  t.equal(Quri.operatorToString('!='), 'neq');
  t.equal(Quri.operatorToString('!=='), 'neq');
  t.equal(Quri.operatorToString('neq'), 'neq');

  t.equal(Quri.operatorToString('>'), 'gt');
  t.equal(Quri.operatorToString('gt'), 'gt');

  t.equal(Quri.operatorToString('>='), 'gte');
  t.equal(Quri.operatorToString('gte'), 'gte');

  t.equal(Quri.operatorToString('<'), 'lt');
  t.equal(Quri.operatorToString('lt'), 'lt');

  t.equal(Quri.operatorToString('<='), 'lte');
  t.equal(Quri.operatorToString('lte'), 'lte');

  t.equal(Quri.operatorToString('in'), 'in');

  t.equal(Quri.operatorToString('not_in'), 'nin');
  t.equal(Quri.operatorToString('nin'), 'nin');

  t.equal(Quri.operatorToString('like'), 'like');

  t.equal(Quri.operatorToString('between'), 'between');

  t.end();
});

test('test toJS', (t) => {
  t.plan(1);
  const quri = new Quri();
  const quriInner = new Quri('or');

  quri.appendExpression('field_1', '=', 'my value');
  quriInner.appendExpression('field_2', '=', 'my inner value');
  quriInner.appendExpression('field_3', '=', 'my inner value 2');
  quri.appendCriteria(quriInner);
  const object = quri.toJS();

  t.deepEqual(object, {
    criteria: [
      ['field_1', '=', 'my value'],
      {
        conjunction: 'or',
        criteria: [
          ['field_2', '=', 'my inner value'],
          ['field_3', '=', 'my inner value 2'],
        ],
      },
    ],
  });
});

test('test toJS with verbose option', (t) => {
  t.plan(1);
  const quri = new Quri();
  const quriInner = new Quri('or');

  quri.appendExpression('field_1', '=', 'my value');
  quriInner.appendExpression('field_2', '=', 'my inner value');
  quriInner.appendExpression('field_3', '=', 'my inner value 2');
  quri.appendCriteria(quriInner);
  const object = quri.toJS({ verbose: true });

  t.deepEqual(object, {
    conjunction: 'and',
    criteria: [
      { field: 'field_1', operator: '=', value: 'my value' },
      {
        conjunction: 'or',
        criteria: [
          { field: 'field_2', operator: '=', value: 'my inner value' },
          { field: 'field_3', operator: '=', value: 'my inner value 2' },
        ],
      },
    ],
  });
});

test('test fromJS with array values', (t) => {
  t.plan(1);
  const object = {
    criteria: [
      ['field_1', '=', 'my value'],
      {
        conjunction: 'or',
        criteria: [
          ['field_2', '=', 'my inner value'],
          ['field_3', '=', 'my inner value 2'],
        ],
      },
    ],
  };
  const quri = Quri.fromJS(object);
  const string = quri.toString();

  t.equal(
    string,
    '"field_1".eq("my value"),("field_2".eq("my inner value")|"field_3".eq("my inner value 2"))'
  );
});

test('test fromJS with object values', (t) => {
  t.plan(1);
  const object = {
    criteria: [
      { field: 'field_1', operator: '=', value: 'my value' },
      {
        conjunction: 'or',
        criteria: [
          { field: 'field_2', operator: '=', value: 'my inner value' },
          { field: 'field_3', operator: '=', value: 'my inner value 2' },
        ],
      },
    ],
  };
  const quri = Quri.fromJS(object);
  const string = quri.toString();

  t.equal(
    string,
    '"field_1".eq("my value"),("field_2".eq("my inner value")|"field_3".eq("my inner value 2"))'
  );
});

test('test fromJS with Quri instance nested inside', (t) => {
  t.plan(1);
  const innerQuri = new Quri(CONJUNCTION_OR);

  innerQuri.appendExpression('field_2', '=', 'my inner value');
  innerQuri.appendExpression('field_3', '=', 'my inner value 2');

  const object = {
    criteria: [
      { field: 'field_1', operator: '=', value: 'my value' },
      innerQuri,
    ],
  };
  const quri = Quri.fromJS(object);
  const string = quri.toString();

  t.equal(
    string,
    '"field_1".eq("my value"),("field_2".eq("my inner value")|"field_3".eq("my inner value 2"))'
  );
});

test('test fromJS with quri instance returns a clone of the quri instance', (t) => {
  t.plan(3);
  const quri = new Quri();
  const innerQuri = new Quri(CONJUNCTION_OR);

  quri.appendExpression('field_1', '=', 'my value');
  innerQuri.appendExpression('field_2', '=', 'my inner value');
  innerQuri.appendExpression('field_3', '=', 'my inner value 2');
  quri.appendQuri(innerQuri);

  const string = quri.toString();
  const parsedQuri = Quri.fromJS(quri);

  t.deepEqual(parsedQuri, quri);

  innerQuri.appendExpression('field_4', 'is', 'side effect');

  t.equal(parsedQuri.toString(), string);
  t.notDeepEqual(parsedQuri, quri);
});

test('test fromJS with null/undefined', (t) => {
  t.plan(2);
  t.equal(Quri.fromJS(null).toString(), '');
  t.equal(Quri.fromJS().toString(), '');
});

test('throws error for unknown operators', (t) => {
  t.plan(1);
  let hasError = false;
  const quri = new Quri();

  quri.appendExpression('field_1', 'foo', 'my value');

  try {
    quri.toString();
  } catch (error) {
    hasError = true;
  }

  t.equal(hasError, true, 'throws error');
});
