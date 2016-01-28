import test from 'tape';
import Quri from '../src/Quri.js';

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
  const quriInner = new Quri('or');

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

test('test fromJS', (t) => {
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

test('parses a string back into a quri object', (t) => {
  t.plan(1);
  const string = '"field_1".eq("my value"),("field_2".eq("my inner value")|"field_3".eq("my inner value 2"))';
  const quri = Quri.parse(string);
  const object = quri.toJS();

  t.equal(object, {
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
