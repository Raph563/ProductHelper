# ProductHelper

ProductHelper is the Grocy addon for product workflows:
- OFF/OPF barcode lookup
- barcode robot flow (alternative lookup first, then normal fallback)
- product photo search/import
- product-form helpers
- native `Marque` + `Liens marques` master-data modules (Grocy manage data)

## Dependency

`NerdCore` is mandatory:
- https://github.com/Raph563/NerdCore

If `NerdCore` is not installed, ProductHelper install/update scripts fail by design and runtime is disabled.

## Runtime files

- Payload: `config/data/custom_js_product_helper.html`
- State: `config/data/producthelper-addon-state.json`
- Active composed file: `config/data/custom_js.html`

## Settings page
- Dedicated Grocy page: `/stocksettings?producthelper=1`
- Menu entry is injected by NerdCore.

## Brands (`Marque`) module

- Product brand source remains the `products -> Marque` userfield.
- ProductHelper now syncs those values to native Grocy userentity `Marques`.
- `Marques` stores:
  - `Marque` (name)
  - `logo_marque` (native Grocy image field)
- A `Marque` entry is injected into Grocy's manage-data dropdown and opens the native object page.

## Parent/sub-brand links

- New userentity: `Liens_marques` with:
  - `Marque_parente`
  - `Sous_marque`
  - `Actif`
- New `Liens marques` menu entry in Grocy manage-data dropdown.
- Product form behavior:
  - auto-link `Sous_marque -> Marque` when an active link exists,
  - `Robot Marque` button parses product name (`name - brand - quantity`) and proposes creating missing brands.

Default compose order:
- `custom_js_nerdcore.html`
- `custom_js_nerdstats.html`
- `custom_js_product_helper.html`

## Install

Windows:
```powershell
cd addon\scripts
.\install.ps1 -GrocyConfigPath "C:\path\to\grocy\config"
```

Linux/macOS:
```bash
cd addon/scripts
./install.sh /path/to/grocy/config
```

## Update

Windows:
```powershell
cd addon\scripts
.\update-from-github.ps1 -GrocyConfigPath "C:\path\to\grocy\config"
```

Linux/macOS:
```bash
cd addon/scripts
./update-from-github.sh --config /path/to/grocy/config
```

## Docker sidecar

```bash
cd addon/docker-sidecar
docker compose -f docker-compose.example.yml up --build
```

## Release assets

- Stable tag: `vX.Y.Z`
- Prerelease tag: `vX.Y.Z-alpha.N` / `vX.Y.Z-beta.N`
- ZIP asset: `producthelper-addon-vX.Y.Z.zip`

## Related repos

- Core dependency: https://github.com/Raph563/NerdCore
- Stats addon: https://github.com/Raph563/StatNerd

## Documentation

- `docs/README.fr.md`
- `docs/README.en.md`
- `addon/README.fr.md`
- `addon/README.en.md`


