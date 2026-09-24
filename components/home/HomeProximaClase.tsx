import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import QRCode from 'react-native-qrcode-svg'
import { useState, useRef } from 'react'
import ModalDetalleReserva from '../reservar/ModalDetalleReserva'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width - 32 - 32  // paddingHorizontal del body

interface Props {
  proximasClases: any[]
  onVerAgenda:    () => void
  onVerClase:     () => void
}

export default function HomeProximaClase({ proximasClases, onVerAgenda, onVerClase }: Props) {
  const [modalQR,       setModalQR]       = useState(false)
  const [claseModal,    setClaseModal]    = useState<any>(null)
  const [indiceActivo, setIndiceActivo] = useState(0)
  const [reservaDetalle, setReservaDetalle] = useState<any>(null)
  const scrollRef = useRef<ScrollView>(null)
  

  const getCountdown = (horario: string) => {
    const diff = new Date(horario).getTime() - Date.now()
    if (diff <= 0) return 'Ahora'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return h > 0 ? `En ${h}h ${m}m` : `En ${m}m`
  }

  const abrirQR = (clase: any) => {
    setClaseModal(clase)
    setModalQR(true)
  }

  const handleScroll = (e: any) => {
    const offset = e.nativeEvent.contentOffset.x
    const indice = Math.round(offset / CARD_WIDTH)
    setIndiceActivo(indice)
  }

  return (
    <>
      {/* Modal QR */}
      <Modal visible={modalQR} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setModalQR(false)} style={s.modalBack}>
              <Text style={s.modalBackText}>← Check-in</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalQR(false)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={s.modalContent}>
            <Text style={s.modalFecha}>
              {claseModal?.clases?.horario
                ? new Date(claseModal.clases.horario).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
                : ''}
            </Text>
            <View style={s.qrContainer}>
              <QRCode value={claseModal?.id || 'navy'} size={200} />
            </View>
            <Text style={s.modalClaseNombre}>{claseModal?.clases?.nombre_clase}</Text>
            <Text style={s.modalCoach}>
              Coach {claseModal?.clases?.staff
                ? `${claseModal.clases.staff.nombre} ${claseModal.clases.staff.primer_apellido}`
                : '—'}
            </Text>
            <Text style={s.modalInfo}>
              {claseModal?.clases?.horario
                ? new Date(claseModal.clases.horario).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                : ''} · {claseModal?.clases?.rooms?.nombre || '—'} · {claseModal?.clases?.sucursales?.nombre || '—'}
            </Text>
            <View style={s.modalHint}>
              <Text style={s.modalHintText}>ⓘ Acerca el código al lector en recepción</Text>
            </View>
            <TouchableOpacity style={s.modalBtnVolver} onPress={() => setModalQR(false)}>
              <Text style={s.modalBtnVolverText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Próximas clases</Text>
          {proximasClases.length > 0 && (
            <Text style={s.sectionCount}>{proximasClases.length} reservadas</Text>
          )}
        </View>

        {proximasClases.length === 0 ? (
          <View style={s.sinClase}>
            <Text style={s.sinClaseText}>Aún no tienes clases reservadas</Text>
            <TouchableOpacity style={s.sinClaseBtn} onPress={onVerAgenda}>
              <Ionicons name="calendar-outline" size={16} color="#111" />
              <Text style={s.sinClaseBtnText}>Ver agenda</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              snapToInterval={CARD_WIDTH + 12}
              decelerationRate="fast"
              contentContainerStyle={{ gap: 12 }}>
              {proximasClases.map((reserva, i) => (
                <View key={reserva.id} style={[s.claseCard, { width: CARD_WIDTH }]}>
                  <View style={s.cardTop}>
                    <View style={s.countdown}>
                      <Text style={s.countdownText}>🟢 {getCountdown(reserva.clases?.horario)}</Text>
                    </View>
                    {proximasClases.length > 1 && (
                      <Text style={s.cardIndice}>{i + 1}/{proximasClases.length}</Text>
                    )}
                  </View>

                  <Text style={s.claseNombre}>{reserva.clases?.nombre_clase}</Text>
                  <Text style={s.claseInfo}>
                    {reserva.clases?.horario
                      ? new Date(reserva.clases.horario).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })
                      : ''}
                    {'\n'}
                    {reserva.clases?.horario
                      ? new Date(reserva.clases.horario).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                      : ''} · 📍 {reserva.clases?.sucursales?.nombre} · 👤 {reserva.clases?.staff?.nombre}
                  </Text>

                  <View style={s.actions}>
                    <TouchableOpacity style={s.btnCheckin} onPress={() => abrirQR(reserva)}>
                      <Text style={s.btnCheckinText}>⊞ Check-in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.btnVerClase} onPress={() => setReservaDetalle(reserva)}>
                      <Text style={s.btnVerClaseText}>Ver clase</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Dots indicadores */}
            {proximasClases.length > 1 && (
              <View style={s.dots}>
                {proximasClases.map((_, i) => (
                  <View key={i} style={[s.dot, i === indiceActivo && s.dotActivo]} />
                ))}
              </View>
            )}
          </>
        )}
      </View>

      <ModalDetalleReserva
        reserva={reservaDetalle}
        onClose={() => setReservaDetalle(null)}
        onCancelada={() => { setReservaDetalle(null); /* refetch si es necesario */ }}
      />
    </>
  )
}

const s = StyleSheet.create({
  section:          { marginBottom: 24 },
  sectionHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:     { fontSize: 17, fontFamily: 'Gotham_700Bold', color: '#111' },
  sectionCount:     { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  sinClase:         { backgroundColor: '#171B24', borderRadius: 20, padding: 28, minHeight: 140 },
  sinClaseText:     { color: '#fff', fontSize: 24, fontFamily: 'Gotham_700Bold', lineHeight: 32, marginBottom: 20 },
  sinClaseBtn:      { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end' },
  sinClaseBtnText:  { color: '#111', fontSize: 14, fontFamily: 'Gotham_700Bold' },
  claseCard:        { backgroundColor: '#171B24', borderRadius: 16, padding: 20 },
  cardTop:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  countdown:        { backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12, alignSelf: 'flex-start' },
  countdownText:    { color: '#22c55e', fontSize: 12, fontFamily: 'Gotham_700Bold' },
  cardIndice:       { color: '#6b7280', fontSize: 12, fontFamily: 'Gotham_400Regular' },
  claseNombre:      { color: '#fff', fontSize: 22, fontFamily: 'Gotham_700Bold', marginBottom: 6 },
  claseInfo:        { color: '#9ca3af', fontSize: 12, fontFamily: 'Gotham_400Regular', marginBottom: 16, lineHeight: 18 },
  actions:          { flexDirection: 'row', gap: 10 },
  btnCheckin:       { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#374151', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  btnCheckinText:   { color: '#fff', fontSize: 13, fontFamily: 'Gotham_700Bold' },
  btnVerClase:      { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  btnVerClaseText:  { color: '#111', fontSize: 13, fontFamily: 'Gotham_700Bold' },
  dots:             { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot:              { width: 6, height: 6, borderRadius: 3, backgroundColor: '#e5e7eb' },
  dotActivo:        { backgroundColor: '#171B24', width: 18 },
  modalContainer:   { flex: 1, backgroundColor: '#171B24' },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  modalBack:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalBackText:    { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  modalClose:       { color: '#fff', fontSize: 20 },
  modalContent:     { flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 20 },
  modalFecha:       { color: '#9ca3af', fontSize: 12, fontFamily: 'Gotham_700Bold', letterSpacing: 2, marginBottom: 32 },
  qrContainer:      { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 32 },
  modalClaseNombre: { color: '#fff', fontSize: 22, fontFamily: 'Gotham_700Bold', textAlign: 'center', marginBottom: 8 },
  modalCoach:       { color: '#9ca3af', fontSize: 14, fontFamily: 'Gotham_400Regular', marginBottom: 6 },
  modalInfo:        { color: '#9ca3af', fontSize: 13, fontFamily: 'Gotham_400Regular', marginBottom: 32 },
  modalHint:        { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 16, width: '100%' },
  modalHintText:    { color: '#9ca3af', fontSize: 13, fontFamily: 'Gotham_400Regular', textAlign: 'center' },
  modalBtnVolver:   { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center' },
  modalBtnVolverText: { color: '#111', fontSize: 16, fontFamily: 'Gotham_700Bold' },
})