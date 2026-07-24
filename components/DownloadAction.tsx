import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type OSKind = 'ios' | 'android' | 'other';
type BrowserKind = 'safari' | 'chrome' | 'firefox' | 'samsung' | 'edge' | 'other';

const SLIDES = [
  { icon: 'hand-left-outline', iconSet: 'ion', text: 'Hey there 👋 long day? Let us run the errand' },
  { icon: 'flash-outline', iconSet: 'ion', text: 'Shop faster on the app' },
  { icon: 'truck-fast-outline', iconSet: 'mci', text: 'Track deliveries live' },
  { icon: 'cake-variant', iconSet: 'mci', text: 'Enjoy your favorites, fresh' },
  { icon: 'flash-outline', iconSet: 'ion', text: 'One tap checkout, every time' },
  { icon: 'heart-outline', iconSet: 'ion', text: 'Craving something sweet? We got you' },
] as const;

const SLIDE_DURATION = 3000;

function detectOS(): OSKind {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';

  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes('Mac') && typeof document !== 'undefined' && 'ontouchend' in document);

  if (isIOS) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

// Order matters: several of these UA substrings overlap
// (e.g. Chrome, Edge, and Samsung Internet all contain "Safari",
// and iOS Chrome/Firefox both contain "Safari" too since they're
// WebKit wrappers under the hood).
function detectBrowser(): BrowserKind {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';

  if (/EdgiOS|EdgA|Edg\//.test(ua)) return 'edge';
  if (/SamsungBrowser/.test(ua)) return 'samsung';
  if (/CriOS|Chrome/.test(ua)) return 'chrome';
  if (/FxiOS|Firefox/.test(ua)) return 'firefox';
  if (/Safari/.test(ua)) return 'safari';
  return 'other';
}

function isRunningStandalone() {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as any;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    nav?.standalone === true
  );
}

// Per-browser "add to home screen" copy. iOS Safari and iOS Chrome/Firefox
// (WebKit-based, no beforeinstallprompt) both need manual steps, but the
// menu item and icon are in different places, so the instructions differ.
function getInstallSteps(os: OSKind, browser: BrowserKind) {
  if (os === 'ios') {
    if (browser === 'chrome') {
      return [
        { icon: 'ellipsis-horizontal-outline', text: '1. Tap the "•••" menu in Chrome' },
        { icon: 'add-circle-outline', text: '2. Choose "Add to Home Screen"' },
        { icon: 'checkmark-circle-outline', text: '3. Tap "Add" — you\'re all set!' },
      ];
    }
    if (browser === 'firefox') {
      return [
        { icon: 'ellipsis-horizontal-outline', text: '1. Tap the menu icon in Firefox' },
        { icon: 'add-circle-outline', text: '2. Choose "Share" then "Add to Home Screen"' },
        { icon: 'checkmark-circle-outline', text: '3. Tap "Add" — you\'re all set!' },
      ];
    }
    // Safari (default on iOS)
    return [
      { icon: 'share-outline', text: "1. Tap the Share icon in Safari's toolbar" },
      { icon: 'add-circle-outline', text: '2. Choose "Add to Home Screen"' },
      { icon: 'checkmark-circle-outline', text: '3. Tap "Add" — you\'re all set!' },
    ];
  }

  if (browser === 'samsung') {
    return [
      { icon: 'ellipsis-horizontal-outline', text: '1. Tap the menu icon in Samsung Internet' },
      { icon: 'add-circle-outline', text: '2. Choose "Add page to" then "Home screen"' },
      { icon: 'checkmark-circle-outline', text: '3. Tap "Add" — you\'re all set!' },
    ];
  }

  if (browser === 'firefox') {
    return [
      { icon: 'ellipsis-horizontal-outline', text: '1. Tap the menu icon in Firefox' },
      { icon: 'add-circle-outline', text: '2. Choose "Install"' },
      { icon: 'checkmark-circle-outline', text: '3. Confirm — you\'re all set!' },
    ];
  }

  // Fallback for Android/desktop Chrome/Edge without a captured
  // beforeinstallprompt event, or any other unrecognized browser.
  return [
    { icon: 'ellipsis-horizontal-outline', text: '1. Open your browser menu' },
    { icon: 'add-circle-outline', text: '2. Look for "Install app" or "Add to Home Screen"' },
    { icon: 'checkmark-circle-outline', text: '3. Confirm — you\'re all set!' },
  ];
}

export default function DownloadAction() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [os, setOS] = useState<OSKind>('other');
  const [browser, setBrowser] = useState<BrowserKind>('other');
  const [showInstructions, setShowInstructions] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const deferredPromptRef = useRef<any>(null);

  // Detect platform + browser + whether already installed, once on mount
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    if (isRunningStandalone()) {
      setVisible(false);
      return;
    }

    setOS(detectOS());
    setBrowser(detectBrowser());

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPromptRef.current = e;
    };

    const handleAppInstalled = () => {
      deferredPromptRef.current = null;
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      Animated.timing(translateX, {
        toValue: -24,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % SLIDES.length);
        translateX.setValue(24);
        Animated.timing(translateX, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [visible]);

  // Only ever show this on web — never on native mobile
  if (Platform.OS !== 'web' || !visible) {
    return null;
  }

  const handlePress = async () => {
    // iOS never fires beforeinstallprompt, on any browser — always manual steps
    if (os === 'ios') {
      setShowInstructions((prev) => !prev);
      return;
    }

    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      deferredPromptRef.current = null;
      if (outcome === 'accepted') {
        setVisible(false);
      }
      return;
    }

    // No native install prompt available (Firefox, Samsung Internet,
    // desktop Safari, already dismissed, etc.) — fall back to
    // browser-specific manual instructions instead of native prompt.
    setShowInstructions((prev) => !prev);
  };

  const slide = SLIDES[index];
  const buttonLabel = os === 'ios' ? 'Add to Home Screen' : 'Download Now';
  const steps = getInstructionsCache(os, browser);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.downloadBox} onPress={handlePress} activeOpacity={0.85}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.downloadBoxText}>{buttonLabel}</Text>
        </TouchableOpacity>

        <View style={styles.contentRow}>
          <View style={styles.iconBadge}>
            {slide.iconSet === 'ion' ? (
              <Ionicons name={slide.icon as any} size={14} color="#6b46c1" />
            ) : (
              <MaterialCommunityIcons name={slide.icon as any} size={14} color="#6b46c1" />
            )}
          </View>

          <Animated.View style={{ transform: [{ translateX }] }}>
            <Text style={styles.text} numberOfLines={1}>
              {slide.text}
            </Text>
          </Animated.View>
        </View>

        <TouchableOpacity
          onPress={() => setVisible(false)}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={26} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {showInstructions && (
        <View style={styles.iosCard}>
          {steps.map((step, i) => (
            <View style={styles.iosStepRow} key={i}>
              <Ionicons name={step.icon as any} size={16} color="#6b46c1" />
              <Text style={styles.iosStepText}>{step.text}</Text>
            </View>
          ))}
          <Text style={styles.iosHint}>This gives you a faster, full-screen experience.</Text>
        </View>
      )}
    </View>
  );
}

function getInstructionsCache(os: OSKind, browser: BrowserKind) {
  return getInstallSteps(os, browser);
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },

  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,

    paddingVertical: 10,
    paddingHorizontal: 40,

    backgroundColor: '#faf5ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  downloadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,

    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,

    backgroundColor: '#6b46c1',

    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },

  downloadBoxText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    flex: 1,
  },

  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#fce7f3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '700',
  },

  closeButton: {
    marginLeft: 4,
  },

  iosCard: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },

  iosStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  iosStepText: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '600',
  },

  iosHint: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

