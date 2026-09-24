import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  reserva:            any
  onCalificar?:       () => void
}

export default function CardReservaHistorico({ reserva, onCalificar }: Props) {
  const clase      = reserva.clases
  const spotNumero = reserva.room_spots?.numero || '—'
  const asistio    = reserva.asistencias?.length > 0
  const cancelada  = reserva.estatus === 'Cancelada'

  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={asistio && !cancelada ? 0.7 : 1}
      onPress={() => { if (asistio && !cancelada && clase?.coach_id) onCalificar?.() }}>
      <View style={s.cardHeader}>
        <Text style={s.nombre}>{clase?.nombre_clase}</Text>
        <View style={s.spot}>
          <Ionicons name="checkbox-outline" size={13} color="#6b7280" />
          <Text style={s.spotText}>Spot {spotNumero}</Text>
        </View>
      </View>
      <Text style={s.info}>
        {clase?.horario
          ? new Date(clase.horario).toLocaleDateString('es-MX', { weekday: 'short' }).replace('.','') + ' ' +
            new Date(clase.horario).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          : '—'}
        {' · '}
        {clase?.staff ? `${clase.staff.nombre} ${clase.staff.primer_apellido[0]}.` : '—'}
        {' · '}
        {clase?.sucursales?.nombre || '—'}
      </Text>
      {cancelada ? (
        <View style={s.badgeCancelada}>
          <Ionicons name="warning-outline" size={12} color="#ef4444" />
          <Text style={s.badgeCanceladaText}>Cancelada</Text>
        </View>
      ) : asistio ? (
        <View style={s.badgeAsistio}>
          <Ionicons name="checkmark" size={12} color="#22c55e" />
          <Text style={s.badgeAsistioText}>Asistí</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card:                { backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 10 },
  cardHeader:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  nombre:              { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111', flex: 1 },
  spot:                { flexDirection: 'row', alignItems: 'center', gap: 4 },
  spotText:            { fontSize: 12, fontFamily: 'Gotham_700Bold', color: '#6b7280' },
  info:                { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginBottom: 10 },
  badgeCancelada:      { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#fef2f2', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  badgeCanceladaText:  { fontSize: 12, fontFamily: 'Gotham_700Bold', color: '#ef4444' },
  badgeAsistio:        { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#f0fdf4', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  badgeAsistioText:    { fontSize: 12, fontFamily: 'Gotham_700Bold', color: '#22c55e' },
})