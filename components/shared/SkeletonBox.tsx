import { Animated, StyleSheet } from 'react-native'
import { useEffect, useRef } from 'react'

export default function SkeletonBox({ width, height, borderRadius = 8, style }: {
  width: number | string; height: number; borderRadius?: number; style?: any
}) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <Animated.View style={[{ width, height, borderRadius, backgroundColor: '#e5e7eb', opacity }, style]} />
  )
}