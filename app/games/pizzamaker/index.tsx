import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

const TOPPINGS = [
  { id: "🍅", name: "Tomato" },
  { id: "🧀", name: "Cheese" },
  { id: "🍄", name: "Mushroom" },
  { id: "🍖", name: "Pepperoni" },
];

function randomOrder() {
  const count = Math.floor(Math.random() * 3) + 1;

  const copy = [...TOPPINGS].sort(() => Math.random() - 0.5);

  return copy.slice(0, count);
}

export default function App() {
  const [order, setOrder] = useState(randomOrder());
  const [pizza, setPizza] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  function addTopping(id: string) {
    setPizza((p) => [...p, id]);
  }

  function servePizza() {
    const expected = order.map((x) => x.id).sort().join("");

    const actual = [...pizza].sort().join("");

    if (expected === actual) {
      setScore(score + 10);
      alert("✅ Perfect Pizza!");
    } else {
      alert("❌ Wrong Order!");
    }

    setPizza([]);
    setOrder(randomOrder());
  }

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>🍕 Pizza Maker</Text>

      <Text style={styles.score}>Score : {score}</Text>

      <View style={styles.card}>
        <Text style={{ fontWeight: "bold" }}>Customer Wants</Text>

        <Text style={{ fontSize: 30 }}>
          {order.map((o) => o.id).join(" ")}
        </Text>
      </View>

      <View style={styles.pizza}>
        <Text style={{ fontSize: 80 }}>🍕</Text>

        <Text style={{ fontSize: 35 }}>
          {pizza.join(" ")}
        </Text>
      </View>

      <Text style={styles.subtitle}>Ingredients</Text>

      <View style={styles.row}>
        {TOPPINGS.map((t) => (
          <Pressable
            key={t.id}
            style={styles.button}
            onPress={() => addTopping(t.id)}
          >
            <Text style={{ fontSize: 35 }}>{t.id}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.bigButton, { backgroundColor: "#2ecc71" }]}
        onPress={servePizza}
      >
        <Text style={styles.buttonText}>Serve Pizza</Text>
      </Pressable>

      <Pressable
        style={[styles.bigButton, { backgroundColor: "#3498db" }]}
        onPress={() => {
          setPizza([]);
          setOrder(randomOrder());
        }}
      >
        <Text style={styles.buttonText}>New Order</Text>
      </Pressable>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8e8",
    alignItems: "center",
    paddingTop: 40,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 22,
    marginTop: 25,
    fontWeight: "600",
  },

  score: {
    fontSize: 20,
    marginVertical: 15,
  },

  card: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
  },

  pizza: {
    width: 240,
    height: 240,
    marginTop: 30,
    borderRadius: 120,
    backgroundColor: "#f9d77e",
    justifyContent: "center",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    marginTop: 15,
  },

  button: {
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 15,
  },

  bigButton: {
    marginTop: 20,
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 12,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
}); 