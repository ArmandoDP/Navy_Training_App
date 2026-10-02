import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  nombre:     string
  plan:       string
  diasActivo: number
  totalClases:number
  racha:      number
}

export default function ProgresoHeader({ nombre, plan, diasActivo, totalClases, racha }: Props) {
  return (
    <View style={s.container}>
      <View style={s.top}>
        <View>
          <Text style={s.saludo}>Mi progreso</Text>
          <Text style={s.nombre}>{nombre}</Text>
        </View>
        <View style={s.planBadge}>
          <Text style={s.planText}>{plan || 'Sin plan'}</Text>
        </View>
      </View>

      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statNum}>{totalClases}</Text>
          <Text style={s.statLabel}>Clases totales</Text>
        </View>
        <View style={s.divider} />
        <View style={s.stat}>
          <Text style={s.statNum}>{diasActivo}</Text>
          <Text style={s.statLabel}>Días activo</Text>
        </View>
        <View style={s.divider} />
        <View style={s.stat}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={s.statNum}>{racha}</Text>
            <Text style={{ fontSize: 16 }}>🔥</Text>
          </View>
          <Text style={s.statLabel}>Racha semanal</Text>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container:  { backgroundColor: '#171B24', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  top:        { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  saludo:     { color: '#6b7280', fontSize: 12, fontFamily: 'Gotham_400Regular', letterSpacing: 1, textTransform: 'uppercase' },
  nombre:     { color: '#fff', fontSize: 24, fontFamily: 'Gotham_700Bold', marginTop: 2 },
  planBadge:  { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  planText:   { color: '#9ca3af', fontSize: 11, fontFamily: 'Gotham_700Bold', letterSpacing: 0.5 },
  statsRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16 },
  stat:       { flex: 1, alignItems: 'center' },
  statNum:    { color: '#fff', fontSize: 22, fontFamily: 'Gotham_700Bold' },
  statLabel:  { color: '#6b7280', fontSize: 10, fontFamily: 'Gotham_400Regular', marginTop: 2, textAlign: 'center' },
  divider:    { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.08)' },
})