# Page de téléchargement pour Démineur

Ce dossier contient une landing page simple pour permettre aux utilisateurs de télécharger l'APK de votre jeu Démineur.

## Structure des fichiers

- `index.html` - Page principale
- `styles.css` - Styles pour la page
- `downloads/demineur.apk` - Emplacement pour votre fichier APK
- `qr-code.png` - Code QR pour le téléchargement (à générer)

## Comment utiliser cette landing page

1. Placez votre fichier APK compilé dans le dossier `downloads/` (créez ce dossier)
2. Générez un code QR qui pointe vers l'URL de téléchargement et enregistrez-le sous `qr-code.png`
3. Ajoutez des captures d'écran de votre jeu dans la section dédiée
4. Hébergez ce dossier sur GitHub Pages, Netlify, Vercel ou tout autre service d'hébergement web

## Générer un code QR

Vous pouvez générer un code QR à l'aide d'un service en ligne comme:
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)

Le QR code doit pointer vers l'URL complète où votre APK sera téléchargeable.

## Personnalisation

Vous pouvez personnaliser cette page en modifiant:
- Les couleurs dans les variables CSS au début du fichier `styles.css`
- Les textes dans `index.html`
- Ajouter/supprimer des sections selon vos besoins
