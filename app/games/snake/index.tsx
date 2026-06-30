import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as NavigationBar from 'expo-navigation-bar';

const WIDTH = Dimensions.get("window").width;
const GROUND = 120;

// Level configurations
const LEVELS = {
  1: { speed: 8, gravity: 1, jumpPower: -18, obstacleInterval: 150, spawnRate: 1 },
  2: { speed: 10, gravity: 1.2, jumpPower: -19, obstacleInterval: 130, spawnRate: 1.2 },
  3: { speed: 12, gravity: 1.4, jumpPower: -20, obstacleInterval: 110, spawnRate: 1.5 },
  4: { speed: 14, gravity: 1.6, jumpPower: -21, obstacleInterval: 90, spawnRate: 1.8 },
  5: { speed: 16, gravity: 1.8, jumpPower: -22, obstacleInterval: 70, spawnRate: 2 },
};

const LEVEL_SCORES = {
  1: 0,
  2: 10,
  3: 25,
  4: 45,
  5: 70,
};

export default function App() {
  const [playerY, setPlayerY] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [rockX, setRockX] = useState(WIDTH);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [obstacles, setObstacles] = useState([{ id: 1, x: WIDTH }]);
  const [obstacleCounter, setObstacleCounter] = useState(0);
  

  // Load high score on start
  useEffect(() => {
    loadHighScore();
  }, []);

    useEffect(() => {
      const setupNavigationBar = async () => {
        try {
          await NavigationBar.setBackgroundColorAsync('#2bff00'); // Warm cream background
          await NavigationBar.setButtonStyleAsync('dark');       // Dark icons
        } catch (e) {
          console.log('NavigationBar setup failed (iOS is fine)');
        }
      };
  
      setupNavigationBar();
    }, []);

  const loadHighScore = async () => {
    try {
      const saved = await AsyncStorage.getItem('highScore');
      if (saved !== null) {
        setHighScore(parseInt(saved));
      }
    } catch (error) {
      console.error('Error loading high score:', error);
    }
  };

  const saveHighScore = async (newScore) => {
    try {
      await AsyncStorage.setItem('highScore', newScore.toString());
      setHighScore(newScore);
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  // Update level based on score
  useEffect(() => {
    let newLevel = 1;
    for (let [lvl, minScore] of Object.entries(LEVEL_SCORES)) {
      if (score >= minScore) {
        newLevel = parseInt(lvl);
      }
    }
    
    if (newLevel !== level) {
      setLevel(newLevel);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 1500);
    }
  }, [score]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    const currentLevel = LEVELS[level] || LEVELS[1];

    const interval = setInterval(() => {
      // Gravity
      setVelocity(v => v + currentLevel.gravity);
      setPlayerY(y => {
        let next = y + velocity;
        if (next > 0) next = 0;
        return next;
      });

      // Move obstacles
      setObstacles(prev => {
        return prev.map(obs => ({
          ...obs,
          x: obs.x - currentLevel.speed
        })).filter(obs => obs.x > -60);
      });

      // Spawn new obstacles
      setObstacleCounter(c => {
        const newCount = c + 1;
        const spawnThreshold = Math.floor(currentLevel.obstacleInterval / currentLevel.spawnRate);
        
        if (newCount >= spawnThreshold) {
          const newObstacle = {
            id: Date.now() + Math.random(),
            x: WIDTH + Math.random() * 100,
          };
          setObstacles(prev => [...prev, newObstacle]);
          return 0;
        }
        return newCount;
      });

      // Update score (every cycle that passes without dying)
      setScore(s => s + 0.1);

    }, 30);

    return () => clearInterval(interval);
  }, [velocity, gameOver, level]);

  // Collision detection
  useEffect(() => {
    const playerRect = { x: 40, y: playerY, width: 60, height: 60 };
    
    for (let obs of obstacles) {
      const obstacleRect = { x: obs.x, y: -60, width: 50, height: 50 };
      
      if (
        playerRect.x < obstacleRect.x + obstacleRect.width &&
        playerRect.x + playerRect.width > obstacleRect.x &&
        playerRect.y < obstacleRect.y + obstacleRect.height &&
        playerRect.y + playerRect.height > obstacleRect.y
      ) {
        // Collision detected
        setGameOver(true);
        if (Math.floor(score) > highScore) {
          saveHighScore(Math.floor(score));
        }
        break;
      }
    }
  }, [obstacles, playerY]);

  function jump() {
    if (playerY === 0 && !gameOver) {
      const currentLevel = LEVELS[level] || LEVELS[1];
      setVelocity(currentLevel.jumpPower);
    }
  }

  function restart() {
    setPlayerY(0);
    setVelocity(0);
    setObstacles([{ id: 1, x: WIDTH }]);
    setScore(0);
    setGameOver(false);
    setLevel(1);
    setObstacleCounter(0);
    setShowLevelUp(false);
  }

  return (
    <Pressable style={styles.container} onPress={jump}>
      <StatusBar hidden />
      
      {/* Score and Level Display */}
      <View style={styles.header}>
        <Text style={styles.score}>Score: {Math.floor(score)}</Text>
        <Text style={styles.level}>Level: {level}</Text>
        <Text style={styles.highScore}>🏆 {highScore}</Text>
      </View>

      {/* Level Up Notification */}
      {showLevelUp && (
        <View style={styles.levelUpContainer}>
          <Text style={styles.levelUpText}>⬆ LEVEL {level}! ⬆</Text>
        </View>
      )}

      {/* Player */}
      <View
        style={[
          styles.player,
          { bottom: GROUND - playerY },
        ]}
      >
        <Text style={{ fontSize: 40 }}>🏃</Text>
      </View>

      {/* Obstacles */}
      {obstacles.map((obs) => (
        <View
          key={obs.id}
          style={[
            styles.rock,
            { left: obs.x },
          ]}
        >
          <Text style={{ fontSize: 40 }}>🪨</Text>
        </View>
      ))}

      {/* Ground */}
      <View style={styles.ground} />

      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.gameOver}>GAME OVER</Text>
          <Text style={styles.finalScore}>Score: {Math.floor(score)}</Text>
          {Math.floor(score) >= highScore && highScore > 0 && (
            <Text style={styles.newRecord}>🎉 NEW RECORD! 🎉</Text>
          )}
          <Pressable onPress={restart} style={styles.button}>
            <Text style={{ color: "white", fontSize: 18 }}>Restart</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  header: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 10,
  },
  score: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  level: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  highScore: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
  },
  levelUpContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  levelUpText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FF6B35',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  player: {
    position: "absolute",
    left: 60,
    zIndex: 5,
  },
  rock: {
    position: "absolute",
    bottom: GROUND,
    zIndex: 5,
  },
  ground: {
    position: "absolute",
    bottom: 0,
    height: GROUND,
    width: "100%",
    backgroundColor: "#4CAF50",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
    zIndex: 30,
  },
  gameOver: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 10,
  },
  finalScore: {
    color: "white",
    fontSize: 24,
    marginBottom: 5,
  },
  newRecord: {
    color: "#FFD700",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 5,
  },
});