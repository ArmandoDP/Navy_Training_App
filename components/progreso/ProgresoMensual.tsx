import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  clases:       number
  minutos:      number
  asistenciaPct: number
}

export default function ProgresoMensual({ clases, minutos, asistenciaPct }: Props) {
  const mes = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.titulo}>Este mes</Text>
        <Text style={s.mes}>{mes}</Text>
      </View>

      <View style={s.grid}>
        {[
          { icon: 'barbell-outline',     label: 'Clases totales',   val: clases,          unit: 'clases',  color: '#6366f1' },
          { icon: 'time-outline',        label: 'Tiempo total',     val: minutos,         unit: 'min',     color: '#f59e0b' },
          { icon: 'checkmark-circle-outline', label: 'Asistencia', val: asistenciaPct,   unit: '%',       color: '#22c55e' },
          { icon: 'flame-outline',       label: 'Racha actual',     val: 0,               unit: 'días',    color: '#ef4444' },
        ].map((m, i) => (
          <View key={i} style={s.gridItem}>
            <View style={[s.gridIcon, { backgroundColor: `${m.color}15` }]}>
              <Ionicons name={m.icon as any} size={20} color={m.color} />
            </View>
            <Text style={s.gridVal}>{m.val}<Text style={s.gridUnit}> {m.unit}</Text></Text>
            <Text style={s.gridLabel}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card:      { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#f3f4f6' },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  titulo:    { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
  mes:       { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem:  { width: '47%', backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, gap: 4 },
  gridIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  gridVal:   { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111' },
  gridUnit:  { fontSize: 13, fontFamily: 'Gotham_400Regular', color: '#9ca3af' },
  gridLabel: { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
})