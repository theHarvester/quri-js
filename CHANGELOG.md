<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
# Changelog

- [v2.1.0](#v210)
- [v2.0.1](#v201)
- [v2.0.0](#v200)
- [v1.1.0](#v110)
- [v1.0.3](#v103)
- [v1.0.2](#v102)
- [v1.0.0](#v100)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### v2.1.0

  * Re-renamed `field` back to `fieldName` (undid the variable rename from ce90b0e).
  * Updated `deserialize`/`serialize`/`toString` to use the `fieldName` key,
    but fall back to the `field` key.
  * Added a `field` option to `serialize` if the shorter key is desired.
  * Added extra tests for both of the variations.

### v2.0.1

  * Fixed named exports in module.

### v2.0.0

  * Renamed `toJS`/`fromJS` to `serialize`/`deserialize` to remove unexpected
    side effects when Quri instances are stored inside [Immutable.js][immutable]
    data structures.
  * Added `toJSON`/`fromJSON` for easier JSON string handling.
  * Added `parse` to handle either strings with `fromJSON` or objects with `deserialize`
  * Aliased `serialize`/`deserialize` as `serialise`/`deserialise`
  * Aliased `toJSON` as `stringify`

### v1.1.0

  * Fixed inconsistent behaviour of `toJS`/`fromJS`.
  * Updated `fromJS` to handle null/undefined with a new Quri instance.
  * Calling `fromJS` on an existing Quri instance will return a clone of the
    original.

### v1.0.3

  * Expanded `fromJS` to handle object format on input data.
  * Added verbose (object format) option to `toJS`.
  * Added constants.

### v1.0.2

  * Renamed class from `Criteria` to `Quri`.
  * `toJS`/`fromJS` added for object serialization.
  * Chaining support.

### v1.0.0

  * quri-js initial commit.

[immutable]: https://facebook.github.io/immutable-js/
