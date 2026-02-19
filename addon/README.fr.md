# Grocy Product Helper - Addon Pack (FR)

Pack addon dedie aux fonctions produit Grocy.
Necessite NerdCore avant installation.

## Contenu

- `dist/custom_js.html`: payload frontend helper produit.
- `scripts/install.*`: installation locale.
- `scripts/uninstall.*`: rollback.
- `scripts/update-from-github.*`: update depuis releases GitHub.
- `docker-sidecar/`: mode sidecar Docker.

## Etat local

- `config/data/producthelper-addon-state.json`
- `config/data/custom_js_product_helper.html`
- `config/data/custom_js.html` (fichier actif compose)

## Installation

```powershell
cd addon\scripts
.\install.ps1 -GrocyConfigPath "C:\path\to\grocy\config"
```

## Mise a jour

```powershell
cd addon\scripts
.\update-from-github.ps1 -GrocyConfigPath "C:\path\to\grocy\config"
```


