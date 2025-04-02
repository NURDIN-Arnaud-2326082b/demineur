# Démineur

Application mobile de démineur développée avec React Native et Expo.

## 📱 Application disponible en téléchargement

Vous pouvez télécharger l'application APK Android directement depuis notre site web:

**[⬇️ Télécharger Démineur ⬇️](https://nurdin-arnaud-2326082b.github.io/demineur/)**

## À propos

Cette application est une version moderne et personnalisable du jeu classique du démineur, disponible sur Android et iOS. Le but du jeu est de découvrir toutes les cases qui ne contiennent pas de mines en évitant de cliquer sur celles qui en contiennent.

## Fonctionnalités

- 4 niveaux de difficulté :
  - **Facile** : Grille 9×9 avec 10 mines
  - **Moyen** : Grille 16×16 avec 40 mines
  - **Difficile** : Grille 30×16 avec 99 mines
  - **One Shot** : Grille 5×5 avec une seule case sans mine (mode extrême)
  
- 9 thèmes visuels différents :
  - Classique (orange)
  - Sombre
  - Bleu
  - Vert
  - Rose
  - Violet
  - Rouge
  - Blanc
  - Jaune

- Autres fonctionnalités :
  - Statistiques de jeu (parties jouées, gagnées, meilleurs temps)
  - Retour haptique (vibrations)
  - Mode drapeau pour marquer les mines
  - Sauvegarde automatique des statistiques

## Installation

### Option 1: Télécharger l'APK
La façon la plus simple d'installer le jeu est de visiter notre [page de téléchargement](https://nurdin-arnaud-2326082b.github.io/demineur/) et de suivre les instructions.

### Option 2: Compilation depuis les sources

1. Cloner le répertoire

```bash
git clone https://github.com/votre-username/demineur.git
cd demineur
```

2. Installer les dépendances

```bash
npm install
```

3. Lancer l'application

```bash
npm run web
```
Si vous voulez tester l'application avec Expo sur votre téléphone rendez vous sur votre store favori et installez l'application **Expo go**. Ensuite, scannez le code qr qui apparaît dans le terminal quand vous exécutez la commande ci-dessus à l'aide du scanner intégré à l'application.

## Comment jouer

1. Choisissez un niveau de difficulté
2. Vous pouvez choisir un thèe via le bouton de palette en haut à droite
3. Appuyez sur une case pour la révéler
4. Les chiffres indiquent le nombre de mines adjacentes
5. Utilisez le mode drapeau (🚩) en activant l'interrupteur en bas de l'écran pour marquer les mines potentielles
6. Découvrez toutes les cases sans mines pour gagner

## Mode One Shot

Le mode One Shot est un défi extrême où une seule case sur 25 ne contient pas de mine. Vos chances de gagner sont de 1 sur 25 - bonne chance !

## Développement

Ce projet utilise :
- [Expo](https://expo.dev) comme framework
- [React Native](https://reactnative.dev) pour le développement multi-plateforme
- [Expo Router](https://docs.expo.dev/router/introduction) pour la navigation
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) pour sauvegarder les statistiques
