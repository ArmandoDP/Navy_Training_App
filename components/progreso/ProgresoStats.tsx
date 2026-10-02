import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  semanal: { clases: number; minutos: number }
  mensual: { clases: number; minutos: number; asistenciaPct: number }
  meta:    string
  objetivo:number
}

export default function ProgresoStats({ semanal, mensual, meta, objetivo }: Props) {
  const progreso = Math.min((semanal.clases / objetivo) * 100, 100)

  return (
    <View style={s.container}>
      {/* Esta semana */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>Esta semana</Text>
          <View style={s.metaBadge}>
            <Ionicons name="flag-outline" size={12} color="#22c55e" />
            <Text style={s.metaText}>Meta: {objetivo} clases</Text>
          </View>
        </View>

        <View style={s.row}>
          <View style={s.metric}>
            <Text style={s.metricNum}>{semanal.clases}</Text>
            <Text style={s.metricLabel}>Clases</Text>
          </View>
          <View style={s.metric}>
            <Text style={s.metricNum}>{semanal.minutos}</Text>
            <Text style={s.metricLabel}>Minutos</Text>
          </View>
          <View style={s.metric}>
            <Text style={s.metricNum}>{Math.round(semanal.minutos * 5.5)}</Text>
            <Text style={s.metricLabel}>Cal aprox</Text>
          </View>
        </View>

        {/* Barra de progreso semanal */}
        <View style={s.progressWrap}>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progreso}%` }]} />
          </View>
          <Text style={s.progressLabel}>{semanal.clases}/{objetivo} clases esta semana</Text>
        </View>
      </View>

      {/* Este mes */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Este mes</Text>
        <View style={s.row}>
          <View style={s.metric}>
            <Text style={s.metricNum}>{mensual.clases}</Text>
            <Text style={s.metricLabel}>Clases</Text>
          </View>
          <View style={s.metric}>
            <Text style={s.metricNum}>{Math.round(mensual.minutos / 60 * 10) / 10}h</Text>
            <Text style={s.metricLabel}>Horas</Text>
          </View>
          <View style={s.metric}>
            <Text style={[s.metricNum, { color: mensual.asistenciaPct >= 70 ? '#22c55e' : '#f59e0b' }]}>
              {mensual.asistenciaPct}%
            </Text>
            <Text style={s.metricLabel}>Asistencia</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container:     { gap: 12 },
  card:          { backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle:     { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#0f172a' },
  metaBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0fdf4', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  metaText:      { fontSize: 11, color: '#22c55e', fontFamily: 'Gotham_700Bold' },
  row:           { flexDirection: 'row', justifyContent: 'space-around' },
  metric:        { alignItems: 'center', gap: 4 },
  metricNum:     { fontSize: 28, fontFamily: 'Gotham_700Bold', color: '#171B24' },
  metricLabel:   { fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  progressWrap:  { gap: 6 },
  progressBar:   { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: '#22c55e', borderRadius: 4 },
  progressLabel: { fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center' },
})