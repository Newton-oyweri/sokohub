import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,

  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Polyline,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const rawData = [
  { time: '09:30', open: 33575, high: 33600, low: 33500, close: 33550, volume: 12400 },
  { time: '09:45', open: 33550, high: 33680, low: 33520, close: 33620, volume: 18900 },
  { time: '10:00', open: 33620, high: 33630, low: 33480, close: 33510, volume: 9800 },
  { time: '10:15', open: 33510, high: 33590, low: 33400, close: 33580, volume: 15600 },
  { time: '10:30', open: 33580, high: 33700, low: 33550, close: 33690, volume: 23400 },
  { time: '10:45', open: 33690, high: 33800, low: 33650, close: 33750, volume: 31200 },
  { time: '11:00', open: 33750, high: 33820, low: 33710, close: 33780, volume: 28700 },
];

export default function ProFinancialChart() {
  const [mode, setMode] = useState<'candles' | 'line'>('candles');
  const [tooltip, setTooltip] = useState<any>(null);

  const height = 320;
  const volumeHeight = 80;
  const totalHeight = height + volumeHeight + 40; // space for x-axis
  const chartWidth = Math.max(SCREEN_WIDTH * 2.2, rawData.length * 60);

  const paddingLeft = 50;
  const paddingRight = 20;
  const plotWidth = chartWidth - paddingLeft - paddingRight;

  // Price scaling
  const allPrices = rawData.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  const scaleY = (price: number) =>
    paddingLeft + ((maxPrice - price) / priceRange) * height;

  // Volume scaling
  const maxVolume = Math.max(...rawData.map(d => d.volume));
  const scaleVolumeY = (vol: number) =>
    totalHeight - 30 - (vol / maxVolume) * volumeHeight;

  // Simple Moving Average
  const sma = useMemo(() => {
    const period = 3;
    return rawData.map((_, i) => {
      const start = Math.max(0, i - period + 1);
      const slice = rawData.slice(start, i + 1);
      const avg = slice.reduce((sum, d) => sum + d.close, 0) / slice.length;
      return avg;
    });
  }, []);

  const stepX = plotWidth / (rawData.length - 1);

  const linePoints = rawData
    .map((d, i) => `${paddingLeft + i * stepX},${scaleY(d.close)}`)
    .join(' ');

  const smaPoints = rawData
    .map((d, i) => `${paddingLeft + i * stepX},${scaleY(sma[i])}`)
    .join(' ');

  const handleTouch = (e: GestureResponderEvent) => {
    const { locationX } = e.nativeEvent;
    const index = Math.round((locationX - paddingLeft) / stepX);
    const clampedIndex = Math.max(0, Math.min(rawData.length - 1, index));

    if (rawData[clampedIndex]) {
      setTooltip({
        ...rawData[clampedIndex],
        sma: sma[clampedIndex],
        x: paddingLeft + clampedIndex * stepX,
      });
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.symbol}>BTC/USD</Text>
        <Text style={styles.price}>33,750.00</Text>
      </View>

      {/* Mode Switch */}
      <View style={styles.switchRow}>
        <Pressable onPress={() => setMode('candles')}>
          <Text style={[styles.btn, mode === 'candles' && styles.active]}>Candles</Text>
        </Pressable>
        <Pressable onPress={() => setMode('line')}>
          <Text style={[styles.btn, mode === 'line' && styles.active]}>Line</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg
          width={chartWidth}
          height={totalHeight}
          onTouchMove={handleTouch}
          onTouchEnd={() => setTooltip(null)}
        >
          <Defs>
            <LinearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#00e676" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#00e676" stopOpacity="0.1" />
            </LinearGradient>
            <LinearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#ff1744" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#ff1744" stopOpacity="0.1" />
            </LinearGradient>
          </Defs>

          {/* Background Grid */}
          {[0, 1, 2, 3, 4].map((_, i) => {
            const y = paddingLeft + (height / 4) * i;
            return (
              <Line
                key={i}
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#1f1f1f"
                strokeWidth="1"
              />
            );
          })}

          {/* Y-Axis Labels */}
          {[0, 1, 2, 3, 4].map((_, i) => {
            const price = maxPrice - (priceRange / 4) * i;
            return (
              <SvgText
                key={i}
                x={paddingLeft - 10}
                y={paddingLeft + (height / 4) * i + 4}
                fill="#888"
                fontSize="11"
                textAnchor="end"
              >
                {price.toFixed(0)}
              </SvgText>
            );
          })}

          {/* ================= LINE MODE ================= */}
          {mode === 'line' && (
            <>
              <Polyline
                points={linePoints}
                fill="none"
                stroke="#00e676"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Polyline
                points={smaPoints}
                fill="none"
                stroke="#ffeb3b"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
            </>
          )}

          {/* ================= CANDLESTICK MODE ================= */}
          {mode === 'candles' &&
            rawData.map((d, i) => {
              const x = paddingLeft + i * stepX;
              const isBullish = d.close >= d.open;
              const bodyTop = Math.min(scaleY(d.open), scaleY(d.close));
              const bodyHeight = Math.max(
                2,
                Math.abs(scaleY(d.open) - scaleY(d.close))
              );

              return (
                <G key={i}>
                  {/* Wick */}
                  <Line
                    x1={x}
                    y1={scaleY(d.high)}
                    x2={x}
                    y2={scaleY(d.low)}
                    stroke={isBullish ? '#00e676' : '#ff1744'}
                    strokeWidth="2"
                  />

                  {/* Body */}
                  <Rect
                    x={x - 10}
                    y={bodyTop}
                    width={20}
                    height={bodyHeight}
                    fill={isBullish ? "url(#greenGrad)" : "url(#redGrad)"}
                    stroke={isBullish ? '#00e676' : '#ff1744'}
                    strokeWidth="1.5"
                    rx={1}
                  />
                </G>
              );
            })}

          {/* Volume Bars */}
          {rawData.map((d, i) => {
            const x = paddingLeft + i * stepX;
            const isBullish = d.close >= d.open;
            return (
              <Rect
                key={`vol-${i}`}
                x={x - 8}
                y={scaleVolumeY(d.volume)}
                width={16}
                height={totalHeight - 30 - scaleVolumeY(d.volume)}
                fill={isBullish ? '#00e67633' : '#ff174433'}
              />
            );
          })}

          {/* X-Axis Labels */}
          {rawData.map((d, i) => (
            <SvgText
              key={i}
              x={paddingLeft + i * stepX}
              y={totalHeight - 10}
              fill="#666"
              fontSize="10"
              textAnchor="middle"
            >
              {d.time}
            </SvgText>
          ))}

          {/* Crosshair + Tooltip */}
          {tooltip && (
            <>
              <Line
                x1={tooltip.x}
                y1={paddingLeft}
                x2={tooltip.x}
                y2={height + paddingLeft}
                stroke="#ffffff88"
                strokeWidth="1"
                strokeDasharray="4,2"
              />
              <Circle
                cx={tooltip.x}
                cy={scaleY(tooltip.close)}
                r="5"
                fill="#fff"
                stroke="#00e676"
                strokeWidth="2"
              />
            </>
          )}
        </Svg>
      </ScrollView>

      {/* Tooltip */}
      {tooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            {tooltip.time} | O:{tooltip.open} H:{tooltip.high} L:{tooltip.low} C:
            <Text style={{ color: tooltip.close >= tooltip.open ? '#00e676' : '#ff1744' }}>
              {' '}{tooltip.close}
            </Text>
          </Text>
          <Text style={styles.tooltipText}>SMA: {tooltip.sma.toFixed(0)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  symbol: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: '600',
  },
  price: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 12,
  },
  btn: {
    color: '#777',
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  active: {
    color: '#00e676',
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: '#00e676',
  },
  tooltip: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1c1c1e',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  tooltipText: {
    color: '#ddd',
    fontSize: 13,
  },
});