# Grocy Product Helper - Addon Pack (FR)

Pack addon dedie aux fonctions produit Grocy.
Necessite NerdCore avant installation.

## Contenu

- `dist/custom_js.html`: payload frontend helper produit.
- Recherche code-barres robot: strategie alternative d'abord, puis fallback normal.
- Modules natifs `Marque` + `Liens marques` dans "Gerer les donnees":
  - `Marques` (`Marque`, `logo_marque`)
  - `Liens_marques` (`Marque_parente`, `Sous_marque`, `Actif`)
- Fiche produit:
  - bouton `Robot Marque` (extraction depuis `nom - marque - quantite`),
  - auto-liaison `Sous_marque -> Marque` via les liens actifs.
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


