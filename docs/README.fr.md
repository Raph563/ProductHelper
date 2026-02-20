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

## Nouveautes 4.0.0

- Modele parent/sous-marque complet:
  - entite `Liens_marques` (`Marque_parente`, `Sous_marque`, `Actif`),
  - entree `Liens marques` dans "Gerer les donnees".
- Fiche produit:
  - bouton `Robot Marque` (parse `nom - marque - quantite`),
  - proposition d'ajout de marque si absente,
  - auto-remplissage `Sous_marque -> Marque` via liens actifs.
- Migration retroactive initiale:
  - scan des produits existants pour creer marques/liens manquants,
  - relance manuelle possible dans les parametres ProductHelper.

## Liens

- Core: https://github.com/Raph563/NerdCore
- Stats: https://github.com/Raph563/StatNerd


