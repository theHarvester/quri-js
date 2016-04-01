# quri-js

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

> JS wrapper for the QURI string specification

## Install

```sh
npm install quri
```

## QURI Spec

More information about the QURI specification and parser is available [here](https://github.com/theHarvester/QURI).

## Usage

### Basic example

```js
import Quri from 'quri';

const quri = new Quri();

quri.toString(); // "field_1".eq("my value")
```

### Nested example

```js
import Quri from 'quri';

const quri = new Quri();

quri.appendExpression('field_1', '==', 'outer');

const nestedQuri = new Quri('or');

nestedQuri.appendExpression('field_2', 'like', 'nested%');
nestedQuri.appendExpression('field_3', 'in', [1, 2, 3, 4]);

quri.appendCriteria(nestedQuri);

quri.toString();
// "field_1".eq("outer"),("field_2".eq("nested%")|"field_3".in(1,2,3,4))
```

### Serialization

```js
import Quri from 'quri';

let quri = new Quri();

quri.appendExpression('field_1', '==', 'my value');

quri.serialize();
// { criteria: [ [ 'field_1', '==', 'my value' ] ] }
quri.serialize({ verbose: true });
// { conjunction: 'and', criteria: [ { field: 'field_1', operator: '==', value: 'my value' } ] }
quri.conjunction
// and
quri.criteria
// [ { field: 'field_1', operator: '==', value: 'my value' } ]

quri = Quri.deserialize({ criteria: [ [ 'field_1', '==', 'my value' ] ] })
quri.toString();
// "field_1".eq("my value")

quri = Quri.deserialize({ criteria: [ { field: 'field_1', operator: '==', value: 'my value' } ] });
quri.toString();
// "field_1".eq("my value")

quri = Quri.deserialize({ conjunction: 'or', criteria: [
  [ 'field_1', '==', 'my value' ],
  [ 'field_2', '==', 'my value 2' ]
] })
quri.toString();
// "field_1".eq("my value")|"field_2".eq("my value 2")

quri = Quri.deserialize({ conjunction: 'or', criteria: [
  { field: 'field_1', operator: '==', value: 'my value' },
  { field: 'field_2', operator: '==', value: 'my value 2' }
] })
quri.toString();
// "field_1".eq("my value")|"field_2".eq("my value 2")
```

## License

MIT © [theHarvester](http://github.com/theHarvester)

[npm-url]: https://npmjs.org/package/quri-js
[npm-image]: https://img.shields.io/npm/v/quri-js.svg?style=flat-square

[travis-url]: https://travis-ci.org/theHarvester/quri-js
[travis-image]: https://img.shields.io/travis/theHarvester/quri-js.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/theHarvester/quri-js
[coveralls-image]: https://img.shields.io/coveralls/theHarvester/quri-js.svg?style=flat-square

[depstat-url]: https://david-dm.org/theHarvester/quri-js
[depstat-image]: https://david-dm.org/theHarvester/quri-js.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/quri-js.svg?style=flat-square
