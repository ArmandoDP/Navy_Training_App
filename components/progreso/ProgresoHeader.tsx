import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  nombre:   string
  plan:     string
  diasActivo: number
}

export default function ProgresoHeader({ nombre, plan, diasActivo }: Props) {
  return (
    <View style={s.container}>
      <View style={s.left}>
        <Text style={s.saludo}>Tu progreso</Text>
        <Text style={s.nombre}>{nombre}</Text>
        <View style={s.badge}>
          <Ionicons name="shield-checkmark" size={12} color="#22c55e" />
          <Text style={s.badgeText}>{plan}</Text>
        </View>
      </View>
      <View style={s.diasBox}>
        <Text style={s.diasNum}>{diasActivo}</Text>
        <Text style={s.diasLabel}>días{'\n'}activo</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { backgroundColor: '#171B24', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left:      { gap: 4 },
  saludo:    { color: '#9ca3af', fontSize: 12, fontFamily: 'Gotham_400Regular' },
  nombre:    { color: '#fff', fontSize: 22, fontFamily: 'Gotham_700Bold' },
  badge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start' },
  badgeText: { color: '#22c55e', fontSize: 12, fontFamily: 'Gotham_700Bold' },
  diasBox:   { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16 },
  diasNum:   { color: '#fff', fontSize: 32, fontFamily: 'Gotham_700Bold' },
  diasLabel: { color: '#9ca3af', fontSize: 11, fontFamily: 'Gotham_400Regular', textAlign: 'center' },
})