# quri-js

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

> JS wrapper for the QURI string specification

## Install

```sh
npm i -D quri
```

## QURI Spec

More information about the QURI specification and parser is available [here](https://github.com/theHarvester/QURI).

## Usage

Basic example

```js
import Criteria from "../src/index.js";

let criteria = new Criteria();

criteria.toString(); // "field_1".eq("my value")
```

Nested example

```js
let criteria = new Criteria();
criteria.appendExpression('field_1', '==', 'outer');

let nestedCriteria = new Criteria('or');
nestedCriteria.appendExpression('field_2', 'like', 'nested%');
nestedCriteria.appendExpression('field_3', 'in', [1,2,3,4]);

criteria.appendCriteria(nestedCriteria);

criteria.toString();
// "field_1".eq("outer"),("field_2".eq("nested%")|"field_3".in(1,2,3,4))
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
