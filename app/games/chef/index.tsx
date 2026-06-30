import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Game Constants built off your engine
const ITEM_SIZE = 50;
const GRAVITY = 0.7;
const JUMP = -9;
const SPEED = 5;

// Delightful topping array
const TOPPINGS = ["🍕", "🍄", "🧀", "🍅"];
const HAZARDS = ["🔥", "🧼"];

export default function PizzaCatcher() {
  const [chefY, setChefY] = useState(height / 2);
  const [velocity, setVelocity] = useState(0);

  // Instead of pipes, we route a horizontal moving item spawning from the right
  const [itemX, setItemX] = useState(width);
  const [itemY, setItemY] = useState(height / 2);
  const [itemType, setItemType] = useState("🍕");
  const [isHazard, setIsHazard] = useState(false);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;

    const game = setInterval(() => {
      // Apply your classic gravity physics
      setVelocity((v) => v + GRAVITY);
      setChefY((y) => y + velocity);

      // Move item across the kitchen floor (Right to Left)
      setItemX((x) => {
        let next = x - SPEED;

        // Reset item when it goes off-screen
        if (next < -ITEM_SIZE) {
          next = width;
          setItemY(150 + Math.random() * (height - 300));
          
          // 30% chance to spawn a fire hazard instead of a delicious ingredient!
          const spawnHazard = Math.random() < 0.3;
          setIsHazard(spawnHazard);
          setItemType(
            spawnHazard 
              ? HAZARDS[Math.floor(Math.random() * HAZARDS.length)]
              : TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)]
          );
        }
        return next;
      });
    }, 16);

    return () => clearInterval(game);
  }, [velocity, gameOver]);

  // Collision Engine
  useEffect(() => {
    // Ground or ceiling collision
    if (chefY < 40 || chefY > height - 100) {
      setGameOver(true);
    }

    // Checking if Chef overlaps the item
    const chefX = 60; // Locked horizontal position of chef
    const touchingItem = 
      itemX < chefX + 40 && itemX + ITEM_SIZE > chefX;

    const insideVerticalRange = 
      chefY < itemY + ITEM_SIZE && chefY + 50 > itemY;

    if (touchingItem && insideVerticalRange) {
      if (isHazard) {
        // Oops, burned the pizza crust!
        setGameOver(true);
      } else {
        // Yum! Caught a topping successfully! Move it away and gain score
        setScore((s) => s + 1);
        setItemX(-ITEM_SIZE); // Instantly triggers a re-spawn cycle
      }
    }
  }, [chefY, itemX]);

  function fly() {
    if (!gameOver) setVelocity(JUMP);
  }

  function restart() {
    setChefY(height / 2);
    setVelocity(0);
    setItemX(width);
    setItemY(height / 2);
    setItemType("🍕");
    setIsHazard(false);
    setScore(0);
    setGameOver(false);
  }

  return (
    <Pressable style={styles.container} onPress={fly}>
      
      {/* Bakery Counter HUD */}
      <View style={styles.hud}>
        <Text style={styles.scoreText}>🍕 Ingredients: {score}</Text>
      </View>

      <Text style={[styles.decor, { top: 120, left: 40 }]}>🍩</Text>
      <Text style={[styles.decor, { top: 200, right: 50 }]}>🍪</Text>

      {/* Falling Item (Topping or Hazard) */}
      <Text
        style={[
          styles.item,
          {
            left: itemX,
            top: itemY,
          },
        ]}
      >
        {itemType}
      </Text>

      {/* The Jumping Baker */}
      <Text
        style={[
          styles.chef,
          {
            top: chefY,
          },
        ]}
      >
        👨‍🍳
      </Text>

      {/* Kitchen Floor Border */}
      <View style={styles.floor} />

      {/* Bakery Game Over Screen */}
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.overText}>Oven Overheated! 🛑</Text>
          <Text style={styles.finalText}>You baked a {score}-topping pizza!</Text>

          <Pressable style={styles.button} onPress={restart}>
            <Text style={styles.buttonText}>Bake Another Pie 🔄</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6", // Creamy dough vanilla background
  },
  hud: {
    marginTop: 60,
    alignSelf: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F3EAD3",
  },
  scoreText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#5C3E35",
  },
  chef: {
    position: "absolute",
    left: 60,
    fontSize: 50,
  },
  item: {
    position: "absolute",
    fontSize: 42,
  },
  decor: {
    position: "absolute",
    fontSize: 28,
    opacity: 0.15,
  },
  floor: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 40,
    backgroundColor: "#E05353", // Brick pizza oven red floor
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(92, 62, 53, 0.85)", // Rich chocolate translucent overlay
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overText: {
    fontSize: 34,
    color: "#FFF",
    fontWeight: "900",
    textAlign: "center",
  },
  finalText: {
    fontSize: 20,
    color: "#FFF9E6",
    marginVertical: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
});