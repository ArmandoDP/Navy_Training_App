'use client'
import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, Modal, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import RoomMapa from './RoomMapa'
import ModalQR  from './ModalQR'

interface Props {
  reserva:  any | null  // la reserva de proximasClases
  onClose:  () => void
  onCancelada: () => void
}

export default function ModalDetalleReserva({ reserva, onClose, onCancelada }: Props) {
  const [claseCompleta,  setClaseCompleta]  = useState<any>(null)
  const [loading,        setLoading]        = useState(false)
  const [modalCancelar,  setModalCancelar]  = useState(false)
  const [cancelando,     setCancelando]     = useState(false)
  const [cancelada,      setCancelada]      = useState(false)
  const [modalQR,        setModalQR]        = useState(false)
  const [confirmacionQR, setConfirmacionQR] = useState<any>(null)

  useEffect(() => {
    if (!reserva) return
    fetchClaseCompleta()
  }, [reserva?.id])

  const fetchClaseCompleta = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('clases')
      .select('*, staff(id, nombre, primer_apellido), sucursales(nombre, color), rooms(id, nombre, ancho, alto, layout, room_spots(*)), reservas(id, estatus, spot_id, cliente_id)')
      .eq('id', reserva.clase_id)
      .single()
    setClaseCompleta(data)
    setLoading(false)
  }

  if (!reserva) return null

  const clase      = claseCompleta
  const spotId     = reserva.spot_id
  const spotNumero = clase?.rooms?.room_spots?.find((s: any) => s.id === spotId)?.numero
  const spotsOcupados = clase?.reservas?.filter((r: any) => r.estatus !== 'Cancelada' && r.spot_id).map((r: any) => r.spot_id) || []

  const handleCancelar = async () => {
    setCancelando(true)
    await supabase.from('reservas').update({ estatus: 'Cancelada' }).eq('id', reserva.id)
    setCancelando(false)
    setModalCancelar(false)
    setCancelada(true)
  }

  const handleVerQR = () => {
    setConfirmacionQR({
      reserva: { ...reserva, id: reserva.id },
      clase:   clase,
      spot:    clase?.rooms?.room_spots?.find((s: any) => s.id === spotId),
    })
    setModalQR(true)
  }

  const handleCerrarCancelada = () => {
    setCancelada(false)
    onCancelada()
    onClose()
  }

  return (
    <>
      <Modal visible={!!reserva} animationType="slide" presentationStyle="pageSheet">
        <View style={s.container}>

          {/* Modal cancelar */}
          <Modal visible={modalCancelar} animationType="slide" presentationStyle="pageSheet" transparent>
            <View style={s.cancelOverlay}>
              <View style={s.cancelSheet}>
                <Text style={s.cancelTitulo}>Cancelar reserva</Text>
                <Text style={s.cancelSubtitulo}>Regla de cancelación</Text>
                <Text style={s.cancelTexto}>
                  Puedes cancelar tu reserva en cualquier momento. Te recomendamos hacerlo con anticipación para liberar el espacio a otros miembros.
                </Text>
                <TouchableOpacity style={s.cancelBtn} onPress={handleCancelar} disabled={cancelando}>
                  <Text style={s.cancelBtnText}>{cancelando ? 'Cancelando...' : 'Cancelar clase'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.cancelVolverBtn} onPress={() => setModalCancelar(false)}>
                  <Ionicons name="chevron-back" size={16} color="#6b7280" />
                  <Text style={s.cancelVolverText}>Volver a la clase</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Pantalla cancelación exitosa */}
          <Modal visible={cancelada} animationType="fade">
            <View style={s.exitoContainer}>
              <View style={s.exitoCheck}>
                <Ionicons name="close" size={36} color="#fff" />
              </View>
              <Text style={s.exitoTitulo}>Reserva cancelada</Text>
              <Text style={s.exitoSub}>
                Tu clase <Text style={{ fontFamily: 'Gotham_700Bold' }}>{clase?.nombre_clase}</Text> se canceló con éxito.
              </Text>
              <TouchableOpacity style={s.exitoBtnPrimario} onPress={handleCerrarCancelada}>
                <Text style={s.exitoBtnPrimarioText}>Reservar otra clase</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.exitoBtnSecundario} onPress={handleCerrarCancelada}>
                <Text style={s.exitoBtnSecundarioText}>Volver al inicio</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* Header */}
          <View style={s.headerTop}>
            <TouchableOpacity onPress={onClose} style={s.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.headerTitulo}>Mi reserva</Text>
              <Text style={s.headerSub}>
                {reserva.clases?.horario
                  ? `${new Date(reserva.clases.horario).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })} · ${new Date(reserva.clases.horario).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
                  : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Nombre clase */}
          <View style={s.claseNombreBox}>
            <View style={s.reservadaBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
              <Text style={s.reservadaBadgeText}>Reservada · Spot {spotNumero}</Text>
            </View>
            <Text style={s.claseNombre}>{reserva.clases?.nombre_clase}</Text>
          </View>

          {loading ? (
            <View style={s.loadingBox}>
              <ActivityIndicator color="#171B24" />
            </View>
          ) : (
            <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

              {/* Pills info */}
              <View style={s.pills}>
                <View style={s.pill}>
                  <Ionicons name="time-outline" size={13} color="#6b7280"/>
                  <Text style={s.pillText}>{clase?.duracion_minutos} MIN</Text>
                </View>
                <View style={s.pill}>
                  <Ionicons name="location-outline" size={13} color="#6b7280"/>
                  <Text style={s.pillText}>{reserva.clases?.sucursales?.nombre}</Text>
                </View>
                <View style={s.pill}>
                  <Ionicons name="grid-outline" size={13} color="#6b7280"/>
                  <Text style={s.pillText}>{reserva.clases?.rooms?.nombre}</Text>
                </View>
              </View>

              {/* Coach */}
              {clase?.staff && (
                <View style={[s.card, s.cardRow]}>
                  <View style={s.coachLeft}>
                    <View style={s.coachAvatar}>
                      <Ionicons name="person" size={20} color="#6b7280" />
                    </View>
                    <View>
                      <Text style={s.coachNombre}>{clase.staff.nombre} {clase.staff.primer_apellido}</Text>
                      <View style={s.coachSubRow}>
                        <View style={s.coachDot} />
                        <Text style={s.coachTipo}>Coach · {reserva.clases?.rooms?.nombre}</Text>
                      </View>
                    </View>
                  </View>
                  {clase.staff.rating && (
                    <Text style={s.coachRating}>{clase.staff.rating} ★</Text>
                  )}
                </View>
              )}

              {/* QR Card */}
              <TouchableOpacity style={s.qrCard} onPress={handleVerQR} activeOpacity={0.85}>
                <View style={s.qrCardLeft}>
                  <View style={s.qrIconBox}>
                    <Ionicons name="qr-code-outline" size={28} color="#fff" />
                  </View>
                  <View>
                    <Text style={s.qrCardTitulo}>Tu QR de acceso</Text>
                    <Text style={s.qrCardSub}>Muéstralo en recepción para hacer check-in</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>

              {/* Room mapa */}
              {clase?.rooms && (
                <View style={s.card}>
                  <Text style={s.cardTitulo}>Tu spot en el room</Text>
                  <RoomMapa
                    room={clase.rooms}
                    spotsOcupados={spotsOcupados}
                    spotSeleccionado={spotId}
                    onSelectSpot={() => {}}
                  />
                  <View style={s.mapaLeyenda}>
                    <View style={s.leyendaItem}>
                      <View style={[s.leyendaDot, { backgroundColor: '#22c55e' }]} />
                      <Text style={s.leyendaText}>Tu spot</Text>
                    </View>
                    <View style={s.leyendaItem}>
                      <View style={[s.leyendaDot, { backgroundColor: '#e5e7eb' }]} />
                      <Text style={s.leyendaText}>Ocupado</Text>
                    </View>
                    <View style={s.leyendaItem}>
                      <View style={[s.leyendaDot, { backgroundColor: '#f9fafb' }]} />
                      <Text style={s.leyendaText}>Disponible</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={{ height: 120 }} />
            </ScrollView>
          )}

          {/* Footer */}
          <View style={s.footer}>
            <TouchableOpacity style={s.footerBtnCancelar} onPress={() => setModalCancelar(true)}>
              <Text style={s.footerBtnCancelarText}>Cancelar reserva</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.footerBtn} onPress={handleVerQR}>
              <Ionicons name="qr-code-outline" size={14} color="#fff" />
              <Text style={s.footerBtnText}> Ver QR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ModalQR
        visible={modalQR}
        confirmacion={confirmacionQR}
        onClose={() => { setModalQR(false); setConfirmacionQR(null) }}
      />
    </>
  )
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f9fafb' },
  headerTop:        { backgroundColor: '#171B24', flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, gap: 12 },
  backBtn:          { padding: 4 },
  headerTitulo:     { color: '#fff', fontSize: 18, fontFamily: 'Gotham_700Bold' },
  headerSub:        { color: '#9ca3af', fontSize: 12, fontFamily: 'Gotham_400Regular', marginTop: 2 },
  claseNombreBox:   { backgroundColor: '#1f2937', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 28, alignItems: 'center', justifyContent: 'center', minHeight: 110 },
  reservadaBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 12 },
  reservadaBadgeText:{ color: '#22c55e', fontSize: 12, fontFamily: 'Gotham_700Bold' },
  claseNombre:      { color: '#fff', fontSize: 28, fontFamily: 'Gotham_700Bold', textAlign: 'center' },
  loadingBox:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:           { flex: 1 },
  pills:            { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 16, flexWrap: 'wrap' },
  pill:             { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  pillText:         { fontSize: 11, fontFamily: 'Gotham_700Bold', color: '#6b7280' },
  card:             { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f3f4f6' },
  cardRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitulo:       { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 12 },
  coachLeft:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  coachAvatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  coachNombre:      { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111' },
  coachSubRow:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  coachDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  coachTipo:        { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  coachRating:      { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#111' },
  qrCard:           { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qrCardLeft:       { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  qrIconBox:        { width: 48, height: 48, borderRadius: 14, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center' },
  qrCardTitulo:     { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 3 },
  qrCardSub:        { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', flex: 1 },
  mapaLeyenda:      { flexDirection: 'row', gap: 16, marginTop: 16, justifyContent: 'center' },
  leyendaItem:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaDot:       { width: 10, height: 10, borderRadius: 5 },
  leyendaText:      { fontSize: 12, color: '#6b7280', fontFamily: 'Gotham_400Regular' },
  footer:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#f3f4f6', backgroundColor: '#fff', gap: 8 },
  footerBtn:        { backgroundColor: '#171B24', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  footerBtnText:    { color: '#fff', fontSize: 14, fontFamily: 'Gotham_700Bold' },
  footerBtnCancelar:{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16 },
  footerBtnCancelarText: { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#6b7280' },
  cancelOverlay:    { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  cancelSheet:      { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 48 },
  cancelTitulo:     { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 16 },
  cancelSubtitulo:  { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#9ca3af', marginBottom: 8 },
  cancelTexto:      { fontSize: 14, color: '#6b7280', fontFamily: 'Gotham_400Regular', lineHeight: 22, marginBottom: 28 },
  cancelBtn:        { backgroundColor: '#171B24', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16 },
  cancelBtnText:    { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  cancelVolverBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  cancelVolverText: { fontSize: 14, color: '#6b7280', fontFamily: 'Gotham_400Regular' },
  exitoContainer:   { flex: 1, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  exitoCheck:       { width: 72, height: 72, borderRadius: 36, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  exitoTitulo:      { color: '#fff', fontSize: 28, fontFamily: 'Gotham_700Bold', textAlign: 'center', marginBottom: 12 },
  exitoSub:         { color: '#9ca3af', fontSize: 15, fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  exitoBtnPrimario: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  exitoBtnPrimarioText: { color: '#111', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  exitoBtnSecundario:   { paddingVertical: 14, width: '100%', alignItems: 'center' },
  exitoBtnSecundarioText: { color: '#9ca3af', fontSize: 15, fontFamily: 'Gotham_400Regular' },
})