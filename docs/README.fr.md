# ProductHelper - FR

## Dependance

Installer NerdCore avant ProductHelper:
- https://github.com/Raph563/NerdCore

## Installation

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

## Mise a jour

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

## Fichiers runtime

- `config/data/custom_js_product_helper.html`
- `config/data/producthelper-addon-state.json`
- `config/data/custom_js.html` (fichier actif compose)

## Liens

- Core: https://github.com/Raph563/NerdCore
- Stats: https://github.com/Raph563/StatNerd


