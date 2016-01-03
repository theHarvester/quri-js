import test from "tape";
import Criteria from "../src/index.js";

test("test basic string can be created from criteria", (t) => {
  t.plan(1);
  let criteria = new Criteria();
  criteria.appendExpression('field_1', '=', 'my value');
  t.equal('"field_1".eq("my value")', criteria.toString());
});

test("test closure is applied to inner criteria", (t) => {
  t.plan(1);
  let criteria = new Criteria();
  criteria.appendExpression('field_1', '=', 'my value');
  let criteriaInner = new Criteria('or');
  criteriaInner.appendExpression('field_2', '=', 'my inner value');
  criteriaInner.appendExpression('field_3', '=', 'my inner value 2');
  criteria.appendCriteria(criteriaInner);
  t.equal('"field_1".eq("my value"),("field_2".eq("my inner value")|"field_3".eq("my inner value 2"))', criteria.toString(), "is equal");
});

test("test quote escaping works correctly", (t) => {
  t.plan(1);
  let criteria = new Criteria();
  criteria.appendExpression('field"1', '=', 'my"value');
  t.equal('"field\\"1".eq("my\\"value")', criteria.toString());
});

test("test arrays are stringified correctly", (t) => {
  t.plan(1);
  let criteria = new Criteria();
  criteria.appendExpression('field_1', 'not_in', [1,2,3,4]);
  t.equal('"field_1".nin(1,2,3,4)', criteria.toString());
});

test("test supported operator strings", (t) => {
  t.equal('eq', Criteria.operatorToString('=='));
  t.equal('neq', Criteria.operatorToString('!='));
  t.equal('gt', Criteria.operatorToString('>'));
  t.equal('gte', Criteria.operatorToString('>='));
  t.equal('lt', Criteria.operatorToString('<'));
  t.equal('lte', Criteria.operatorToString('<='));
  t.equal('in', Criteria.operatorToString('in'));
  t.equal('nin', Criteria.operatorToString('not_in'));
  t.equal('nin', Criteria.operatorToString('not_in'));
  t.equal('like', Criteria.operatorToString('like'));
  t.equal('between', Criteria.operatorToString('between'));
  t.end();
});