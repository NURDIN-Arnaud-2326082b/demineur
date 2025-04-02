import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Dimensions, Vibration, Switch, ScrollView, Animated, ToastAndroid, Modal, Platform, PermissionsAndroid, TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { styles, colors, THEMES, MinesweeperTheme } from './MinesweeperStyles';
import { useGameStats } from '@/hooks/useGameStats';
import { router } from 'expo-router';

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
  isExploded?: boolean;
};

type Difficulty = {
  rows: number;
  cols: number;
  mines: number;
  name: string;
};

const window = Dimensions.get('window');
const screenWidth = window.width;
const screenHeight = window.height;
const isLandscape = screenWidth > screenHeight;
const isPC = screenWidth >= 768;

// Taille fixe de base pour les cellules, quel que soit le niveau de difficulté
const BASE_CELL_SIZE = 35;
const MEDIUM_COLS = 16; // Norme de référence (colonnes du mode moyen)
const STANDARD_BOARD_WIDTH = MEDIUM_COLS * BASE_CELL_SIZE; // Largeur standard pour toutes les difficultés

// Définition des difficultés
const DIFFICULTIES: Record<string, Difficulty> = {
  easy: { rows: 9, cols: 9, mines: 10, name: 'Facile' },
  medium: { rows: 16, cols: 16, mines: 40, name: 'Moyen' },
  hard: { rows: 30, cols: 16, mines: 99, name: 'Difficile' }, // Orienté verticalement: 30 lignes et 16 colonnes
  oneshot: { rows: 5, cols: 5, mines: 24, name: 'One Shot' }, // Nouveau mode extrême
};

export default function MinesweeperBoard({
  initialDifficulty = 'easy',
  initialThemeId,
  onGameOver = () => {},
  onGameWin = () => {},
}: {
  initialDifficulty?: keyof typeof DIFFICULTIES;
  initialThemeId?: string;
  onGameOver?: () => void;
  onGameWin?: () => void;
}) {
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTIES>(initialDifficulty);
  const [board, setBoard] = useState<CellState[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const [flagMode, setFlagMode] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Ajouter un état pour la modal de fin de partie
  const [showEndGameModal, setShowEndGameModal] = useState(false);
  const [endGameMessage, setEndGameMessage] = useState('');
  const [modalBackgroundColor, setModalBackgroundColor] = useState('');
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);

  // Trouver le thème initial basé sur l'ID ou utiliser le premier thème par défaut
  const findInitialTheme = () => {
    if (initialThemeId) {
      const theme = THEMES.find(t => t.id === initialThemeId);
      return theme || THEMES[0];
    }
    return THEMES[0];
  };

  const [currentTheme, setCurrentTheme] = useState(findInitialTheme());
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const menuAnimWidth = useRef(new Animated.Value(0)).current;
  const carpetOpacity = useRef(new Animated.Value(0)).current;
  const winAnimation = useRef(new Animated.Value(0)).current;

  const { rows, cols, mines, name } = DIFFICULTIES[difficulty];
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calcul du facteur d'échelle pour Android - maintenant à l'intérieur du composant
  const getScaleFactor = () => {
    if (Platform.OS !== 'android') return 1;

    // Réduire davantage l'échelle pour les grands plateaux
    const baseScale = Math.min(screenWidth * 0.85, STANDARD_BOARD_WIDTH) / STANDARD_BOARD_WIDTH;

    // Réduire encore plus pour le mode difficult
    return baseScale * (difficulty === 'hard' ? 0.85 : 0.95);
  };

  // Facteur d'échelle pour Android
  const SCALE_FACTOR = getScaleFactor();

  // Ajouter le hook pour les statistiques
  const { updateStats } = useGameStats();

  const [hasVibrationPermission, setHasVibrationPermission] = useState(Platform.OS !== 'android');

  // Demander la permission de vibration sur Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      checkVibrationPermission();
    }
  }, []);

  const checkVibrationPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 23) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.VIBRATE,
          {
            title: "Permission de vibration",
            message: "L'application a besoin d'accéder aux vibrations pour donner du feedback.",
            buttonNeutral: "Demander plus tard",
            buttonNegative: "Annuler",
            buttonPositive: "OK"
          }
        );
        setHasVibrationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Fonction de vibration sécurisée
  const safeVibrate = (pattern: number | number[]) => {
    if (Platform.OS === 'ios' || hasVibrationPermission) {
      Vibration.vibrate(pattern);
    }
  };

  // Calculer la taille des cellules pour maintenir la même largeur de plateau quel que soit le mode
  const getAdjustedCellSize = () => {
    // Calculer d'abord la taille des cellules en mode facile (qui est plus grande)
    const easyModeSize = STANDARD_BOARD_WIDTH * SCALE_FACTOR / DIFFICULTIES.easy.cols;

    // Appliquer le facteur d'échelle sur Android
    const baseSize = Platform.OS === 'android' ? easyModeSize : BASE_CELL_SIZE;

    // Utiliser la même grande taille pour tous les modes
    return baseSize;
  };

  // Taille des cellules, adaptée pour maintenir une largeur de grille constante
  const cellSize = getAdjustedCellSize();

  // Calculer la taille totale du plateau
  const boardWidth = cols * cellSize;
  const boardHeight = rows * cellSize;

  // Déterminer si on a besoin de scroll horizontal
  const needsHorizontalScroll = difficulty !== 'easy' && boardWidth > screenWidth * 0.9;

  // Largeur fixe pour le conteneur de jeu, adaptée à l'écran
  const CONTAINER_WIDTH = Platform.select({
    android: Math.min(STANDARD_BOARD_WIDTH * SCALE_FACTOR, screenWidth - 20),
    default: isPC ? Math.min(STANDARD_BOARD_WIDTH + 20, screenWidth * 0.8) : Math.min(STANDARD_BOARD_WIDTH, screenWidth - 40)
  });

  useEffect(() => {
    setIsInitializing(true);
    initializeBoard();

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [difficulty]);

  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon) {
      timerRef.current = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameStarted, gameOver, gameWon]);

  useEffect(() => {
    if (gameWon) {
      Animated.sequence([
        Animated.timing(winAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(winAnimation, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(winAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      winAnimation.setValue(0);
    }
  }, [gameWon, winAnimation]);

  useEffect(() => {
    if (showThemeMenu) {
      // Animation d'ouverture du menu
      Animated.spring(menuAnimWidth, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: false,
      }).start();
    } else {
      // Animation de fermeture du menu
      Animated.timing(menuAnimWidth, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [showThemeMenu]);

  // Fonction pour changer de thème
  const changeTheme = (theme: typeof THEMES[0]) => {
    setCurrentTheme(theme);
    setShowThemeMenu(false);
  };

  // Assurons-nous que la difficulté est une valeur valide
  useEffect(() => {
    // Vérifier si initialDifficulty est une clé valide dans DIFFICULTIES
    if (initialDifficulty && DIFFICULTIES[initialDifficulty]) {
      setDifficulty(initialDifficulty);
    }
  }, [initialDifficulty]);

  // Assurons-nous que le thème est initialisé correctement
  useEffect(() => {
    if (initialThemeId) {
      const theme = THEMES.find(t => t.id === initialThemeId);
      if (theme) {
        setCurrentTheme(theme);
      }
    }
  }, [initialThemeId]);

  const renderThemeCircles = () => {
    return (
      <Animated.View 
        style={[
          {
            position: 'absolute',
            right: 50, // Laisser de l'espace pour le bouton de thème
            left: 0,
            top: 0,
            opacity: menuAnimWidth,
            backgroundColor: 'rgba(240, 240, 240, 0.95)',
            borderRadius: 12,
            paddingVertical: 6,
            paddingHorizontal: 6,
            transform: [{
              translateY: menuAnimWidth.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0]
              })
            }]
          }
        ]}
      >
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{
            alignItems: 'center',
            paddingRight: 10,
            paddingLeft: 6
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            {THEMES.map((theme, index) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  {
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: theme.cellColor,
                    marginHorizontal: 4,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: currentTheme.id === theme.id ? 2 : 0,
                    borderColor: '#000',
                  }
                ]}
                onPress={() => changeTheme(theme)}
              >
                {currentTheme.id === theme.id && (
                  <ThemedText style={{ fontSize: 14, fontWeight: 'bold' }}>✓</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  const initializeBoard = () => {
    const newBoard: CellState[][] = [];
    const currentDifficultySettings = DIFFICULTIES[difficulty];
    const { rows: currentRows, cols: currentCols } = currentDifficultySettings;

    for (let i = 0; i < currentRows; i++) {
      newBoard.push([]);
      for (let j = 0; j < currentCols; j++) {
        newBoard[i].push({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        });
      }
    }

    // Pour le mode One Shot, on place les mines immédiatement au lieu d'attendre le premier clic
    if (difficulty === 'oneshot') {
      // Choisir aléatoirement une case qui sera sans mine
      const safeRow = Math.floor(Math.random() * currentRows);
      const safeCol = Math.floor(Math.random() * currentCols);
      
      // Placer des mines partout sauf à la position sélectionnée
      for (let i = 0; i < currentRows; i++) {
        for (let j = 0; j < currentCols; j++) {
          if (i === safeRow && j === safeCol) {
            newBoard[i][j].isMine = false; // La seule case sans mine
          } else {
            newBoard[i][j].isMine = true; // Toutes les autres cases ont des mines
          }
        }
      }
      
      // Calculer le nombre de mines adjacentes pour la case sans mine
      let count = 0;
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          const ni = safeRow + di;
          const nj = safeCol + dj;
          if (ni >= 0 && ni < currentRows && nj >= 0 && nj < currentCols && (ni !== safeRow || nj !== safeCol)) {
            count++;
          }
        }
      }
      newBoard[safeRow][safeCol].adjacentMines = count;
    }

    setBoard(newBoard);
    setGameOver(false);
    setGameWon(false);
    setFlagsPlaced(0);
    setFirstClick(true);
    setGameTime(0);
    setGameStarted(false);
    setIsInitializing(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const placeMines = (board: CellState[][], firstRow: number, firstCol: number) => {
    const newBoard = [...board];
    
    // Le mode One Shot est déjà initialisé avec les mines, on ne fait rien
    if (difficulty === 'oneshot') {
      return newBoard;
    }
    
    // Logique standard pour les autres modes
    let minesPlaced = 0;

    while (minesPlaced < mines) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * cols);

      if (
        !newBoard[randomRow][randomCol].isMine &&
        !(Math.abs(randomRow - firstRow) <= 1 && Math.abs(randomCol - firstCol) <= 1)
      ) {
        newBoard[randomRow][randomCol].isMine = true;
        minesPlaced++;
      }
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && newBoard[ni][nj].isMine) {
                count++;
              }
            }
          }
          newBoard[i][j].adjacentMines = count;
        }
      }
    }

    return newBoard;
  };

  const revealCell = (row: number, col: number) => {
    if (!board || !board[row] || !board[row][col]) return;

    if (gameOver || gameWon || board[row][col].isFlagged || board[row][col].isRevealed) {
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    const newBoard = [...board];

    if (firstClick) {
      setFirstClick(false);
      
      // En mode One Shot, nous n'avons pas besoin de placer les mines car elles sont déjà placées
      if (difficulty !== 'oneshot') {
        const boardWithMines = placeMines(newBoard, row, col);
        setBoard(revealCellRecursive(boardWithMines, row, col));
        return;
      }
      
      // Pour le mode One Shot, vérifier si le premier clic est sur une mine
      if (newBoard[row][col].isMine) {
        // Explosion immédiate au premier clic
        safeVibrate(500);
        
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (newBoard[i][j].isMine) {
              newBoard[i][j].isRevealed = true;
              if (i === row && j === col) {
                newBoard[i][j].isExploded = true;
              }
            }
          }
        }
        
        setBoard(newBoard);
        setGameOver(true);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        updateStats(false, difficulty as 'easy' | 'medium' | 'hard', gameTime);
        onGameOver();
        
        if (Platform.OS === 'android') {
          ToastAndroid.show('Boum! Pas de chance!', ToastAndroid.SHORT);
        }
        
        setEndGameMessage('Pas de chance! C\'était une mine!');
        setModalBackgroundColor('rgba(220, 0, 0, 0.8)');
        setGameResult('lose');
        setShowEndGameModal(true);
        
        return;
      }
      
      // Si ce n'est pas une mine, continuer normalement
      setBoard(revealCellRecursive(newBoard, row, col));
      return;
    }

    if (newBoard[row][col].isMine) {
      safeVibrate(500);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (newBoard[i][j].isMine) {
            newBoard[i][j].isRevealed = true;
            if (i === row && j === col) {
              newBoard[i][j].isExploded = true;
            }
          }
        }
      }
      setBoard(newBoard);
      setGameOver(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      updateStats(false, difficulty as 'easy' | 'medium' | 'hard', gameTime);

      onGameOver();

      if (Platform.OS === 'android') {
        ToastAndroid.show('Boum! Partie terminée', ToastAndroid.SHORT);
      }

      setEndGameMessage('Partie perdue !');
      setModalBackgroundColor('rgba(220, 0, 0, 0.8)');
      setGameResult('lose');
      setShowEndGameModal(true);

      return;
    }

    safeVibrate(10);

    setBoard(revealCellRecursive(newBoard, row, col));

    checkWinCondition(newBoard);
  };

  const revealCellRecursive = (board: CellState[][], row: number, col: number): CellState[][] => {
    if (!board || !board[row] || !board[row][col]) return board;

    const newBoard = [...board];

    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= cols ||
      newBoard[row][col].isRevealed ||
      newBoard[row][col].isFlagged
    ) {
      return newBoard;
    }

    newBoard[row][col].isRevealed = true;

    if (newBoard[row][col].adjacentMines === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i !== 0 || j !== 0) {
            revealCellRecursive(newBoard, row + i, col + j);
          }
        }
      }
    }

    return newBoard;
  };

  const toggleFlag = (row: number, col: number) => {
    if (!board || !board[row] || !board[row][col]) return;

    if (gameOver || gameWon || board[row][col].isRevealed) {
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    const newBoard = [...board];

    if (newBoard[row][col].isFlagged) {
      newBoard[row][col].isFlagged = false;
      setFlagsPlaced(flagsPlaced - 1);
      safeVibrate(5);
    } else if (flagsPlaced < mines) {
      newBoard[row][col].isFlagged = true;
      setFlagsPlaced(flagsPlaced + 1);
      safeVibrate(10);
    } else {
      safeVibrate([0, 30, 10, 30]);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Nombre maximal de drapeaux atteint!', ToastAndroid.SHORT);
      }
    }

    setBoard(newBoard);

    checkWinCondition(newBoard);
  };

  const checkWinCondition = (board: CellState[][]) => {
    if (!board || board.length === 0) return;

    let allMinesFlagged = true;
    let allSafeCellsRevealed = true;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!board[i] || !board[i][j]) continue;

        if (board[i][j].isMine && !board[i][j].isFlagged) {
          allMinesFlagged = false;
        }
        if (!board[i][j].isMine && !board[i][j].isRevealed) {
          allSafeCellsRevealed = false;
        }
        if (!board[i][j].isMine && board[i][j].isFlagged) {
          allMinesFlagged = false;
        }
      }
    }

    if (allMinesFlagged || allSafeCellsRevealed) {
      setGameWon(true);

      if (allSafeCellsRevealed && !allMinesFlagged) {
        const newBoardCopy = [...board];
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (newBoardCopy[i] && newBoardCopy[i][j] && newBoardCopy[i][j].isMine && !newBoardCopy[i][j].isFlagged) {
              newBoardCopy[i][j].isFlagged = true;
            }
          }
        }
        setBoard(newBoardCopy);
        setFlagsPlaced(mines);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      updateStats(true, difficulty as 'easy' | 'medium' | 'hard', gameTime);

      onGameWin();

      if (Platform.OS === 'android') {
        ToastAndroid.show('Victoire! 🎉', ToastAndroid.LONG);
      }

      safeVibrate([0, 50, 50, 100, 50, 150]);

      setEndGameMessage(`Victoire! Temps: ${formatTime(gameTime)}`);
      setModalBackgroundColor('rgba(0, 150, 0, 0.8)');
      setGameResult('win');
      setShowEndGameModal(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const hasRevealedNeighbor = (row: number, col: number) => {
    if (!board || board.length === 0) return false;

    for (let i = Math.max(0, row - 1); i <= Math.min(rows - 1, row + 1); i++) {
      for (let j = Math.max(0, col - 1); j <= Math.min(cols - 1, col + 1); j++) {
        if ((i !== row || j !== col) && board[i] && board[i][j] && board[i][j].isRevealed) {
          return true;
        }
      }
    }
    return false;
  };

  const getThemeStyle = () => {
    const baseStyle = {
      header: {
        backgroundColor: currentTheme.headerColor,
      },
      resetButton: {
        backgroundColor: currentTheme.cellColor,
        borderColor: currentTheme.borderColor,
      },
      scrollContainer: {
        borderColor: currentTheme.borderColor,
      },
      modeContainer: {
        backgroundColor: currentTheme.headerColor,
      },
      difficultyButtonsContainer: {
        borderColor: currentTheme.borderColor,
      },
    };

    // Ajustements spécifiques à Android
    if (Platform.OS === 'android') {
      return {
        ...baseStyle,
        resetButton: {
          ...baseStyle.resetButton,
          elevation: 3, // Utiliser elevation au lieu de shadow pour Android
        },
        scrollContainer: {
          ...baseStyle.scrollContainer,
          elevation: 4,
        }
      };
    }

    return baseStyle;
  };

  const themeStyle = getThemeStyle();

  const renderCell = (row: number, col: number) => {
    if (!board || !board[row] || !board[row][col]) {
      return null;
    }

    const cell = board[row][col];

    const themeColors = {
      cellBackground: currentTheme.cellColor,
      lightBorder: currentTheme.lightBorderColor,
      darkBorder: currentTheme.darkBorderColor,
      revealedCell: currentTheme.revealedColor,
      explodedMine: colors.explodedMine,
      regularMine: colors.regularMine,
      textColor: currentTheme.textColor
    };

    // Les paramètres de bordure standard sont différents selon la plateforme
    let backgroundColor = themeColors.cellBackground;
    let content = null;
    let borderStyle = {};
    let shadowStyle = {};
    let cellSpacing = 0;

    if (Platform.OS === 'android') {
      // Pour Android, utiliser une approche plus unifiée sans lignes entre cellules
      if (cell.isRevealed) {
        backgroundColor = themeColors.revealedCell;

        // Restaurer les bordures grises pour les cases révélées mais sans créer d'écart
        borderStyle = {
          borderWidth: 1,
          borderColor: '#444', // Gris foncé pour les bordures
          borderBottomColor: '#111', // Plus foncé en bas/droite
          borderRightColor: '#111',
        };

        shadowStyle = { elevation: 0 };

        if (cell.isMine) {
          // Réduire drastiquement la taille pour Android
          const mineTextSize = Math.max(12 * SCALE_FACTOR, 8);
          content = (
            <ThemedText style={[
              styles.mine, 
              cell.isExploded && styles.explodedMine,
              { fontSize: mineTextSize, lineHeight: mineTextSize }
            ]}>💣</ThemedText>
          );
          backgroundColor = cell.isExploded ? themeColors.explodedMine : themeColors.regularMine;
        } else if (cell.adjacentMines > 0) {
          const numberTextSize = Math.max(14 * SCALE_FACTOR, 10);
          content = (
            <ThemedText style={[
              styles.number, 
              { color: themeColors.textColor, fontSize: numberTextSize }
            ]}>
              {cell.adjacentMines}
            </ThemedText>
          );
        }
      } else {
        // Pour les cases non révélées
        borderStyle = {
          // Aucune bordure visible entre cellules non révélées
          borderWidth: 0,
        };

        // Léger relief pour distinguer les cellules
        shadowStyle = cell.isFlagged ? { elevation: 2 } : { elevation: 0 };

        if (cell.isFlagged) {
          // Réduire drastiquement la taille pour Android
          const flagTextSize = Math.max(12 * SCALE_FACTOR, 8);
          content = <ThemedText style={[
            styles.flag, 
            { fontSize: flagTextSize, lineHeight: flagTextSize }
          ]}>🚩</ThemedText>;
        }
      }
    } else {
      // Style existant pour iOS et autres plateformes
      const isTopEdge = row === 0;
      const isBottomEdge = row === rows - 1;
      const isLeftEdge = col === 0;
      const isRightEdge = col === cols - 1;

      const hasRevealedAbove = row > 0 && board[row - 1] && board[row - 1][col] && board[row - 1][col].isRevealed;
      const hasRevealedBelow = row < rows - 1 && board[row + 1] && board[row + 1][col] && board[row + 1][col].isRevealed;
      const hasRevealedLeft = col > 0 && board[row] && board[row][col - 1] && board[row][col - 1].isRevealed;
      const hasRevealedRight = col < cols - 1 && board[row] && board[row][col + 1] && board[row][col + 1].isRevealed;

      const needsBorderTop = cell.isRevealed || hasRevealedAbove || isTopEdge;
      const needsBorderBottom = cell.isRevealed || hasRevealedBelow || isBottomEdge;
      const needsBorderLeft = cell.isRevealed || hasRevealedLeft || isLeftEdge;
      const needsBorderRight = cell.isRevealed || hasRevealedRight || isRightEdge;

      if (cell.isRevealed) {
        backgroundColor = themeColors.revealedCell;

        borderStyle = {
          borderWidth: 0,
          borderTopWidth: 2,
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderBottomWidth: 2,
          borderTopColor: '#444',
          borderLeftColor: '#444',
          borderRightColor: '#111',
          borderBottomColor: '#111',
        };

        shadowStyle = {
          elevation: 0,
          shadowOpacity: 0,
        };

        if (cell.isMine) {
          // Réduire la taille sur iOS également pour cohérence
          content = <ThemedText style={[styles.mine, cell.isExploded && styles.explodedMine, { fontSize: 16 }]}>💣</ThemedText>;
          backgroundColor = cell.isExploded ? themeColors.explodedMine : themeColors.regularMine;
        } else if (cell.adjacentMines > 0) {
          content = (
            <ThemedText style={[styles.number, { color: themeColors.textColor }]}>
              {cell.adjacentMines}
            </ThemedText>
          );
        }
      } else {
        borderStyle = {
          borderWidth: 0,
          borderTopWidth: needsBorderTop ? (isTopEdge ? 3 : 2) : 0,
          borderBottomWidth: needsBorderBottom ? (isBottomEdge ? 3 : 2) : 0,
          borderLeftWidth: needsBorderLeft ? (isLeftEdge ? 3 : 2) : 0,
          borderRightWidth: needsBorderRight ? (isRightEdge ? 3 : 2) : 0,
          borderTopColor: themeColors.lightBorder,
          borderLeftColor: themeColors.lightBorder,
          borderRightColor: themeColors.darkBorder,
          borderBottomColor: themeColors.darkBorder,
        };

        const needsShadow = isTopEdge || isBottomEdge || isLeftEdge || isRightEdge || hasRevealedNeighbor(row, col);

        shadowStyle = needsShadow ? {
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 1,
        } : {};

        if (cell.isFlagged) {
          // Réduire la taille sur iOS également pour cohérence
          content = <ThemedText style={[styles.flag, { fontSize: 16 }]}>🚩</ThemedText>;
        }
      }
    }

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell, 
          { 
            backgroundColor, 
            width: cellSize, 
            height: cellSize,
            ...borderStyle,
            ...shadowStyle,
          },
          // Style pour Android: aucune marge pour éviter les lignes
          Platform.OS === 'android' && {
            margin: 0,
            padding: 0,
          }
        ]}
        onPress={() => (flagMode ? toggleFlag(row, col) : revealCell(row, col))}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  };

  const renderBoard = () => {
    if (isInitializing || !board || board.length === 0 || board.length < rows) {
      return (
        <View style={[styles.boardContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ThemedText>Chargement...</ThemedText>
        </View>
      );
    }

    return (
      <View style={[
        {
          width: boardWidth,
          backgroundColor: Platform.OS === 'android' ? currentTheme.cellColor : 'transparent',
          overflow: 'hidden',
          borderRadius: 8,
        },
        Platform.OS === 'android' && {
          // Ajouter une ombre externe pour définir clairement les limites de la grille
          elevation: 4,
          // Bordure fine autour de toute la grille pour la délimiter
          borderWidth: 1,
          borderColor: currentTheme.darkBorderColor,
        }
      ]}>
        {board.map((row, rowIndex) => (
          <View 
            key={rowIndex} 
            style={[
              styles.row,
              Platform.OS === 'android' && {
                overflow: 'hidden',
                flexDirection: 'row', // S'assurer que c'est bien une ligne
                margin: 0,
                padding: 0,
                height: cellSize,
              }
            ]}
          >
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </View>
        ))}
      </View>
    );
  };

  // Fonction pour rejouer une partie
  const handlePlayAgain = () => {
    setShowEndGameModal(false);
    initializeBoard();
  };

  // Fonction pour retourner à la page d'accueil
  const handleBackToHome = () => {
    setShowEndGameModal(false);
    router.replace("/(tabs)/difficulty-select");
  };

  const renderEndGameModal = () => {
    return (
      <Modal
        transparent={true}
        visible={showEndGameModal}
        animationType="fade"
        onRequestClose={() => setShowEndGameModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <View style={{
            width: '80%',
            backgroundColor: modalBackgroundColor,
            borderRadius: 15,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5
          }}>
            <ThemedText style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 20,
              textAlign: 'center'
            }}>
              {gameResult === 'win' && difficulty === 'oneshot' 
                ? `INCROYABLE! Vous avez trouvé la seule case sans mine!` 
                : endGameMessage}
            </ThemedText>
            
            {gameResult === 'win' && (
              <Animated.View style={{ 
                transform: [{ scale: winAnimation }],
                marginBottom: 20
              }}>
                <ThemedText style={{
                  fontSize: Platform.OS === 'android' ? 24 : 40,
                  lineHeight: Platform.OS === 'android' ? 28 : 44,
                  textAlign: 'center',
                  color: 'white'
                }}>
                  🎉🏆🎉
                </ThemedText>
              </Animated.View>
            )}
            
            {gameResult === 'lose' && (
              <ThemedText style={{
                fontSize: Platform.OS === 'android' ? 24 : 40,
                lineHeight: Platform.OS === 'android' ? 28 : 44,
                textAlign: 'center',
                color: 'white',
                marginBottom: 20
              }}>
                💣💥😵
              </ThemedText>
            )}
            
            {gameResult === 'win' && difficulty === 'oneshot' && (
              <ThemedText style={{
                fontSize: 16,
                textAlign: 'center',
                color: 'white',
                marginBottom: 10,
                fontStyle: 'italic'
              }}>
                Les chances étaient de 1 sur {rows * cols}. Vous devriez jouer au loto!
              </ThemedText>
            )}
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: '100%',
              marginTop: 10
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'white',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  margin: 5
                }}
                onPress={handlePlayAgain}
              >
                <ThemedText style={{
                  color: '#333',
                  fontWeight: 'bold',
                  fontSize: 16
                }}>
                  Rejouer
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  margin: 5,
                  borderWidth: 1,
                  borderColor: 'white'
                }}
                onPress={handleBackToHome}
              >
                <ThemedText style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 16
                }}>
                  Accueil
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.scrollViewContainer,
        Platform.OS === 'android' && { 
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          paddingHorizontal: 0,
        }
      ]}
      showsVerticalScrollIndicator={true}
      removeClippedSubviews={Platform.OS === 'android'}
      scrollEnabled={true}
    >
      <TouchableWithoutFeedback onPress={() => showThemeMenu && setShowThemeMenu(false)}>
        <View style={[
          styles.container,
          { 
            width: '100%',       // Toujours 100% de largeur
            alignItems: 'center', 
            paddingHorizontal: 0, // Supprimer le padding horizontal
          }
        ]}>
          {/* Header section - 100% width */}
          <View style={{ 
            width: '100%', 
            paddingHorizontal: 8,
            alignItems: 'center',
          }}>
            {/* Conteneur de bouton de thème - ajuster pour le nouveau menu */}
            <View style={[
              styles.themeButtonContainer,
              { 
                width: '100%', 
                justifyContent: 'flex-end',
                flexDirection: 'row',
                height: 50,
                position: 'relative',
                alignItems: 'center',
                zIndex: 100,
                paddingHorizontal: 5, // Léger padding pour l'espacement
              }
            ]}>
              {renderThemeCircles()}
              
              <TouchableOpacity
                style={[
                  styles.themeButton, 
                  { 
                    backgroundColor: currentTheme.headerColor,
                    zIndex: 101,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 0, // Supprimer la marge droite
                  }
                ]}
                onPress={() => setShowThemeMenu(!showThemeMenu)}
              >
                <ThemedText style={{ fontSize: 20 }}>🎨</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Header bar - full width */}
            <View style={[
              styles.header, 
              themeStyle.header,
              { width: '100%' }
            ]}>
              <View style={styles.counterContainer}>
                <ThemedText style={[styles.counter, { 
                  color: currentTheme.textColor, 
                  fontSize: Platform.OS === 'android' ? 14 : 18,
                  lineHeight: Platform.OS === 'android' ? 18 : 22
                }]}>
                  <ThemedText style={{ fontSize: Platform.OS === 'android' ? 12 : 16 }}>🚩</ThemedText> {mines - flagsPlaced}
                </ThemedText>
              </View>
              
              <View style={styles.timerContainer}>
                <ThemedText style={[styles.timer, { 
                  color: currentTheme.textColor, 
                  fontSize: Platform.OS === 'android' ? 14 : 18,
                  lineHeight: Platform.OS === 'android' ? 18 : 22
                }]}>
                  <ThemedText style={{ fontSize: Platform.OS === 'android' ? 12 : 16 }}>⏱️</ThemedText> {formatTime(gameTime)}
                </ThemedText>
              </View>
            </View>
            
            {/* Difficulté actuelle - remplace les boutons */}
            <View style={{
              width: '100%',
              alignItems: 'center',
              marginVertical: 8,
              paddingVertical: 6,
              backgroundColor: difficulty === 'oneshot' ? 'rgba(255,0,0,0.1)' : 'rgba(0,0,0,0.05)',
              borderRadius: 8,
              borderWidth: difficulty === 'oneshot' ? 1 : 0,
              borderColor: 'rgba(255,0,0,0.3)'
            }}>
              <ThemedText style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: difficulty === 'oneshot' ? '#FF0000' : currentTheme.textColor
              }}>
                Niveau: {DIFFICULTIES[difficulty].name}
                {difficulty === 'oneshot' && ' ☠️'}
              </ThemedText>
              
              {difficulty === 'oneshot' && (
                <ThemedText style={{
                  fontSize: 12,
                  color: '#FF0000',
                  marginTop: 4,
                  fontStyle: 'italic'
                }}>
                  Une seule case sans mine. Bonne chance!
                </ThemedText>
              )}
            </View>
          </View>
          
          {/* Game board - scrollable if needed */}
          <View style={[
            styles.scrollContainer, 
            themeStyle.scrollContainer,
            { 
              width: Platform.OS === 'android' ? '100%' : CONTAINER_WIDTH,
              backgroundColor: 'transparent',
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 0,
              borderWidth: 0,
              alignItems: 'center',
              borderRadius: Platform.OS === 'android' ? 8 : 0,
              overflow: 'hidden',
              marginVertical: 10,
            }
          ]}>
            <ScrollView
              horizontal={needsHorizontalScroll}
              showsHorizontalScrollIndicator={needsHorizontalScroll}
              contentContainerStyle={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: needsHorizontalScroll ? 10 : 0,
              }}
            >
              <View style={[
                styles.boardContainer,
                { 
                  width: boardWidth,
                  backgroundColor: 'transparent',
                  alignSelf: 'center',
                  overflow: 'hidden',
                  borderRadius: Platform.OS === 'android' ? 8 : 0,
                }
              ]}>
                {renderBoard()}
              </View>
            </ScrollView>
          </View>
          
          {/* Correction du conteneur de mode - il manquait une ouverture de View */}
          <View style={[styles.modeContainer, themeStyle.modeContainer]}>
            <ThemedText style={[styles.modeText, { 
              color: currentTheme.textColor, 
              fontSize: Platform.OS === 'android' ? 12 : 16,
              lineHeight: Platform.OS === 'android' ? 14 : 18
            }]}>🔍</ThemedText>
            <Switch
              value={flagMode}
              onValueChange={setFlagMode}
              trackColor={{ false: '#767577', true: currentTheme.cellColor }}
              thumbColor={flagMode ? '#FF4500' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
            <ThemedText style={[styles.modeText, { 
              color: currentTheme.textColor, 
              fontSize: Platform.OS === 'android' ? 12 : 16,
              lineHeight: Platform.OS === 'android' ? 14 : 18
            }]}>🚩</ThemedText>
          </View>
          
      

          {renderEndGameModal()}
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  ); 
}