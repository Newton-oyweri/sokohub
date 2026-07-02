import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";

const { width, height } = Dimensions.get("window");

// ============================================
// 🎮 GAME CONFIGURATION - Easy to adjust!
// ============================================
const GAME_CONFIG = {
  PIPE_WIDTH: 70,
  GAP: 180,
  GRAVITY: 0.8,
  JUMP: -10,
  SPEED: 4,
};

// ============================================
// 🎵 AUDIO CONFIGURATION - Easy to adjust!
// ============================================
const AUDIO_CONFIG = {
  // ⏰ If your audio is delayed by 2 seconds, set this to 2.0
  // This shifts ALL lyrics forward by this amount
  LYRIC_OFFSET: 2.0, // <-- CHANGE THIS VALUE TO FIX DELAY
  
  // How often to check for lyric updates (in milliseconds)
  UPDATE_INTERVAL: 100,
  
  // Should the audio loop?
  LOOP: true,
};

// ============================================
// 🎨 VISUAL CONFIGURATION - Easy to adjust!
// ============================================
const VISUAL_CONFIG = {
  CLUB_COLORS: ["#2ecc71", "#9b59b6", "#e74c3c", "#f1c40f", "#3498db", "#e84393"],
  BEAT_PULSE_FRAMES: 25, // Lower = faster pulse, Higher = slower pulse
};

// ============================================
// 📝 LYRICS - Actual "Takeaway" lyrics
// ============================================
const LYRICS_TIMELINE = [
  { time: 0, text: "🎶 Your heart for takeaway..." },
  { time: 1, text: "💔 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 5, text: "🎵 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 10, text: "🎧 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 15, text: "🔥 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 20, text: "👋 Hey hey hey, where do you think you're going?" },
  { time: 23, text: "🌙 It's so late late late, what's wrong?" },
  { time: 27, text: "💬 I said I can't stay" },
  { time: 30, text: "🤔 Do I have to give a reason?" },
  { time: 32, text: "😤 It's just me me me, it's what I want" },
  { time: 37, text: "❓ So how did we get here?" },
  { time: 40, text: "⏳ Three weeks now, we've been so caught up" },
  { time: 43, text: "🏃 Better if we do this on our own" },
  { time: 46, text: "💔 Before I love you, na na na" },
  { time: 49, text: "🚶 I'm gonna leave you, na na na" },
  { time: 51, text: "🛡️ Before I'm someone you leave behind" },
  { time: 54, text: "💥 I'll break your heart so you don't break mine" },
  { time: 56, text: "💔 Before I love you, na na na" },
  { time: 59, text: "🚶 I'm gonna leave you, na na na" },
  { time: 61, text: "💖 Even if I'm not here to stay, I still want your heart" },
  { time: 65, text: "🎵 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 70, text: "🎵 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 75, text: "🎵 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 80, text: "🎵 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 84, text: "💖 Your heart for takeaway" },
  { time: 87, text: "🎵 Your heart for takeaway" },
  { time: 92, text: "🎵 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 97, text: "🌌 Fate fate fate, is that what came between us?" },
  { time: 101, text: "🤷 Or did we do this on our own?" },
  { time: 106, text: "❓ So how did we get here?" },
  { time: 109, text: "🤔 I'm asking myself why I'm so caught up" },
  { time: 112, text: "🏃 Better if we do this on our own" },
  { time: 115, text: "💔 Before I love you, na na na" },
  { time: 118, text: "🚶 I'm gonna leave you, na na na" },
  { time: 120, text: "🛡️ Before I'm someone you leave behind" },
  { time: 123, text: "💥 I'll break your heart so you don't break mine" },
  { time: 125, text: "💔 Before I love you, na na na" },
  { time: 128, text: "🚶 I'm gonna leave you, na na na" },
  { time: 130, text: "💖 Even if I'm not here to stay, I still want your heart" },
  { time: 134, text: "🎵 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 139, text: "🎵 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 144, text: "🎵 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 149, text: "🎵 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 154, text: "💖 Your heart for takeaway" },
  { time: 157, text: "🎵 Your heart for takeaway" },
  { time: 162, text: "🎵 Your heart for takeaway, yeah yeah yeah yeah" },
  { time: 167, text: "💔 Before I love you, na na na" },
  { time: 170, text: "🚶 I'm gonna leave you, na na na" },
  { time: 172, text: "🛡️ Before I'm someone you leave behind" },
  { time: 175, text: "💥 I'll break your heart so you don't break mine" },
  { time: 177, text: "💔 Before I love you, na na na" },
  { time: 180, text: "🚶 I'm gonna leave you, na na na" },
  { time: 182, text: "💖 Even if I'm not here to stay, I still want your heart" },
];

// ============================================
// 🎯 MAIN COMPONENT
// ============================================
export default function GameScreen() {
  const [planeY, setPlaneY] = useState(height / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipeX, setPipeX] = useState(width);
  const [gapY, setGapY] = useState(height / 2);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Rhythmic States
  const [beatPulse, setBeatPulse] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  // Audio Syncing States
  const [songSeconds, setSongSeconds] = useState(0);
  const [currentLyric, setCurrentLyric] = useState(LYRICS_TIMELINE[0].text);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  const isMountedRef = useRef(true);

  // Immersive Fullscreen
  useEffect(() => {
    async function fullscreen() {
      await NavigationBar.setVisibilityAsync("hidden");
      await NavigationBar.setBehaviorAsync("overlay-swipe");
    }
    fullscreen();
    return () => { NavigationBar.setVisibilityAsync("visible"); };
  }, []);

  // 🎵 LOAD AUDIO
  useEffect(() => {
    let soundObject: Audio.Sound | null = null;

    async function loadAudio() {
      try {
        const { sound: playbackObject } = await Audio.Sound.createAsync(
          require("./assets/takeaway.mp3"),
          { shouldPlay: false, isLooping: AUDIO_CONFIG.LOOP }
        );
        
        soundObject = playbackObject;
        soundRef.current = playbackObject;
        setIsSoundLoaded(true);
        
      } catch (error) {
        console.log("Error loading audio asset file:", error);
      }
    }

    loadAudio();

    return () => {
      isMountedRef.current = false;
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, []);

  // 🎵 SETUP LYRIC SYNC
  useEffect(() => {
    if (!isSoundLoaded || !soundRef.current) return;

    const setupLyricSync = async () => {
      try {
        if (soundRef.current) {
          soundRef.current.setOnPlaybackStatusUpdate((status) => {
            if (!isMountedRef.current || !status.isLoaded) return;

            if (status.didJustFinish) {
              return;
            }

            if (status.isPlaying) {
              // Apply the offset to fix audio delay
              const currentTime = status.positionMillis / 1000 - AUDIO_CONFIG.LYRIC_OFFSET;
              
              setSongSeconds(currentTime);

              for (let i = LYRICS_TIMELINE.length - 1; i >= 0; i--) {
                if (currentTime >= LYRICS_TIMELINE[i].time) {
                  setCurrentLyric(LYRICS_TIMELINE[i].text);
                  break;
                }
              }
            }
          });

          await soundRef.current.setProgressUpdateIntervalAsync(AUDIO_CONFIG.UPDATE_INTERVAL);
        }
      } catch (error) {
        console.log("Error setting up lyric sync:", error);
      }
    };

    setupLyricSync();

    return () => {
      if (soundRef.current) {
        soundRef.current.setOnPlaybackStatusUpdate(null);
      }
    };
  }, [isSoundLoaded]);

  // 🎮 GAME STARTS → PLAY MUSIC
  useEffect(() => {
    async function playMusicOnGameStart() {
      if (!gameOver && isSoundLoaded && soundRef.current) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) {
            await soundRef.current.playAsync();
          }
        } catch (error) {
          console.log("Error playing music:", error);
        }
      }
    }
    playMusicOnGameStart();
  }, [gameOver, isSoundLoaded]);

  // ⏹️ STOP MUSIC WHEN GAME OVER
  useEffect(() => {
    async function handleGameOverMusic() {
      if (gameOver && soundRef.current) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await soundRef.current.pauseAsync();
          }
        } catch (error) {
          console.log("Error pausing music:", error);
        }
      }
    }
    handleGameOverMusic();
  }, [gameOver]);

  // Main Game Loop
  useEffect(() => {
    if (gameOver) return;

    let frameCount = 0;
    const game = setInterval(() => {
      setVelocity((v) => v + GAME_CONFIG.GRAVITY);
      setPlaneY((y) => y + velocity);

      frameCount++;
      if (frameCount % VISUAL_CONFIG.BEAT_PULSE_FRAMES === 0) {
        setBeatPulse((p) => !p);
        setColorIndex((prevIndex) => (prevIndex + 1) % VISUAL_CONFIG.CLUB_COLORS.length);
      }

      setPipeX((x) => {
        let next = x - GAME_CONFIG.SPEED;
        if (next < -GAME_CONFIG.PIPE_WIDTH) {
          next = width;
          setGapY(150 + Math.random() * (height - 350));
          setScore((s) => s + 1);
        }
        return next;
      });
    }, 16);

    return () => clearInterval(game);
  }, [velocity, gameOver]);

  // Collision Logic
  useEffect(() => {
    if (planeY < 0 || planeY > height - 50) setGameOver(true);
    const touchingPipe = pipeX < 90 && pipeX + GAME_CONFIG.PIPE_WIDTH > 40;
    const insideGap = planeY > gapY - GAME_CONFIG.GAP / 2 && planeY < gapY + GAME_CONFIG.GAP / 2;
    if (touchingPipe && !insideGap) setGameOver(true);
  }, [planeY, pipeX]);

  function fly() {
    if (!gameOver) setVelocity(GAME_CONFIG.JUMP);
  }

  async function restart() {
    setPlaneY(height / 2);
    setVelocity(0);
    setPipeX(width);
    setGapY(height / 2);
    setScore(0);
    setGameOver(false);
    setColorIndex(0);
    setSongSeconds(0);
    setCurrentLyric(LYRICS_TIMELINE[0].text);
    
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
      } catch (error) {
        console.log("Error restarting music:", error);
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const dynamicPipeColor = VISUAL_CONFIG.CLUB_COLORS[colorIndex];

  return (
    <>
      <StatusBar hidden />
      <Pressable style={styles.container} onPress={fly}>
        
        <Text style={styles.score}>
          ✈ Score {score} | ⏱️ {formatTime(songSeconds)}
        </Text>

        <View style={[styles.layerContainer, { top: 70, left: 50 }]}>
          <Text style={styles.cloud}>☁️</Text>
        </View>

        <View style={[styles.layerContainer, { top: 150, left: 120 }]}>
          <Text style={styles.cloud}>☁️</Text>
          <Text style={[styles.lyricText, { transform: [{ scale: beatPulse ? 1.05 : 1.0 }] }]}>
            {currentLyric}
          </Text>
        </View>

        <View style={[styles.pipe, { left: pipeX, height: gapY - GAME_CONFIG.GAP / 2, top: 0, backgroundColor: dynamicPipeColor }]} />
        <View style={[styles.pipe, { left: pipeX, top: gapY + GAME_CONFIG.GAP / 2, height: height, backgroundColor: dynamicPipeColor }]} />

        <Text style={[styles.plane, { top: planeY }]}>✈️</Text>

        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.over}>💥 GAME OVER</Text>
            <Text style={styles.final}>Score: {score}</Text>
            <Pressable style={styles.button} onPress={restart}>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
                🔄 Play Again
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#87CEEB" },
  score: { marginTop: 60, alignSelf: "center", fontSize: 22, fontWeight: "bold", color: "#fff", zIndex: 10, textShadowColor: "rgba(0, 0, 0, 0.3)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  plane: { position: "absolute", left: 50, fontSize: 45, zIndex: 5 },
  pipe: { position: "absolute", width: GAME_CONFIG.PIPE_WIDTH, zIndex: 2, borderRadius: 8, borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  layerContainer: { position: "absolute", flexDirection: "row", alignItems: "center", zIndex: 1 },
  cloud: { fontSize: 30, opacity: 0.8 },
  lyricText: { marginLeft: 10, fontSize: 16, fontWeight: "bold", color: "#fff", textShadowColor: "rgba(0, 0, 0, 0.4)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4, maxWidth: width - 180 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", zIndex: 20 },
  over: { fontSize: 40, color: "white", fontWeight: "bold", marginBottom: 10 },
  final: { fontSize: 25, color: "white", marginVertical: 20 },
  button: { backgroundColor: "#2ecc71", paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12, elevation: 5 },
});