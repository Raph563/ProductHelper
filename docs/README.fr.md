# ProductHelper - FR

## Dépendance

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

## Mise à jour

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

## Nouveautés 4.0.0

- Modèle parent/sous-marque complet :
  - entité `Liens_marques` (`Marque_parente`, `Sous_marque`, `Actif`),
  - entrée `Liens marques` dans "Gérer les données".
- Fiche produit:
  - bouton `Robot Marque` (parse `nom - marque - quantité`),
  - proposition d'ajout de marque si absente,
  - auto-remplissage `Sous_marque -> Marque` via liens actifs.
- Migration rétroactive initiale :
  - scan des produits existants pour créer marques/liens manquants,
  - relance manuelle possible dans les paramètres ProductHelper.

## Liens

- Core: https://github.com/Raph563/NerdCore
- Stats: https://github.com/Raph563/StatNerd


