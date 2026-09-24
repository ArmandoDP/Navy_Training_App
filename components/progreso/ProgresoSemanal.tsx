import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  clases:   number
  minutos:  number
  meta:     string
  objetivo: number // clases objetivo semanal
}

export default function ProgresoSemanal({ clases, minutos, meta, objetivo = 5 }: Props) {
  const pct     = Math.min(Math.round((clases / objetivo) * 100), 100)
  const restante = Math.max(objetivo - clases, 0)

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.titulo}>Esta semana</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>Semana actual</Text>
        </View>
      </View>

      <View style={s.metricas}>
        {/* Círculo de progreso */}
        <View style={s.circuloBox}>
          <View style={[s.circulo, { borderColor: pct >= 100 ? '#22c55e' : '#e5e7eb' }]}>
            <Text style={s.circuloPct}>{pct}%</Text>
            <Text style={s.circuloLabel}>objetivo{'\n'}semanal</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.stats}>
          {[
            { icon: 'fitness-outline',    label: 'Clases',    val: `${clases}/${objetivo}`,         color: '#6366f1' },
            { icon: 'time-outline',       label: 'Minutos',   val: `${minutos}min`,                 color: '#f59e0b' },
            { icon: 'trending-up-outline',label: 'Faltan',    val: `${restante} clase${restante !== 1 ? 's' : ''}`, color: '#22c55e' },
            { icon: 'flag-outline',       label: 'Enfoque',   val: meta || 'Fuerza',                color: '#ec4899' },
          ].map((m, i) => (
            <View key={i} style={s.statItem}>
              <View style={[s.statIcon, { backgroundColor: `${m.color}15` }]}>
                <Ionicons name={m.icon as any} size={14} color={m.color} />
              </View>
              <View>
                <Text style={s.statVal}>{m.val}</Text>
                <Text style={s.statLabel}>{m.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card:       { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#f3f4f6' },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  titulo:     { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
  badge:      { backgroundColor: '#f3f4f6', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText:  { fontSize: 11, color: '#6b7280', fontFamily: 'Gotham_700Bold' },
  metricas:   { flexDirection: 'row', alignItems: 'center', gap: 16 },
  circuloBox: { alignItems: 'center', justifyContent: 'center' },
  circulo:    { width: 90, height: 90, borderRadius: 45, borderWidth: 7, alignItems: 'center', justifyContent: 'center' },
  circuloPct: { fontSize: 20, fontFamily: 'Gotham_700Bold', color: '#111' },
  circuloLabel:{ fontSize: 9, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center' },
  stats:      { flex: 1, gap: 10 },
  statItem:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon:   { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statVal:    { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#111' },
  statLabel:  { fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
})