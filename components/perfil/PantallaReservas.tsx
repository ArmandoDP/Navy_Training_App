import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons }      from '@expo/vector-icons'
import { supabase }      from '../../lib/supabase'
import SubPantallaLayout from './SubPantallaLayout'
import ModalDetalleReserva from '../reservar/ModalDetalleReserva'

interface Props { cliente: any; onBack: () => void }

const FILTROS = ['Próximas', 'Pasadas', 'Canceladas']

export default function PantallaReservas({ cliente, onBack }: Props) {
  const [reservas,       setReservas]       = useState<any[]>([])
  const [loading,        setLoading]        = useState(true)
  const [filtro,         setFiltro]         = useState('Próximas')
  const [reservaDetalle, setReservaDetalle] = useState<any>(null)

  useEffect(() => {
    if (!cliente?.id) return
    fetchReservas()
  }, [cliente])

  const fetchReservas = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reservas')
      .select('*, clases(nombre_clase, horario, duracion_minutos, rooms(nombre), staff(nombre, primer_apellido), sucursales(nombre))')
      .eq('cliente_id', cliente.id)
      .order('created_at', { ascending: false })
    setReservas(data || [])
    setLoading(false)
  }

  const ahora = new Date().toISOString()

  const filtradas = reservas.filter(r => {
    const horario = r.clases?.horario
    if (filtro === 'Próximas')  return r.estatus === 'Confirmada' && horario >= ahora
    if (filtro === 'Pasadas')   return r.estatus === 'Confirmada' && horario < ahora
    if (filtro === 'Canceladas') return r.estatus === 'Cancelada'
    return true
  })

  return (
    <SubPantallaLayout titulo="Mis Reservas" subtitulo="MI PERFIL" onBack={onBack}>

      {/* Filtros */}
      <View style={s.filtrosRow}>
        {FILTROS.map(f => (
          <TouchableOpacity key={f}
            style={[s.filtroBtn, filtro === f && s.filtroBtnActive]}
            onPress={() => setFiltro(f)}>
            <Text style={[s.filtroBtnText, filtro === f && s.filtroBtnTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {loading ? (
        <View style={s.loadingBox}><ActivityIndicator color="#171B24" /></View>
      ) : filtradas.length === 0 ? (
        <View style={s.emptyBox}>
          <Ionicons name="calendar-outline" size={40} color="#e5e7eb" />
          <Text style={s.emptyText}>No hay reservas {filtro.toLowerCase()}</Text>
        </View>
      ) : (
        <View style={s.lista}>
          {filtradas.map(r => {
            const horario  = r.clases?.horario ? new Date(r.clases.horario) : null
            const fecha    = horario?.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }) || '—'
            const hora     = horario?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) || '—'
            const cancelada = r.estatus === 'Cancelada'

            return (
              <TouchableOpacity
                key={r.id}
                style={[s.card, cancelada && s.cardCancelada]}
                onPress={() => !cancelada && setReservaDetalle({ ...r, clase_id: r.clase_id || r.clases?.id, clases: r.clases })}
                activeOpacity={cancelada ? 1 : 0.7}>

                <View style={s.cardLeft}>
                  <View style={[s.fechaBox, cancelada && s.fechaBoxCancelada]}>
                    <Text style={[s.fechaDia, cancelada && s.textoCancelado]}>
                      {horario?.getDate()}
                    </Text>
                    <Text style={[s.fechaMes, cancelada && s.textoCancelado]}>
                      {horario?.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={s.cardBody}>
                  <Text style={[s.cardNombre, cancelada && s.textoCancelado]}>
                    {r.clases?.nombre_clase || '—'}
                  </Text>
                  <Text style={s.cardInfo}>
                    {hora} · {r.clases?.sucursales?.nombre || '—'}
                  </Text>
                  <Text style={s.cardCoach}>
                    {r.clases?.staff
                      ? `Coach ${r.clases.staff.nombre} ${r.clases.staff.primer_apellido}`
                      : ''}
                  </Text>
                </View>

                <View style={s.cardRight}>
                  {cancelada ? (
                    <View style={s.badgeCancelada}>
                      <Text style={s.badgeCanceladaText}>Cancelada</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                  )}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      {reservaDetalle && (
        <ModalDetalleReserva
          reserva={reservaDetalle}
          onClose={() => setReservaDetalle(null)}
          onCancelada={() => { setReservaDetalle(null); fetchReservas() }}
        />
      )}
    </SubPantallaLayout>
  )
}

const s = StyleSheet.create({
  filtrosRow:          { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filtroBtn:           { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center' },
  filtroBtnActive:     { backgroundColor: '#171B24', borderColor: '#171B24' },
  filtroBtnText:       { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#9ca3af' },
  filtroBtnTextActive: { color: '#fff' },
  loadingBox:          { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyBox:            { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText:           { fontSize: 15, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  lista:               { gap: 10 },
  card:                { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardCancelada:       { backgroundColor: '#fafafa', borderColor: '#f3f4f6', opacity: 0.7 },
  cardLeft:            { },
  fechaBox:            { width: 44, height: 48, borderRadius: 12, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center' },
  fechaBoxCancelada:   { backgroundColor: '#e5e7eb' },
  fechaDia:            { color: '#fff', fontSize: 18, fontFamily: 'Gotham_700Bold', lineHeight: 22 },
  fechaMes:            { color: '#9ca3af', fontSize: 10, fontFamily: 'Gotham_700Bold' },
  textoCancelado:      { color: '#9ca3af' },
  cardBody:            { flex: 1, gap: 2 },
  cardNombre:          { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111' },
  cardInfo:            { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  cardCoach:           { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  cardRight:           { },
  badgeCancelada:      { backgroundColor: '#fef2f2', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  badgeCanceladaText:  { fontSize: 11, fontFamily: 'Gotham_700Bold', color: '#ef4444' },
})