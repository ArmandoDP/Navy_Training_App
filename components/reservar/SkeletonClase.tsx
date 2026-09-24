import { View, Animated, StyleSheet } from 'react-native'
import { useEffect, useRef } from 'react'

function SkeletonBox({ width, height, borderRadius = 8, style }: any) {
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

export default function SkeletonClase() {
  return (
    <View style={s.card}>
      <View style={s.left}>
        <SkeletonBox width={44} height={16} borderRadius={6} />
        <SkeletonBox width={28} height={10} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
      <View style={s.sep} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBox width="80%" height={16} borderRadius={6} />
        <SkeletonBox width="50%" height={12} borderRadius={4} />
        <SkeletonBox width="100%" height={3} borderRadius={2} />
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <SkeletonBox width={32} height={20} borderRadius={4} />
        <SkeletonBox width={14} height={14} borderRadius={7} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12, backgroundColor: '#fff', borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  left: { alignItems: 'center', minWidth: 50, gap: 4 },
  sep:  { width: 1, height: 44, backgroundColor: '#f1f5f9' },
})