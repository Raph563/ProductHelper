# Changelog

## [2.0.0] - 2026-02-19

### Breaking
- Repository finalized as `Raph563/ProductHelper`.
- `NerdCore` is now mandatory at install/update/runtime.
- State file renamed to `config/data/producthelper-addon-state.json`.

### Added
- Runtime registration in `NerdCore` addon registry.
- Settings delegation to NerdCore page (`/stocksettings?nerdcore=1`).
- Docker sidecar support with `REQUIRE_NERDCORE=true`.

### Changed
- Release asset renamed to `producthelper-addon-vX.Y.Z.zip`.
- Install/update/uninstall scripts now compose `custom_js.html` with:
  - `custom_js_nerdcore.html`
  - `custom_js_nerdstats.html`
  - `custom_js_product_helper.html`
- Shell compose/update paths force readable permissions on active payload output.

### Existing product features kept
- OFF/OPF barcode lookup and guided barcode creation.
- Product-form helpers including conversion fraction support.
- Parent product sync safeguards and product status terminal.


