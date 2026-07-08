import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  BackHandler,
  Dimensions,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function BounceGame() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Immersive Fullscreen + Back Handler
  useEffect(() => {
    const setupImmersiveMode = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("overlay-swipe");
      } catch (e) {
        console.log('NavigationBar setup failed');
      }
    };

    setupImmersiveMode();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });

    return () => {
      NavigationBar.setVisibilityAsync("visible");
      backHandler.remove();
    };
  }, [router]);

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
    webViewRef.current?.reload();
  };

  const handleGoBack = () => {
    Alert.alert(
      "Exit Game",
      "Are you sure you want to leave?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Exit", 
          style: "destructive",
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Top Control Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.topButton}
          onPress={handleGoBack}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={28} color="#5C3E35" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Wonderbakes Games</Text>

        <TouchableOpacity 
          style={styles.topButton}
          onPress={handleReload}
          hitSlop={12}
        >
          <Ionicons name="refresh" size={24} color="#5C3E35" />
        </TouchableOpacity>
      </View>

      {/* WebView Container with top padding */}
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://binbashbanana.github.io/gfiles/gfiles/html5/2048/' }}
          style={styles.webview}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo
          startInLoadingState

          // === CACHING ENABLED ===
          cacheEnabled={true}
          incognito={false}
          onShouldStartLoadWithRequest={(request) => true}

          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          onHttpError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          key={`bounce-${retryCount}`}
        />
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#5C3E35" />
          <Text style={styles.loadingText}>Loading Game...</Text>
        </View>
      )}

      {/* Error Overlay */}
      {hasError && !isLoading && (
        <View style={styles.errorOverlay}>
          <Ionicons name="sad-outline" size={60} color="#5C3E35" />
          <Text style={styles.errorTitle}>Failed to Load Game</Text>
          <Text style={styles.errorSubtitle}>Please check your internet connection</Text>
          
          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
  },
  webviewContainer: {
    flex: 1,
    paddingTop: 70, // Height of the top bar
    backgroundColor: '#FFFDF9',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFDF9',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 10,
    backgroundColor: '#FFF9E6',
    borderBottomWidth: 2,
    borderBottomColor: '#F3EAD3',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5C3E35',
    flex: 1,
    textAlign: 'center',
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(243, 234, 211, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgb(255, 253, 249)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: {
    color: '#5C3E35',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 253, 249, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#5C3E35',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#8A6E64',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3EAD3',
  },
  retryButtonText: {
    color: '#5C3E35',
    fontSize: 16,
    fontWeight: '700',
  },
});