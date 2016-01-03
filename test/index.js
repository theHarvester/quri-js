import test from "tape";
import Criteria from "../src/index.js";

test("test basic string can be created from criteria", (t) => {
  t.plan(1);
  let criteria = new Criteria();
  criteria.appendExpression('field_1', '=', 'my value');
  t.equal('"field_1".eq("my value")', criteria.toString(), "is equal");
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
  t.equal('"field\\"1".eq("my\\"value")', criteria.toString(), "is equal");
});
