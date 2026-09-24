import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  reserva:     any
  onCancelar:  () => void
  onVerQR:     () => void
}

export default function CardReservaProxima({ reserva, onCancelar, onVerQR }: Props) {
  const clase      = reserva.clases
  const spotNumero = reserva.room_spots?.numero || '—'

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.nombre}>{clase?.nombre_clase}</Text>
        <View style={s.spot}>
          <Ionicons name="checkbox-outline" size={14} color="#6b7280" />
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
      <View style={s.actions}>
        <TouchableOpacity style={s.btnCancelar} onPress={onCancelar}>
          <Text style={s.btnCancelarText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnQR} onPress={onVerQR}>
          <Ionicons name="qr-code-outline" size={14} color="#fff" />
          <Text style={s.btnQRText}>Ver Qr</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card:           { backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#f3f4f6' },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  nombre:         { fontSize: 17, fontFamily: 'Gotham_700Bold', color: '#111', flex: 1 },
  spot:           { flexDirection: 'row', alignItems: 'center', gap: 4 },
  spotText:       { fontSize: 12, fontFamily: 'Gotham_700Bold', color: '#6b7280' },
  info:           { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginBottom: 16 },
  actions:        { flexDirection: 'row', gap: 10 },
  btnCancelar:    { flex: 1, paddingVertical: 11, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  btnCancelarText:{ fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#6b7280' },
  btnQR:          { flex: 1, paddingVertical: 11, borderRadius: 12, backgroundColor: '#171B24', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  btnQRText:      { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#fff' },
})