# Changelog

## [4.0.9] - 2026-03-05

### Added
- Added normalized unit price hints (/kg for mass units, /L for volume units) in ProductCard price lines (last price and average price), across all interfaces reusing Grocy ProductCard.

### Changed
- Purchase page price hint now appends normalized unit pricing (/kg or /L) when the base hint is per mass/volume unit.

## [4.0.8] - 2026-03-05

### Added
- New OFF/OPF setting toggle in ProductHelper parameters for barcode auto-lookup strategy on product edit pages: try with brand first (Brand field then product name parsing), then retry without brand.

### Changed
- Product edit barcode auto-lookup now respects this setting while keeping OFF+OPF fallback chain behavior.

## [4.0.7] - 2026-03-05

### Fixed
- Stopped forcing overlay visibility observers on the dedicated ProductHelper settings page (/stocksettings?producthelper=1) to prevent browser freeze loops.
- Made overlay visibility enforcement idempotent to avoid repeated style/class mutation churn.
- Kept addon compatibility scan lazy (runs only when opening the Compat tab), reducing startup load on settings page.
- Skipped manage-data brand observer/migration bootstrapping on the dedicated settings page.

## [4.0.6] - 2026-03-05

### Fixed
- ProductHelper settings page performance issue on `/stocksettings?producthelper=1` that could freeze Firefox on large datasets.
- Missing-barcode section no longer auto-loads full data on page open; loading is now explicit via refresh button.
- Missing-barcode cards now render progressively with a `Show more` control to avoid DOM overload.
## [4.0.5] - 2026-03-05

### Changed
- Barcode auto-lookup now tries advanced name variants with brand hint first (user Brand field or brand parsed from product name), then retries without brand before final normal fallback.
- Robot barcode flows now expose `brand-alternative` mode details in status/terminal diagnostics and keep OFF+OPF fallback chain enabled.

### Added
- New ProductHelper settings section in **Données produit**: lists active non-parent products without barcodes.
- Per-product vertical cards with editable prefilled amount (purchase->stock factor), OFF/OPF lookup, source candidate card preview, and explicit user validation before barcode creation.
- Creation safety checks before final write (active flag, parent mode, purchase unit presence, and duplicate barcode guard).
## [4.0.4] - 2026-03-04

### Fixed
- Restored the kcal field visibility on parent product create/edit pages; parent mode no longer forces calories to 0.

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
