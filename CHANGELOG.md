# Changelog

## [1.2.1] - 2026-02-19

- Fixed shell compose permission handling so `config/data/custom_js.html` stays readable by Grocy runtime even when install/update/uninstall scripts are executed as `root` with restrictive umask.
- Applied to:
  - `addon/scripts/install.sh`
  - `addon/scripts/uninstall.sh`
  - `addon/scripts/update-from-github.sh`
  - `addon/docker-sidecar/entrypoint.sh`

## [1.2.0] - 2026-02-19

- GitHub install/update/uninstall flows now support co-install with `Raph563/Grocy`:
  - this addon writes its own payload file (`config/data/custom_js_product_helper.html`);
  - active Grocy file is composed (`config/data/custom_js.html`) from installed payload sources.
- Docker sidecar now follows the same payload + compose model by default.
- Export scripts now prefer addon-specific payload files before fallback to `custom_js.html`.
- `Raph563/Grocy_Product_Helper` can now be installed independently or together with `Raph563/Grocy` without payload overwrite.

## [1.1.0] - 2026-02-19

- Product form: parent mode sync no longer auto-forces userfield parent mode when `no_own_stock` is turned off (non-parent case).
- Barcode robot (product header):
  - advanced OFF/OPF lookup now stops at card suggestion stage;
  - barcode is created only after explicit user selection (click on the suggested card button).
- Product-specific quantity conversion form:
  - added fraction helper input (`1/6`, `2/3`, `6/1`);
  - auto-converts valid fractions to decimal `factor` values before submit;
  - validates fraction input to block invalid save attempts.

## [1.0.0] - 2026-02-19

- Initial standalone release for `Grocy_Product_Helper`.
- Product features split from stats/charts line:
  - OFF/OPF provider tools
  - barcode robot flow
  - photo search/import helpers
  - product helper status terminal
- Added dedicated release asset naming:
  - `grocy-product-helper-addon-vX.Y.Z.zip`
- Added dedicated state file naming:
  - `grocy-product-helper-state.json`
