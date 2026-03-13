# Changelog

## [4.0.21] - 2026-03-13

### Changed
- Dedicated missing-barcodes page now refreshes automatically on open.
- Removed the manual `Refresh` button from the dedicated missing-barcodes page while keeping it on non-dedicated contexts.

## [4.0.20] - 2026-03-13

### Changed
- Removed the redundant `Open dedicated page` button when the user is already on the dedicated missing-barcodes page.

## [4.0.19] - 2026-03-13

### Changed
- Missing-barcode pagination now defaults to 15 products per page.
- Added a bottom page-size selector so the dedicated page can switch between 15, 30, and 50 products per page.

## [4.0.18] - 2026-03-13

### Changed
- Removed the `Selection required: validate this card before creation.` helper text from the missing-barcode flow while keeping the result card in the same position.

## [4.0.17] - 2026-03-13

### Changed
- Missing-barcode search animations now stay active even when another card is ignored or completed, thanks to persistent per-card lookup busy state across rerenders.
- Replaced the huge continuous missing-barcode list with real page navigation (previous/next + page indicator) on the dedicated page.

## [4.0.16] - 2026-03-13

### Changed
- Added a dedicated ProductHelper settings page for `Products without barcodes` via `/stocksettings?producthelper=1&producthelperPage=missing_barcodes`.
- Updated ProductHelper links and banner shortcuts to open that standalone page directly.
- Ignored products remain stored server-side through `Codes_barres_ignores` userentity, not in local browser storage.

## [4.0.15] - 2026-03-13

### Changed
- Missing-barcode lookup results are now kept in memory per product so previously found barcode cards reappear instantly in ProductHelper settings.
- Ignoring a product no longer cancels an in-progress barcode lookup; the lookup continues in background and its result stays available if the product is restored later.

## [4.0.14] - 2026-03-13

### Changed
- Reworked the `Products without barcodes` cards in ProductHelper settings to reuse the same compact Grocy result-card structure as the product edit barcode search UI.
- Fixed the settings-page product cards layout so product media, metadata, and actions stay aligned like the edit-page barcode result cards.

## [4.0.13] - 2026-03-13

### Changed
- Restyled the `Products without barcodes` cards to match the Grocy barcode search result cards used on the product edit page.
- Simplified the product sheet layout around the same compact visual language while keeping the existing lookup, ignore, and restore flows unchanged.

## [4.0.12] - 2026-03-13

### Changed
- Cleaned up the ProductHelper `Products without barcodes` cards with a more structured per-product sheet layout: clearer media block, metadata chips, and a dedicated action panel.
- Kept the existing barcode lookup / ignore / restore workflow unchanged while improving card readability on desktop and mobile.

## [4.0.11] - 2026-03-05

### Added
- Added global persistent ignore/restore flow for missing-barcode products, with a dedicated ignored sub-list directly in ProductHelper settings.
- Added a `/products` banner (shown only when needed) with missing barcode count and direct link to `/stocksettings?producthelper=1&producthelperTab=barcodes`.

### Changed
- Reworked ProductHelper settings into clear groups with BASIC/ADVANCED mode (BASIC default), and full tab routing support via `producthelperTab`.
- Removed non-AI “save section” buttons and kept partial autosave behavior for non-AI toggles/selects.
- Improved missing-barcode cards styling (Grocy look), including ignored-card visual state and restore actions.
- Kept OFF/OPF barcode lookup strategy with brand-first then fallback-without-brand behavior in product edit and barcode helper flows.
## [4.0.10] - 2026-03-05

### Added
- New dedicated **Barcodes** settings page in ProductHelper for barcode-related workflows.
- Missing-barcode product cards now show local product photos when available, with a visual placeholder otherwise.

### Changed
- Redesigned missing-barcode cards with a richer visual layout (media, metadata, action panel) for faster review and validation.

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
