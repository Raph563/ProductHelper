# Changelog

## [4.0.3] - 2026-02-26

### Added
- Product quantity-unit conversion presets now save directly to database on click (no manual form submit needed).
- Added readable fraction rendering in product conversion list (1/6, 1/3) when value approximates a simple fraction.

### Changed
- Preset buttons are disabled until conversion context is valid (from, to, product, and from != to).
- Product edit header layout updated: OFF/OPF/Google/retry actions moved to the right of the title; robot action remains in barcode section.
- Active checkbox is now mirrored near the product title without label text (synced with original field).
- Robot card now displays direct source page link (OFF/OPF) inside card metadata.
- Conversion factor up/down controls are styled inside factor input area in embedded conversion form.

### Fixed
- Parent conversion table now updates in place after preset save (no full parent page reload).

## [4.0.2] - 2026-02-20

### Fixed
- Removed heavy overlay MutationObserver re-apply loop on ProductHelper settings page.
- Overlay visibility is now enforced once without persistent observers, preventing browser freeze on `/stocksettings?producthelper=1`.

## [4.0.1] - 2026-02-20

### Fixed
- Hardened legacy-settings compatibility for ProductHelper settings overlay:
  - keeps overlay visible while open even if external scripts toggle classes/styles;
  - restores overlay if removed from DOM by external "hide legacy addon UI" logic.

## [4.0.0] - 2026-02-20

### Added
- Full parent/sub-brand data model in Grocy master data:
  - new userentity `Liens_marques`,
  - new userfields on `Liens_marques`: `Marque_parente`, `Sous_marque`, `Actif`.
- New `Liens marques` entry injected in Grocy manage-data dropdown (native page).
- Brand-link migration tooling:
  - automatic first-run migration from existing `products -> Marque/Sous_marque`,
  - manual rerun button in ProductHelper settings page.
- Product form enhancements:
  - new `Robot Marque` button on brand field,
  - new quick button to open `Liens marques` page.

### Changed
- Brand sync now handles both:
  - `products -> Marque` to `Marques`,
  - `products -> (Marque, Sous_marque)` to `Liens_marques` (deduplicated pair key).
- Product form now auto-fills parent brand when `Sous_marque` matches an active link.
- Conflict-safe behavior for ambiguous sub-brand links (no auto-fill, warning in terminal).
- Runtime version bumped to `4.0.0`.

## [3.0.0] - 2026-02-20

### Added
- Native Grocy master-data integration for brands:
  - New userentity `Marques` (not shown in sidebar by default).
  - New userfields on `Marques`: `Marque` and `logo_marque` (`image`).
- New `Marque` menu entry injected in Grocy manage-data dropdown.
- Automatic `products -> Marque` sync to `Marques` on:
  - brand save from product form (throttled),
  - click on the `Marque` menu entry (forced sync before opening page).

### Changed
- Barcode robot and auto-assist now use one strategy:
  - alternative lookup first,
  - automatic fallback to normal lookup when alternative path fails.
- Barcode lookup internals now support per-run in-memory request caching (`provider|normalized-name`) to avoid duplicate API calls.
- Runtime version bumped to `3.0.0`.

## [2.1.0] - 2026-02-19

### Added
- Native settings page rendering on `/stocksettings?producthelper=1`.
- Addon registration metadata for NerdCore menu routing (`settingsSection`, `settingsTitle`, `settingsIcon`).

### Changed
- Runtime version bump to `2.1.0`.
- Legacy relay URL now resolves from NerdCore VPS API base (`/__nerdcore_update`).
- Settings labels renamed from StatNerd placeholders to ProductHelper labels.
- Settings groups reduced to ProductHelper-specific sections (product data/providers/compat/updates).

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





