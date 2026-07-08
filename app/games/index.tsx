import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import SkyBeatsGameCard from './gamecards/fly';
import Allgames from './gamecards/Gamecard';
import { GAME_IMAGES } from './gameImages';

// Define the Game interface to match what Allgames expects
interface Game {
  id: string;
  title: string;
  image: any;
  route: Href;

}

export default function GamesHub() {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const setupNavigationBar = async () => {
      try {
        await NavigationBar.setBackgroundColorAsync('#FFFDF9'); 
        await NavigationBar.setButtonStyleAsync('dark');
      } catch (e) {
        console.log('NavigationBar setup failed (iOS is fine)');
      }
    };

    setupNavigationBar();
  }, []);

  const games: Game[] = [
    {
      id: '2048',
      title: '2048',
      image: GAME_IMAGES.puzzle2,
      route: '/games/html5games/2048Game' as Href,
    }
  ];

  const handleGamePress = (route: Href) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Centered WB Games Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WB Games</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>
          Play Games • Score Big • Win Sweet Rewards!
        </Text>

        <View style={styles.centeredContainer}>
          {/* Main Sky Beats Game */}
          <SkyBeatsGameCard 
            onPress={() => router.push('/games/memory')}
            imageError={imageError}
            setImageError={setImageError}
          />
        </View>
        {/* route to game two in gamecards folder
        <View style={styles.centeredContainer}>
          <SkyBeatsGameCard 
            onPress={() => router.push('/games/test') }
            imageError={imageError}
            setImageError={setImageError}
          />
          
        </View> */}


        {/* Other 7 Games - Unified styling */}
        <View style={styles.otherGamesContainer}>
          <Text style={styles.otherGamesTitle}>More Games</Text>
          <Allgames 
            games={games}
            onGamePress={handleGamePress}
          />


        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
  },
  header: {
    height: 90,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#FFF9E6',
    borderBottomWidth: 2,
    borderBottomColor: '#F3EAD3',
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5C3E35',
  },
  content: { 
    flex: 1 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A6E64',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '600',
  },
  centeredContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  otherGamesContainer: {
    marginTop: 30,
  },
  otherGamesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5C3E35',
    marginBottom: 16,
    textAlign: 'center',
  },
});