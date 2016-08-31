import { expect } from 'chai';
import Quri, {
  CONJUNCTION_AND,
  CONJUNCTION_OR,
} from '../src/Quri.js';


describe('Quri', () => {
  it('should create a basic string from criteria', () => {
    const quri = new Quri();

    quri.appendExpression('field_1', '=', 'my value');
    const string = quri.toString();

    expect(string).to.equal('"field_1".eq("my value")');
  });

  it('should apply closure to inner criteria', () => {
    const quri = new Quri();
    const quriInner = new Quri(CONJUNCTION_OR);

    quri.appendExpression('field_1', '=', 'my value');
    quriInner.appendExpression('field_2', '=', 'my inner value');
    quriInner.appendExpression('field_3', '=', 'my inner value 2');
    quri.appendCriteria(quriInner);
    const string = quri.toString();

    expect(string).to.equal(
      '"field_1".eq("my value"),("field_2".eq("my inner value")|' +
      '"field_3".eq("my inner value 2"))'
    );
  });

  it('should get conjunction', () => {
    const quri = new Quri(CONJUNCTION_AND);

    expect(quri.conjunction).to.equal(CONJUNCTION_AND);
  });

  it('should set conjunction', () => {
    const quri = new Quri(CONJUNCTION_AND);

    quri.appendExpression('field_1', '=', 'my value');
    quri.appendExpression('field_2', '=', 'my value 2');
    quri.conjunction = CONJUNCTION_OR;
    const string = quri.toString();

    expect(quri.conjunction).to.equal(CONJUNCTION_OR);
    expect(string).to.equal(
      '"field_1".eq("my value")|"field_2".eq("my value 2")'
    );
  });

  it('should get criteria', () => {
    const quri = new Quri();

    quri.appendExpression('field_1', '=', 'my value');
    quri.appendExpression('field_2', '=', 'my value 2');

    expect(quri.criteria).to.deep.equal([
      { fieldName: 'field_1', operator: '=', value: 'my value' },
      { fieldName: 'field_2', operator: '=', value: 'my value 2' },
    ]);
  });

  it('should escape quotes', () => {
    const quri = new Quri();

    quri.appendExpression('field"1', '=', 'my"value');
    const string = quri.toString();

    expect(string).to.equal('"field\\"1".eq("my\\"value")');
  });

  it('should stringify arrays correctly', () => {
    const quri = new Quri();

    quri.appendExpression('field_1', 'not_in', [1, 2, 3, 4]);
    const string = quri.toString();

    expect(string).to.equal('"field_1".nin(1,2,3,4)');
  });

  it('should support operator strings', () => {
    expect(Quri.operatorToString('=')).to.equal('eq');
    expect(Quri.operatorToString('==')).to.equal('eq');
    expect(Quri.operatorToString('===')).to.equal('eq');
    expect(Quri.operatorToString('eq')).to.equal('eq');

    expect(Quri.operatorToString('!=')).to.equal('neq');
    expect(Quri.operatorToString('!==')).to.equal('neq');
    expect(Quri.operatorToString('neq')).to.equal('neq');

    expect(Quri.operatorToString('>')).to.equal('gt');
    expect(Quri.operatorToString('gt')).to.equal('gt');

    expect(Quri.operatorToString('>=')).to.equal('gte');
    expect(Quri.operatorToString('gte')).to.equal('gte');

    expect(Quri.operatorToString('<')).to.equal('lt');
    expect(Quri.operatorToString('lt')).to.equal('lt');

    expect(Quri.operatorToString('<=')).to.equal('lte');
    expect(Quri.operatorToString('lte')).to.equal('lte');

    expect(Quri.operatorToString('in')).to.equal('in');

    expect(Quri.operatorToString('not_in')).to.equal('nin');
    expect(Quri.operatorToString('nin')).to.equal('nin');

    expect(Quri.operatorToString('like')).to.equal('like');

    expect(Quri.operatorToString('between')).to.equal('between');
  });

  describe('serialize', () => {
    let quri;
    let quriInner;
    let object;

    before(() => {
      quri = new Quri();
      quriInner = new Quri('or');
      quri.appendExpression('field_1', '=', 'my value');
      quriInner.appendExpression('field_2', '=', 'my inner value');
      quriInner.appendExpression('field_3', '=', 'my inner value 2');
      quri.appendCriteria(quriInner);
      object = quri.serialize();
    });

    it('should serialize', () => {
      expect(object).to.deep.equal({
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

    it('should serialize with verbose option', () => {
      const verboseObject = quri.serialize({ verbose: true });

      expect(verboseObject).to.deep.equal({
        conjunction: 'and',
        criteria: [
          { fieldName: 'field_1', operator: '=', value: 'my value' },
          {
            conjunction: 'or',
            criteria: [
              { fieldName: 'field_2', operator: '=', value: 'my inner value' },
              { fieldName: 'field_3', operator: '=', value: 'my inner value 2' },
            ],
          },
        ],
      });
    });

    it('should serialize with verbose option and field option', () => {
      const verboseObject = quri.serialize({ verbose: true, field: true });

      expect(verboseObject).to.deep.equal({
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

    it('should be aliased as serialise', () => {
      expect(quri.serialise()).to.deep.equal(object);
    });
  });

  describe('toJSON', () => {
    const expectedJson = '{"criteria":[["field_1","=","my value"],' +
      '{"criteria":[["field_2","=","my inner value"],' +
      '["field_3","=","my inner value 2"]],"conjunction":"or"}]}';
    let quri;
    let quriInner;
    let json;

    before(() => {
      quri = new Quri();
      quriInner = new Quri('or');

      quri.appendExpression('field_1', '=', 'my value');
      quriInner.appendExpression('field_2', '=', 'my inner value');
      quriInner.appendExpression('field_3', '=', 'my inner value 2');
      quri.appendCriteria(quriInner);
      json = quri.toJSON();
    });

    it('should create json string', () => {
      expect(json).to.equal(expectedJson);
    });

    it('should be aliased as stringify', () => {
      expect(quri.stringify()).to.equal(json);
    });
  });

  describe('deserialize', () => {
    describe('with array values', () => {
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
      let quri;
      let string;

      before(() => {
        quri = Quri.deserialize(object);
        string = quri.toString();
      });

      it('should deserialize with array values', () => {
        expect(string).to.equal(
          '"field_1".eq("my value"),("field_2".eq("my inner value")|' +
          '"field_3".eq("my inner value 2"))'
        );
      });

      it('should be aliased as deserialise', () => {
        expect(Quri.deserialise(object).toString()).to.equal(string);
      });
    });

    it('should handle object values', () => {
      const object = {
        criteria: [
          { fieldName: 'field_1', operator: '=', value: 'my value' },
          {
            conjunction: 'or',
            criteria: [
              { fieldName: 'field_2', operator: '=', value: 'my inner value' },
              { fieldName: 'field_3', operator: '=', value: 'my inner value 2' },
            ],
          },
        ],
      };
      const quri = Quri.deserialize(object);
      const string = quri.toString();

      expect(string).to.equal(
        '"field_1".eq("my value"),("field_2".eq("my inner value")|' +
        '"field_3".eq("my inner value 2"))'
      );
    });

    it("should handle object values with shorter 'field' keys", () => {
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
      const quri = Quri.deserialize(object);
      const string = quri.toString();

      expect(string).to.equal(
        '"field_1".eq("my value"),("field_2".eq("my inner value")|' +
        '"field_3".eq("my inner value 2"))'
      );
    });

    it('should handle Quri instance nested inside', () => {
      const innerQuri = new Quri(CONJUNCTION_OR);

      innerQuri.appendExpression('field_2', '=', 'my inner value');
      innerQuri.appendExpression('field_3', '=', 'my inner value 2');

      const object = {
        criteria: [
          { fieldName: 'field_1', operator: '=', value: 'my value' },
          innerQuri,
        ],
      };
      const quri = Quri.deserialize(object);
      const string = quri.toString();

      expect(string).to.equal(
        '"field_1".eq("my value"),("field_2".eq("my inner value")|' +
        '"field_3".eq("my inner value 2"))'
      );
    });

    it('should handle a quri instance and return a clone of it', () => {
      const quri = new Quri();
      const innerQuri = new Quri(CONJUNCTION_OR);

      quri.appendExpression('field_1', '=', 'my value');
      innerQuri.appendExpression('field_2', '=', 'my inner value');
      innerQuri.appendExpression('field_3', '=', 'my inner value 2');
      quri.appendQuri(innerQuri);

      const string = quri.toString();
      const clonedQuri = Quri.deserialize(quri);

      expect(clonedQuri).to.not.equal(quri);
      expect(clonedQuri).to.deep.equal(quri);

      innerQuri.appendExpression('field_4', 'is', 'side effect');

      expect(clonedQuri.toString()).to.equal(string);
    });

    it('should handle null', () => {
      expect(Quri.deserialize(null).toString()).to.be.empty;
    });

    it('should handle undefined', () => {
      expect(Quri.deserialize().toString()).to.be.empty;
    });
  });

  describe('fromJSON', () => {
    const json = '{"criteria":[["field_1","=","my value"],' +
      '{"criteria":[["field_2","=","my inner value"],' +
      '["field_3","=","my inner value 2"]],"conjunction":"or"}]}';
    let quri;
    let string;

    before(() => {
      quri = Quri.fromJSON(json);
      string = quri.toString();
    });

    it('should parse json into quri instance', () => {
      expect(quri).to.be.instanceof(Quri);
      expect(string).to.equal(
        '"field_1".eq("my value"),("field_2".eq("my inner value")|' +
        '"field_3".eq("my inner value 2"))'
      );
    });

    it('should be aliased as parse', () => {
      expect(Quri.parse(json).toString()).to.equal(string);
    });
  });

  describe('parse', () => {
    it('should parse json into quri instance', () => {
      const json = '{"criteria":[["field_1","=","my value"],' +
      '{"criteria":[["field_2","=","my inner value"],' +
      '["field_3","=","my inner value 2"]],"conjunction":"or"}]}';
      const quri = Quri.parse(json);
      const string = quri.toString();

      expect(quri).to.be.instanceof(Quri);
      expect(string).to.equal(
        '"field_1".eq("my value"),("field_2".eq("my inner value")|' +
        '"field_3".eq("my inner value 2"))'
      );
    });

    it('should deserialize from an object into a quri instance', () => {
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
      const quri = Quri.parse(object);
      const string = quri.toString();

      expect(string).to.equal(
        '"field_1".eq("my value"),("field_2".eq("my inner value")|' +
        '"field_3".eq("my inner value 2"))'
      );
    });
  });

  it('throws an error for unknown operators', () => {
    const quri = new Quri();
    const toStringAttempt = () => quri.toString();

    quri.appendExpression('field_1', 'foo', 'my value');

    expect(toStringAttempt).to.throw(Error);
  });
});
