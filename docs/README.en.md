# ProductHelper - EN

## Dependency

Install NerdCore first:
- https://github.com/Raph563/NerdCore

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

## Runtime files

- `config/data/custom_js_product_helper.html`
- `config/data/producthelper-addon-state.json`
- `config/data/custom_js.html` (composed active file)

## What's new in 4.0.0

- Full parent/sub-brand model:
  - `Liens_marques` userentity (`Marque_parente`, `Sous_marque`, `Actif`),
  - `Brand links` entry injected in Grocy "Manage data" dropdown.
- Product form:
  - `Brand robot` button (`name - brand - quantity` parsing),
  - create-missing-brand confirmation flow,
  - automatic `Sub-brand -> Brand` fill from active links.
- Initial retro-migration:
  - scans existing products and creates missing brands/links,
  - manual rerun available in ProductHelper settings.

## Related

- Core: https://github.com/Raph563/NerdCore
- Stats: https://github.com/Raph563/StatNerd


