# extra.laureillard.fr

Mini site statique de rythme sonore avec niveaux et moments speciaux.

Le site n'affiche plus de narration live: seul le compte a rebours apparait dans les 3 dernieres secondes avant un changement de cadence, avec l'indication `Accélère` ou `Ralentit`.

## Fichiers
- `index.html`
- `styles.css`
- `app.js`

## Deploy rapide (Caddy)
1. Copier `index.html`, `styles.css`, `app.js` et `README.md` vers `/opt/prospection-site/public/extra.laureillard.fr`.
2. Caddy sert `extra.laureillard.fr` avec `root * /srv/prospection/extra.laureillard.fr`, monte depuis `/opt/prospection-site/public`.
3. Aucun build applicatif n'est necessaire: le dossier statique est l'artefact de production.

Exemple Caddy:

```caddy
extra.laureillard.fr {
  encode zstd gzip
  root * /srv/prospection/extra.laureillard.fr
  file_server
}
```
