import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Dimensions, Vibration, Switch, ScrollView, Animated, Alert, TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { styles, colors, THEMES, MinesweeperTheme } from './MinesweeperStyles';

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

// Taille fixe pour les cellules, quel que soit le niveau de difficulté
const FIXED_CELL_SIZE = 35;

// Définition des difficultés (sans scale car nous utilisons une taille fixe)
const DIFFICULTIES: Record<string, Difficulty> = {
  easy: { rows: 9, cols: 9, mines: 10, name: 'Facile' },
  medium: { rows: 16, cols: 16, mines: 40, name: 'Moyen' },
  hard: { rows: 16, cols: 30, mines: 99, name: 'Difficile' },
};

export default function MinesweeperBoard({
  initialDifficulty = 'easy',
  onGameOver = () => {},
  onGameWin = () => {},
}: {
  initialDifficulty?: keyof typeof DIFFICULTIES;
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
  
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  const menuAnimWidth = useRef(new Animated.Value(0)).current;
  const carpetOpacity = useRef(new Animated.Value(0)).current;
  const winAnimation = useRef(new Animated.Value(0)).current;
  
  const { rows, cols, mines, name } = DIFFICULTIES[difficulty];
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Taille fixe pour les cellules
  const cellSize = FIXED_CELL_SIZE;
  
  // Calculer la taille totale du plateau
  const boardWidth = cols * cellSize;
  const boardHeight = rows * cellSize;
  
  // Déterminer l'orientation du conteneur en fonction du dispositif
  // PC: horizontal (container plus large), Mobile: vertical (container plus haut)
  const CONTAINER_WIDTH = isPC ? Math.min(screenWidth * 0.8, 1200) : Math.min(screenWidth - 40, 350);
  const CONTAINER_HEIGHT = isPC ? Math.min(screenHeight * 0.6, 500) : Math.min(screenHeight * 0.6, 600);

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
    // On peut laisser le menu ouvert après la sélection pour voir l'effet du changement
    // ou le fermer comme dans l'exemple original
    setShowThemeMenu(false);
  };
  
  const renderThemeCircles = () => {
    // Calculer la largeur totale dont on a besoin pour tous les cercles
    const themeCircleWidth = 50; // Largeur d'un cercle avec sa marge
    const totalWidth = themeCircleWidth * THEMES.length;
    
    // Transformer la valeur animée pour la largeur du menu
    const menuWidth = menuAnimWidth.interpolate({
      inputRange: [0, 1],
      outputRange: [0, totalWidth]
    });
    
    return (
      <Animated.View 
        style={[
          styles.themeMenuRollout,
          { width: menuWidth }
        ]}
      >
        <View style={styles.themeCirclesContainer}>
          {THEMES.map((theme, index) => {
            // Calculer un délai d'apparition pour chaque cercle
            const delay = index * 100;
            
            return (
              <Animated.View 
                key={theme.id}
                style={[
                  styles.themeCircleWrapper,
                  {
                    opacity: menuAnimWidth.interpolate({
                      inputRange: [0, 0.2 + (index * 0.15), 1],
                      outputRange: [0, 0, 1]
                    }),
                    transform: [{
                      scale: menuAnimWidth.interpolate({
                        inputRange: [0, 0.5 + (index * 0.1), 1],
                        outputRange: [0.5, 0.5, 1]
                      })
                    }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.themeCircle,
                    { backgroundColor: theme.cellColor },
                    currentTheme.id === theme.id && styles.activeThemeCircle
                  ]}
                  onPress={() => changeTheme(theme)}
                >
                  {currentTheme.id === theme.id && (
                    <View style={styles.themeCircleCheckmark}>
                      <ThemedText style={styles.checkmarkText}>✓</ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>
    );
  };
  
  const changeDifficulty = (newDifficulty: keyof typeof DIFFICULTIES) => {
    if (newDifficulty === difficulty) return;
    
    if (gameStarted && !gameOver && !gameWon) {
      Alert.alert(
        "Changer de difficulté",
        "Changer de difficulté redémarrera la partie. Continuer ?",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Continuer", 
            onPress: () => {
              setDifficulty(newDifficulty);
            }
          }
        ]
      );
    } else {
      setDifficulty(newDifficulty);
    }
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
      const boardWithMines = placeMines(newBoard, row, col);
      setBoard(revealCellRecursive(boardWithMines, row, col));
      return;
    }

    if (newBoard[row][col].isMine) {
      Vibration.vibrate(500);
      
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
      
      onGameOver();
      return;
    }

    Vibration.vibrate(10);
    
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
      Vibration.vibrate(5);
    } else if (flagsPlaced < mines) {
      newBoard[row][col].isFlagged = true;
      setFlagsPlaced(flagsPlaced + 1);
      Vibration.vibrate(10);
    } else {
      Vibration.vibrate([0, 30, 10, 30]);
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
      
      onGameWin();
      
      Vibration.vibrate([0, 50, 50, 100, 50, 150]);
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

  const renderDifficultyButtons = () => {
    return (
      <View style={styles.difficultyButtonsContainer}>
        {(Object.keys(DIFFICULTIES) as Array<keyof typeof DIFFICULTIES>).map(diff => (
          <TouchableOpacity
            key={diff}
            style={[
              styles.difficultyButton,
              difficulty === diff && styles.activeDifficultyButton
            ]}
            onPress={() => changeDifficulty(diff)}
          >
            <ThemedText style={[
              styles.difficultyButtonText,
              difficulty === diff && styles.activeDifficultyButtonText
            ]}>
              {DIFFICULTIES[diff].name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

 

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

    let backgroundColor = themeColors.cellBackground;
    let content = null;
    let borderStyle = {};
    let shadowStyle = {};

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
        content = <ThemedText style={[styles.mine, cell.isExploded && styles.explodedMine]}>💣</ThemedText>;
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
        elevation: 3,
      } : {};
      
      if (cell.isFlagged) {
        content = <ThemedText style={styles.flag}>🚩</ThemedText>;
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
    
    return board.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
      </View>
    ));
  };

  const themeStyle = {
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

  return (
    <TouchableWithoutFeedback onPress={() => showThemeMenu && setShowThemeMenu(false)}>
      <View style={styles.container}>
        <View style={styles.themeButtonContainer}>
          {renderThemeCircles()}
          
          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: currentTheme.headerColor }]}
            onPress={() => setShowThemeMenu(!showThemeMenu)}
          >
            <ThemedText style={styles.themeButtonText}>🎨</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={[styles.header, themeStyle.header]}>
          <View style={styles.counterContainer}>
            <ThemedText style={[styles.counter, { color: currentTheme.textColor }]}>
              🚩 {mines - flagsPlaced}
            </ThemedText>
          </View>
          
          <TouchableOpacity 
            style={[styles.resetButton, themeStyle.resetButton]} 
            onPress={initializeBoard}
          >
            <ThemedText style={styles.resetText}>
              {gameOver ? '😵' : gameWon ? '😎' : gameStarted ? '🙂' : '😊'}
            </ThemedText>
          </TouchableOpacity>
          
          <View style={styles.timerContainer}>
            <ThemedText style={[styles.timer, { color: currentTheme.textColor }]}>
              ⏱️ {formatTime(gameTime)}
            </ThemedText>
          </View>
        </View>
        
        {renderDifficultyButtons()}
        
        <ThemedText style={[styles.difficultyText, { color: currentTheme.textColor }]}>
          Niveau: {name} ({rows}×{cols}, {mines} mines)
        </ThemedText>
        
        <View style={[
          styles.scrollContainer, 
          themeStyle.scrollContainer,
          { 
            width: isPC ? Math.min(boardWidth + 20, CONTAINER_WIDTH) : CONTAINER_WIDTH,
            height: isPC ? CONTAINER_HEIGHT : Math.min(boardHeight + 20, CONTAINER_HEIGHT),
            backgroundColor: 'transparent', // Fond transparent
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 4,
            borderWidth: 0, // Enlever la bordure si besoin
          }
        ]}>
          <ScrollView
            ref={scrollViewRef}
            horizontal={true}
            showsHorizontalScrollIndicator={true}
          >
            <ScrollView
              showsVerticalScrollIndicator={true}
            >
              <View style={[
                styles.boardContainer,
                { 
                  width: boardWidth,
                  height: boardHeight,
                  backgroundColor: 'transparent' // Fond transparent pour le conteneur du board
                }
              ]}>
                {renderBoard()}
              </View>
            </ScrollView>
          </ScrollView>
        </View>
        
        <ThemedText style={[styles.zoomIndicator, { color: currentTheme.textColor }]}>
          {isPC ? 'Vue horizontale' : 'Vue verticale'} • Cellule: {cellSize}px
        </ThemedText>
        
        <View style={[styles.modeContainer, themeStyle.modeContainer]}>
          <ThemedText style={[styles.modeText, { color: currentTheme.textColor }]}>🔍</ThemedText>
          <Switch
            value={flagMode}
            onValueChange={setFlagMode}
            trackColor={{ false: '#767577', true: currentTheme.cellColor }}
            thumbColor={flagMode ? '#FF4500' : '#f4f3f4'}
          />
          <ThemedText style={[styles.modeText, { color: currentTheme.textColor }]}>🚩</ThemedText>
        </View>
        
        <ThemedText style={[styles.currentMode, { color: currentTheme.textColor }]}>
          Mode: {flagMode ? 'Placer un drapeau' : 'Révéler une case'}
        </ThemedText>
        
        {gameOver && (
          <ThemedText style={styles.gameOverText}>
            Game Over!
          </ThemedText>
        )}
        
        {gameWon && (
          <Animated.View style={{ 
            transform: [{ scale: winAnimation }],
          }}>
            <ThemedText style={styles.gameWonText}>
              Victoire! 🎉 {formatTime(gameTime)}
            </ThemedText>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}