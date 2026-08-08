## [1.3.3](https://github.com/forgesworn/toll-booth-announce/compare/v1.3.1...v1.3.3) (2026-08-08)

### Bug Fixes

- Map `ietfPayment` to the valid `['l402', 'lightning']` payment rail. Previously the mapper emitted a `payment` rail absent from the 402-announce allowlist, so any booth config with `ietfPayment` threw at publish time.
- Throw a clear bridge-layer error naming the relevant config fields when no payment methods can be derived and `paymentMethods` is omitted, instead of emitting an empty list that 402-announce rejects.

## [1.3.1](https://github.com/forgesworn/toll-booth-announce/compare/v1.3.0...v1.3.1) (2026-04-12)


### Bug Fixes

* resolve development dependency vulnerabilities ([82ed8be](https://github.com/forgesworn/toll-booth-announce/commit/82ed8be6fa55488595d82d53bc43fe818ade1561))

# [1.3.0](https://github.com/forgesworn/toll-booth-announce/compare/v1.2.1...v1.3.0) (2026-03-24)

## 1.3.4 (2026-08-08)

### Bug Fixes

- map ietfPayment to a valid payment rail and fail clearly on empty methods



## 1.3.2 (2026-04-12)

### Bug Fixes

- pin vite to ^8.0.8, bump picomatch and sjcl (security) (deps)




### Features

* auto-derive IETF Payment method from ietfPayment config ([91c5b09](https://github.com/forgesworn/toll-booth-announce/commit/91c5b09f4fbef1e52f51b4533ba669e6ba2dcc0f))

## [1.2.1](https://github.com/forgesworn/toll-booth-announce/compare/v1.2.0...v1.2.1) (2026-03-20)


### Bug Fixes

* correct copyright to TheCryptoDonkey ([742a575](https://github.com/forgesworn/toll-booth-announce/commit/742a5750ac1ac8cf8d359f819656784317b8807e))

# [1.2.0](https://github.com/forgesworn/toll-booth-announce/compare/v1.1.0...v1.2.0) (2026-03-18)


### Bug Fixes

* update 402-announce to v2 for structured paymentMethods ([91e8345](https://github.com/forgesworn/toll-booth-announce/commit/91e834535fca2a266685e08c4149c843f4de7f93))
* use npm version of 402-announce instead of file reference ([e0adc31](https://github.com/forgesworn/toll-booth-announce/commit/e0adc31a47b5e7f8fb192017e192dbc995726801))


### Features

* rename url to urls field in bridge ([d4ef2db](https://github.com/forgesworn/toll-booth-announce/commit/d4ef2dbf4e9a6b1bcdfd8d50a6edce8c4eba7114))

# [1.1.0](https://github.com/TheCryptoDonkey/toll-booth-announce/compare/v1.0.0...v1.1.0) (2026-03-16)


### Features

* auto-derive payment methods from booth config (xcashu + lightning) ([a90994c](https://github.com/TheCryptoDonkey/toll-booth-announce/commit/a90994c2b4f1a631ebfcef72ddeaaa6286648406))

# 1.0.0 (2026-03-15)


### Features

* add announce function — orchestrates mapping and publishing ([2ed59cd](https://github.com/TheCryptoDonkey/toll-booth-announce/commit/2ed59cd38e04aa2b2d01647c53b514f43cbdc822))
* add config mapper — BoothConfig to AnnounceConfig ([6e529f5](https://github.com/TheCryptoDonkey/toll-booth-announce/commit/6e529f50daf046d4a63169b7a56c4b3dbd30c7eb))
* add slugify utility for d-tag generation ([7589c86](https://github.com/TheCryptoDonkey/toll-booth-announce/commit/7589c865db64bb2014b4eb10bf1ad0465a6a0482))
