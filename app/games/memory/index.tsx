import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

const PIPE_WIDTH = 70;
const GAP = 180;
const GRAVITY = 0.8;
const JUMP = -10;
const SPEED = 4;

export default function App() {
  const [planeY, setPlaneY] = useState(height / 2);
  const [velocity, setVelocity] = useState(0);

  const [pipeX, setPipeX] = useState(width);
  const [gapY, setGapY] = useState(height / 2);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;

    const game = setInterval(() => {
      // Gravity
      setVelocity((v) => v + GRAVITY);

      setPlaneY((y) => y + velocity);

      // Move pipe
      setPipeX((x) => {
        let next = x - SPEED;

        if (next < -PIPE_WIDTH) {
          next = width;
          setGapY(150 + Math.random() * (height - 350));
          setScore((s) => s + 1);
        }

        return next;
      });
    }, 16);

    return () => clearInterval(game);
  }, [velocity, gameOver]);

  useEffect(() => {
    if (planeY < 0 || planeY > height - 50) {
      setGameOver(true);
    }

    const touchingPipe =
      pipeX < 90 && pipeX + PIPE_WIDTH > 40;

    const insideGap =
      planeY > gapY - GAP / 2 &&
      planeY < gapY + GAP / 2;

    if (touchingPipe && !insideGap) {
      setGameOver(true);
    }
  }, [planeY, pipeX]);

  function fly() {
    if (!gameOver) setVelocity(JUMP);
  }

  function restart() {
    setPlaneY(height / 2);
    setVelocity(0);
    setPipeX(width);
    setGapY(height / 2);
    setScore(0);
    setGameOver(false);
  }

  return (
    <Pressable style={styles.container} onPress={fly}>

      <Text style={styles.score}>
        ✈ Score {score}
      </Text>

      {/* Clouds */}
      <Text style={[styles.cloud,{top:70,left:50}]}>☁️</Text>
      <Text style={[styles.cloud,{top:150,left:250}]}>☁️</Text>

      {/* Top Pipe */}
      <View
        style={[
          styles.pipe,
          {
            left: pipeX,
            height: gapY - GAP / 2,
            top: 0,
          },
        ]}
      />

      {/* Bottom Pipe */}
      <View
        style={[
          styles.pipe,
          {
            left: pipeX,
            top: gapY + GAP / 2,
            height: height,
          },
        ]}
      />

      {/* Plane */}
      <Text
        style={[
          styles.plane,
          {
            top: planeY,
          },
        ]}
      >
        ✈️
      </Text>

      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.over}>
            GAME OVER
          </Text>

          <Text style={styles.final}>
            Score {score}
          </Text>

          <Pressable
            style={styles.button}
            onPress={restart}
          >
            <Text style={{color:"white"}}>
              Restart
            </Text>
          </Pressable>
        </View>
      )}

    </Pressable>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#87CEEB",
  },

  score:{
    marginTop:60,
    alignSelf:"center",
    fontSize:28,
    fontWeight:"bold",
  },

  plane:{
    position:"absolute",
    left:50,
    fontSize:45,
  },

  pipe:{
    position:"absolute",
    width:PIPE_WIDTH,
    backgroundColor:"#2ecc71",
  },

  cloud:{
    position:"absolute",
    fontSize:30,
  },

  overlay:{
    ...StyleSheet.absoluteFillObject,
    backgroundColor:"#0008",
    justifyContent:"center",
    alignItems:"center",
  },

  over:{
    fontSize:40,
    color:"white",
    fontWeight:"bold",
  },

  final:{
    fontSize:25,
    color:"white",
    marginVertical:20,
  },

  button:{
    backgroundColor:"#e74c3c",
    paddingHorizontal:30,
    paddingVertical:12,
    borderRadius:12,
  },

});