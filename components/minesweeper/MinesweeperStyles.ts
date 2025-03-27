import { StyleSheet } from 'react-native';

// Définition du type de thème
export type MinesweeperTheme = {
  id: string;
  name: string;
  cellColor: string;
  revealedColor: string;
  borderColor: string;
  headerColor: string;
  textColor: string;
  lightBorderColor: string;
  darkBorderColor: string;
};

// Thèmes disponibles pour le jeu
export const THEMES: MinesweeperTheme[] = [
  {
    id: 'classic',
    name: 'Classique',
    cellColor: '#FFA500', // Orange
    revealedColor: '#000000', // Noir
    borderColor: '#FF8000', // Orange foncé
    headerColor: '#333333', // Gris foncé
    textColor: '#FFFFFF', // Blanc
    lightBorderColor: '#FFBE5E', // Orange clair
    darkBorderColor: '#E67E00', // Orange très foncé
  },
  {
    id: 'dark',
    name: 'Sombre',
    cellColor: '#444444', // Gris foncé
    revealedColor: '#222222', // Noir léger
    borderColor: '#666666', // Gris moyen
    headerColor: '#111111', // Noir profond
    textColor: '#DDDDDD', // Gris très clair
    lightBorderColor: '#555555', // Gris moyen-clair
    darkBorderColor: '#333333', // Gris foncé
  },
  {
    id: 'blue',
    name: 'Bleu',
    cellColor: '#4682B4', // Bleu acier
    revealedColor: '#1E3A5F', // Bleu foncé
    borderColor: '#6CA0DC', // Bleu clair
    headerColor: '#20355A', // Bleu nuit
    textColor: '#FFFFFF', // Blanc
    lightBorderColor: '#87CEEB', // Bleu ciel
    darkBorderColor: '#36648B', // Bleu foncé
  },
  {
    id: 'green',
    name: 'Vert',
    cellColor: '#6BC168', // Vert
    revealedColor: '#2E6F2C', // Vert foncé
    borderColor: '#8FE78D', // Vert clair
    headerColor: '#2F572D', // Vert forêt
    textColor: '#FFFFFF', // Blanc
    lightBorderColor: '#A0E89F', // Vert très clair
    darkBorderColor: '#4E9F4C', // Vert moyen
  },
  {
    id: 'pink',
    name: 'Rose',
    cellColor: '#FF9BB3', // Rose
    revealedColor: '#D95F7E', // Rose foncé
    borderColor: '#FF6B99', // Rose plus foncé
    headerColor: '#C74663', // Rose rouge
    textColor: '#FFFFFF', // Blanc
    lightBorderColor: '#FFB6C1', // Rose clair
    darkBorderColor: '#E66A8A', // Rose moyen
  },
];

// Couleurs de base
export const colors = {
  // Couleurs des cellules
  cellBackground: '#FFA500',      // Orange pour cases non révélées
  revealedCell: '#000',           // Noir pour les cases révélées
  explodedMine: '#FF0000',        // Rouge vif pour la mine explosée
  regularMine: '#880000',         // Rouge foncé pour les mines normales
  
  // Couleurs des bordures
  lightBorder: '#FFBE5E',         // Bordure claire (haut/gauche)
  darkBorder: '#E67E00',          // Bordure foncée (bas/droite)
  boardBorder: '#FF8000',         // Couleur bordure extérieure du plateau
  boardBackground: '#BB6000',     // Couleur de fond du plateau
  
  // Couleurs de l'interface
  headerBackground: '#333',       // Arrière-plan du header
  counterColor: '#FFA500',        // Couleur des compteurs (orange)
  textColor: '#FFF',              // Couleur du texte dans les cases (blanc)
  
  // Couleurs des messages
  gameOverColor: '#FF0000',       // Rouge pour le message de défaite
  gameWonColor: '#00FF00',        // Vert pour le message de victoire
};

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.headerBackground,
    width: '100%',
  },
  counterContainer: {
    minWidth: 80,
    alignItems: 'flex-start',
  },
  counter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.counterColor,
  },
  timerContainer: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.counterColor,
  },
  resetButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cellBackground,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.boardBorder,
  },
  resetText: {
    fontSize: 24,
  },
  difficultyText: {
    marginBottom: 10,
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.boardBorder,
  },
  scrollContainer: {
    borderWidth: 3,
    borderColor: colors.boardBorder,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.boardBackground,
  },
  boardContainer: {
    backgroundColor: colors.boardBackground,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mine: {
    fontSize: 18,
    color: colors.textColor,
  },
  explodedMine: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textColor,
  },
  flag: {
    fontSize: 18,
  },
  number: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.headerBackground,
    borderRadius: 25,
  },
  modeText: {
    fontSize: 18,
    marginHorizontal: 10,
    color: colors.counterColor,
  },
  currentMode: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.boardBorder,
  },
  zoomIndicator: {
    marginTop: 10,
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.boardBorder,
  },
  gameOverText: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gameOverColor,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  gameWonText: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gameWonColor,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  
  // Styles pour les boutons de difficulté
  difficultyButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  difficultyButton: {
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  activeDifficultyButton: {
    backgroundColor: colors.cellBackground,
    borderColor: '#000',
  },
  difficultyButtonText: {
    color: '#CCC',
    fontWeight: 'bold',
  },
  activeDifficultyButtonText: {
    color: '#000',
  },

  // Styles pour le menu de thème avec animation de déroulement
  themeButtonContainer: {
    position: 'relative',
    flexDirection: 'row',  // Changé de column à row pour aligner horizontalement
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    zIndex: 10, // Pour que le menu déroulant s'affiche au-dessus des autres éléments
    overflow: 'visible',
    height: 45, // Hauteur fixe pour éviter les sauts
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 2,
  },
  themeButtonText: {
    fontSize: 20,
    color: '#FFF',
  },
  // Conteneur animé qui se déroule
  themeMenuRollout: {
    height: 40,
    overflow: 'hidden', 
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10, // Espace entre le menu et le bouton
  },
  themeCirclesContainer: {
    flexDirection: 'row', // Alignement horizontal
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
  },
  themeCircleWrapper: {
    marginHorizontal: 5,
  },
  themeCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  activeThemeCircle: {
    borderColor: '#FFF',
    borderWidth: 2,
  },
  themeCircleCheckmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  
  // Effet de tapis rouge pour l'animation
  redCarpet: {
    position: 'absolute',
    height: 40,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 20,
    top: 0,
    right: 0,
    zIndex: 1,
  }
});