import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import {Text, View} from "react-native";

export default function GameScreen() {
  useEffect(() => {
    async function fullscreen() {
      // Hide Android navigation bar
      await NavigationBar.setVisibilityAsync("hidden");

      // Allow swipe from bottom to temporarily show it
      await NavigationBar.setBehaviorAsync("overlay-swipe");
    }

    fullscreen();

    return () => {
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);

  return (
    <>
      <StatusBar hidden />
      {/* Your game */}
      <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white", fontSize: 24, textAlign: "center", marginTop: 50 }}>
          Made by Skyla
        </Text>
      </View>
    </>
  );
}