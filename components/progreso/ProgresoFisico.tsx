import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Registro {
  id:         string
  fecha:      string
  peso_kg:    number | null
  grasa_pct:  number | null
  musculo_pct:number | null
  calorias:   number | null
  notas:      string | null
}

interface Props {
  registros:   Registro[]
  onRegistrar: () => void
}

export default function ProgresoFisico({ registros, onRegistrar }: Props) {
  const ultimo = registros[0]
  const anterior = registros[1]

  const diff = (actual: number | null, prev: number | null) => {
    if (!actual || !prev) return null
    const d = actual - prev
    return { val: Math.abs(d).toFixed(1), positivo: d > 0 }
  }

  const pesoDiff    = diff(ultimo?.peso_kg, anterior?.peso_kg)
  const grasaDiff   = diff(ultimo?.grasa_pct, anterior?.grasa_pct)
  const musculoDiff = diff(ultimo?.musculo_pct, anterior?.musculo_pct)

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Composición corporal</Text>
        <TouchableOpacity style={s.btnRegistrar} onPress={onRegistrar} activeOpacity={0.85}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={s.btnRegistrarText}>Registrar</Text>
        </TouchableOpacity>
      </View>

      {!ultimo ? (
        <View style={s.empty}>
          <Ionicons name="body-outline" size={40} color="#e5e7eb" />
          <Text style={s.emptyTitle}>Sin registros aún</Text>
          <Text style={s.emptySub}>Registra tu peso y medidas para ver tu evolución</Text>
          <TouchableOpacity style={s.btnEmpty} onPress={onRegistrar} activeOpacity={0.85}>
            <Text style={s.btnEmptyText}>Hacer mi primer registro</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={s.fechaUltimo}>
            Último registro: {new Date(ultimo.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>

          <View style={s.metricsGrid}>
            {ultimo.peso_kg && (
              <View style={s.metricCard}>
                <Ionicons name="scale-outline" size={20} color="#6366f1" />
                <Text style={s.metricVal}>{ultimo.peso_kg}<Text style={s.metricUnit}> kg</Text></Text>
                <Text style={s.metricLabel}>Peso</Text>
                {pesoDiff && (
                  <View style={[s.diffBadge, { backgroundColor: pesoDiff.positivo ? '#fef2f2' : '#f0fdf4' }]}>
                    <Ionicons name={pesoDiff.positivo ? 'trending-up' : 'trending-down'} size={10} color={pesoDiff.positivo ? '#ef4444' : '#22c55e'} />
                    <Text style={[s.diffText, { color: pesoDiff.positivo ? '#ef4444' : '#22c55e' }]}>{pesoDiff.val} kg</Text>
                  </View>
                )}
              </View>
            )}

            {ultimo.grasa_pct && (
              <View style={s.metricCard}>
                <Ionicons name="water-outline" size={20} color="#f59e0b" />
                <Text style={s.metricVal}>{ultimo.grasa_pct}<Text style={s.metricUnit}>%</Text></Text>
                <Text style={s.metricLabel}>Grasa</Text>
                {grasaDiff && (
                  <View style={[s.diffBadge, { backgroundColor: grasaDiff.positivo ? '#fef2f2' : '#f0fdf4' }]}>
                    <Ionicons name={grasaDiff.positivo ? 'trending-up' : 'trending-down'} size={10} color={grasaDiff.positivo ? '#ef4444' : '#22c55e'} />
                    <Text style={[s.diffText, { color: grasaDiff.positivo ? '#ef4444' : '#22c55e' }]}>{grasaDiff.val}%</Text>
                  </View>
                )}
              </View>
            )}

            {ultimo.musculo_pct && (
              <View style={s.metricCard}>
                <Ionicons name="fitness-outline" size={20} color="#22c55e" />
                <Text style={s.metricVal}>{ultimo.musculo_pct}<Text style={s.metricUnit}>%</Text></Text>
                <Text style={s.metricLabel}>Músculo</Text>
                {musculoDiff && (
                  <View style={[s.diffBadge, { backgroundColor: musculoDiff.positivo ? '#f0fdf4' : '#fef2f2' }]}>
                    <Ionicons name={musculoDiff.positivo ? 'trending-up' : 'trending-down'} size={10} color={musculoDiff.positivo ? '#22c55e' : '#ef4444'} />
                    <Text style={[s.diffText, { color: musculoDiff.positivo ? '#22c55e' : '#ef4444' }]}>{musculoDiff.val}%</Text>
                  </View>
                )}
              </View>
            )}

            {ultimo.calorias && (
              <View style={s.metricCard}>
                <Ionicons name="flame-outline" size={20} color="#ef4444" />
                <Text style={s.metricVal}>{ultimo.calorias}<Text style={s.metricUnit}> kcal</Text></Text>
                <Text style={s.metricLabel}>Calorías</Text>
              </View>
            )}
          </View>

          {/* Historial */}
          {registros.length > 1 && (
            <View style={s.historial}>
              <Text style={s.historialTitle}>Historial de peso</Text>
              {registros.slice(0, 5).map((r, i) => (
                <View key={r.id} style={[s.historialRow, i < registros.length - 1 && s.historialBorder]}>
                  <Text style={s.historialFecha}>
                    {new Date(r.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                  </Text>
                  <Text style={s.historialPeso}>{r.peso_kg ? `${r.peso_kg} kg` : '—'}</Text>
                  {r.grasa_pct && <Text style={s.historialExtra}>{r.grasa_pct}% grasa</Text>}
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container:      { backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:          { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#0f172a' },
  btnRegistrar:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#171B24', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 },
  btnRegistrarText:{ fontSize: 12, fontFamily: 'Gotham_700Bold', color: '#fff' },
  empty:          { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyTitle:     { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#374151' },
  emptySub:       { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 20 },
  btnEmpty:       { backgroundColor: '#171B24', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  btnEmptyText:   { color: '#fff', fontSize: 14, fontFamily: 'Gotham_700Bold' },
  fechaUltimo:    { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  metricsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard:     { flex: 1, minWidth: '45%', backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, gap: 4, alignItems: 'center' },
  metricVal:      { fontSize: 24, fontFamily: 'Gotham_700Bold', color: '#171B24' },
  metricUnit:     { fontSize: 13, fontFamily: 'Gotham_400Regular', color: '#9ca3af' },
  metricLabel:    { fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  diffBadge:      { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 10, paddingVertical: 3, paddingHorizontal: 6 },
  diffText:       { fontSize: 10, fontFamily: 'Gotham_700Bold' },
  historial:      { gap: 4 },
  historialTitle: { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#374151', marginBottom: 4 },
  historialRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  historialBorder:{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  historialFecha: { flex: 1, fontSize: 13, color: '#6b7280', fontFamily: 'Gotham_400Regular' },
  historialPeso:  { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#171B24' },
  historialExtra: { fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginLeft: 8 },
})