# ProductHelper

ProductHelper is the Grocy addon for product workflows:
- OFF/OPF barcode lookup
- barcode robot flow
- product photo search/import
- product-form helpers

## Dependency

`NerdCore` is mandatory:
- https://github.com/Raph563/NerdCore

If `NerdCore` is not installed, ProductHelper install/update scripts fail by design and runtime is disabled.

## Runtime files

- Payload: `config/data/custom_js_product_helper.html`
- State: `config/data/producthelper-addon-state.json`
- Active composed file: `config/data/custom_js.html`

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


