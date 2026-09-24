import { View, Text, StyleSheet } from 'react-native'

interface Props {
  clases:   number
  minutos:  number
  meta:     string
}

export default function HomeEstaSemana({ clases, minutos, meta }: Props) {
  return (
    <View style={s.section}>
      <Text style={s.titulo}>Esta semana</Text>
      <View style={s.card}>
        <View style={s.info}>
          <Text style={s.clases}>{clases}/5 Clases completadas</Text>
          <Text style={s.minutos}>⏱ {minutos}min esta semana</Text>
          <Text style={s.enfoque}>🎯 Enfoque <Text style={{ fontFamily: 'Gotham_700Bold' }}>{meta || 'Fuerza'}</Text></Text>
        </View>
        <View style={s.circulo}>
          <Text style={s.pct}>{Math.round((clases / 5) * 100)}%</Text>
          <Text style={s.label}>Objetivo{'\n'}semanal</Text>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  section:  { marginBottom: 24 },
  titulo:   { fontSize: 17, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 12 },
  card:     { backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  info:     { gap: 6 },
  clases:   { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#111' },
  minutos:  { fontSize: 13, color: '#6b7280', fontFamily: 'Gotham_400Regular' },
  enfoque:  { fontSize: 13, color: '#6b7280', fontFamily: 'Gotham_400Regular' },
  circulo:  { width: 80, height: 80, borderRadius: 40, borderWidth: 6, borderColor: '#22c55e', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  pct:      { fontSize: 18, fontFamily: 'Gotham_700Bold', color: '#111' },
  label:    { fontSize: 9, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center' },
})