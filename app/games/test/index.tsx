import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Text,
} from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

export default function GameTest() {
  
  // 📱 Immersion Fullscreen Controls
  useEffect(() => {
    async function hideSystemUI() {
      await NavigationBar.setVisibilityAsync("hidden");
      await NavigationBar.setBehaviorAsync("overlay-swipe");
    }
    hideSystemUI();

    return () => {
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
      >
        {/* PHASE 1: Deep Red Orange */}
        <View style={[styles.section, { backgroundColor: "#d35400" }]}>
          <Text style={styles.hillSymbol}>⛰️</Text>
          <Text style={styles.labelText}>Phase 1</Text>
          {/* Right-edge blend transition overlay */}
          <View style={[styles.blendEdge, { backgroundColor: "#9b59b6" }]} />
        </View>

        {/* PHASE 2: Purple Violet */}
        <View style={[styles.section, { backgroundColor: "#9b59b6" }]}>
          <Text style={styles.hillSymbol}>🏔️</Text>
          <Text style={styles.labelText}>Phase 2</Text>
          {/* Right-edge blend transition overlay */}
          <View style={[styles.blendEdge, { backgroundColor: "#2980b9" }]} />
        </View>

        {/* PHASE 3: Deep Ocean Blue */}
        <View style={[styles.section, { backgroundColor: "#2980b9" }]}>
          <Text style={styles.hillSymbol}>⛰️</Text>
          <Text style={styles.labelText}>Phase 3</Text>
          {/* Right-edge blend transition overlay */}
          <View style={[styles.blendEdge, { backgroundColor: "#1abc9c" }]} />
        </View>

        {/* PHASE 4: Mint Teal (Closes the infinite loop back to Deep Red Orange) */}
        <View style={[styles.section, { backgroundColor: "#1abc9c" }]}>
          <Text style={styles.hillSymbol}>🌋</Text>
          <Text style={styles.labelText}>Looping Back...</Text>
          {/* Right-edge blend transition overlay loops directly into Section 1 color */}
          <View style={[styles.blendEdge, { backgroundColor: "#d35400" }]} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  section: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  blendEdge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: width * 0.4, // Blends across 40% of the screen width
    height: "100%",
    opacity: 0.35, // Smooth color overlay transparency
  },
  hillSymbol: {
    fontSize: 80,
    marginBottom: 10,
    opacity: 0.85,
  },
  labelText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    opacity: 0.5,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
});