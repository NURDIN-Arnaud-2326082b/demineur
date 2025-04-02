# Démineur

Application mobile de démineur développée avec React Native et Expo.

![Logo Démineur](./assets/images/logodm.png)

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
npx expo start
```

## Comment jouer

1. Choisissez un niveau de difficulté et un thème sur l'écran d'accueil
2. Appuyez sur une case pour la révéler
3. Les chiffres indiquent le nombre de mines adjacentes
4. Utilisez le mode drapeau (🚩) en activant l'interrupteur en bas de l'écran pour marquer les mines potentielles
5. Découvrez toutes les cases sans mines pour gagner

## Mode One Shot

Le mode One Shot est un défi extrême où une seule case sur 25 ne contient pas de mine. Vos chances de gagner sont de 1 sur 25 - bonne chance !

## Développement

Ce projet utilise :
- [Expo](https://expo.dev) comme framework
- [React Native](https://reactnative.dev) pour le développement multi-plateforme
- [Expo Router](https://docs.expo.dev/router/introduction) pour la navigation
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) pour sauvegarder les statistiques

## Licence

[MIT](LICENSE)
