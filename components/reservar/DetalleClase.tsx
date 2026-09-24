import { useState } from 'react'
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import RoomMapa from './RoomMapa'
import { useHaptic } from '../../hooks/useHaptic'

interface Props {
  clase:         any | null
  spotSel:       string | null
  reservando:    boolean
  reservaActiva: any | null
  onClose:       () => void
  onSelectSpot:  (id: string) => void
  onReservar:    () => void
  onCancelada:   () => void
}

export default function DetalleClase({ clase, spotSel, reservando, reservaActiva, onClose, onSelectSpot, onReservar, onCancelada }: Props) {
  const [modalCancelar, setModalCancelar] = useState(false)
  const [cancelando,    setCancelando]    = useState(false)
  const [cancelada,     setCancelada]     = useState(false)
  const haptic = useHaptic()

  if (!clase) return null

  const spotsOcupados = clase.reservas?.filter((r: any) => r.estatus !== 'Cancelada' && r.spot_id).map((r: any) => r.spot_id) || []
  const ocupados      = clase.reservas?.filter((r: any) => r.estatus !== 'Cancelada').length || 0
  const disponibles   = clase.capacidad_max - ocupados
  const pct           = Math.min(100, Math.round((ocupados / clase.capacidad_max) * 100))
  const spotNumero    = reservaActiva
    ? clase.rooms?.room_spots?.find((s: any) => s.id === reservaActiva.spot_id)?.numero
    : clase.rooms?.room_spots?.find((s: any) => s.id === spotSel)?.numero

  const hora  = new Date(clase.horario).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' })
  const fecha = new Date(clase.horario).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Mexico_City' })
  const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e'
  const coachInicial = clase.staff?.nombre?.charAt(0).toUpperCase() || '?'

  const handleCancelar = async () => {
    if (!reservaActiva) return
    setCancelando(true)
    await supabase.from('reservas').update({ estatus: 'Cancelada' }).eq('id', reservaActiva.id)
    setCancelando(false)
    setModalCancelar(false)
    setCancelada(true)
  }

  const handleCerrarCancelada = () => {
    setCancelada(false)
    onCancelada()
    onClose()
  }

  return (
    <Modal visible={!!clase} animationType="slide" presentationStyle="pageSheet">
      <View style={s.container}>

        {/* Modal cancelar */}
        <Modal visible={modalCancelar} animationType="slide" presentationStyle="pageSheet" transparent>
          <View style={s.overlay}>
            <View style={s.sheet}>
              <View style={s.sheetHandle} />
              <View style={s.sheetIconWrap}>
                <Ionicons name="warning-outline" size={30} color="#f59e0b" />
              </View>
              <Text style={s.sheetTitulo}>¿Cancelar reserva?</Text>
              <Text style={s.sheetDesc}>
                Al cancelar liberas tu lugar para otros miembros. Si cancelas con menos de 4 horas podría aplicar penalización.
              </Text>
              <TouchableOpacity style={s.sheetBtnRed} onPress={() => { haptic.error(); handleCancelar() }} disabled={cancelando} activeOpacity={0.85}>
                <Text style={s.sheetBtnRedText}>{cancelando ? 'Cancelando...' : 'Sí, cancelar clase'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.sheetBtnGhost} onPress={() => { haptic.light(); setModalCancelar(false) }}>
                <Text style={s.sheetBtnGhostText}>Mantener mi reserva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Cancelación exitosa */}
        <Modal visible={cancelada} animationType="fade">
          <View style={s.exitoContainer}>
            <View style={s.exitoCircle}>
              <Ionicons name="close" size={44} color="#fff" />
            </View>
            <Text style={s.exitoTitulo}>Reserva cancelada</Text>
            <Text style={s.exitoSub}>
              Tu lugar en{' '}
              <Text style={{ color: '#fff', fontFamily: 'Gotham_700Bold' }}>{clase.nombre_clase}</Text>
              {' '}fue liberado.
            </Text>
            <TouchableOpacity style={s.exitoBtnPrimario} onPress={handleCerrarCancelada} activeOpacity={0.85}>
              <Text style={s.exitoBtnPrimarioText}>Reservar otra clase →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.exitoBtnSecundario} onPress={handleCerrarCancelada}>
              <Text style={s.exitoBtnSecundarioText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.headerBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Detalle de clase</Text>
          <TouchableOpacity onPress={onClose} style={s.headerBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroNombre}>{clase.nombre_clase}</Text>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <Ionicons name="time-outline" size={13} color="#6b7280" />
              <Text style={s.metaText}>{hora}</Text>
            </View>
            <View style={s.metaDot} />
            <View style={s.metaItem}>
              <Ionicons name="calendar-outline" size={13} color="#6b7280" />
              <Text style={s.metaText}>{fecha}</Text>
            </View>
            <View style={s.metaDot} />
            <View style={s.metaItem}>
              <Ionicons name="timer-outline" size={13} color="#6b7280" />
              <Text style={s.metaText}>{clase.duracion_minutos} min</Text>
            </View>
          </View>
          <View style={s.dispRow}>
            <View style={s.dispBarBg}>
              <View style={[s.dispBarFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
            </View>
            <Text style={[s.dispNum, { color: barColor }]}>
              {disponibles === 0 ? 'Llena' : `${disponibles} lugares`}
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

          {/* Coach */}
          {clase.staff && (
            <View style={s.card}>
              <View style={s.coachRow}>
                <View style={s.coachAvatar}>
                  <Text style={s.coachInitial}>{coachInicial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.coachNombre}>{clase.staff.nombre} {clase.staff.primer_apellido}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <View style={s.coachOnline} />
                    <Text style={s.coachTipo}>Coach · {clase.rooms?.nombre || clase.sucursales?.nombre}</Text>
                  </View>
                </View>
                <View style={s.coachBadge}>
                  <Ionicons name="star" size={11} color="#f59e0b" />
                  <Text style={s.coachBadgeText}>Coach</Text>
                </View>
              </View>
            </View>
          )}

          {/* Descripción */}
          {clase.descripcion && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons name="information-circle-outline" size={16} color="#9ca3af" />
                <Text style={s.cardTitulo}>Sobre la clase</Text>
              </View>
              <Text style={s.cardDesc}>{clase.descripcion}</Text>
            </View>
          )}

          {/* Métricas */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="people-outline" size={16} color="#9ca3af" />
              <Text style={s.cardTitulo}>Disponibilidad</Text>
            </View>
            <View style={s.metricsRow}>
              {[
                { label: 'Ocupados',    val: spotsOcupados.length, color: '#ef4444' },
                { label: 'Disponibles', val: disponibles,          color: '#22c55e' },
                { label: 'Total',       val: clase.capacidad_max,  color: '#6b7280' },
              ].map((m, i) => (
                <View key={m.label} style={[s.metric, i > 0 && s.metricBorder]}>
                  <Text style={[s.metricVal, { color: m.color }]}>{m.val}</Text>
                  <Text style={s.metricLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Room mapa */}
          {clase.rooms && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons name="grid-outline" size={16} color="#9ca3af" />
                <Text style={s.cardTitulo}>
                  {reservaActiva ? 'Tu spot reservado' : 'Elige tu spot'}
                </Text>
              </View>
              {!reservaActiva && (
                <Text style={s.cardHint}>Toca un spot disponible para seleccionarlo</Text>
              )}
              <RoomMapa
                room={clase.rooms}
                spotsOcupados={spotsOcupados}
                spotSeleccionado={reservaActiva?.spot_id || spotSel}
                onSelectSpot={reservaActiva ? () => {} : (id) => { haptic.medium(); onSelectSpot(id) }}
              />
            </View>
          )}

          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Footer */}
        {reservaActiva ? (
          <View style={s.footer}>
            <View style={s.footerLeft}>
              <View style={s.footerReservadaBadge}>
                <Ionicons name="checkmark-circle" size={15} color="#22c55e" />
                <Text style={s.footerReservadaText}>Spot {spotNumero} · Reservado</Text>
              </View>
              <Text style={s.footerHint}>{clase.rooms?.nombre || 'Clase confirmada'}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={s.footerBtnOutline} onPress={() => { haptic.warning(); setModalCancelar(true) }} activeOpacity={0.8}>
                <Text style={s.footerBtnOutlineText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.footerBtnDark} onPress={() => {}} activeOpacity={0.85}>
                <Ionicons name="qr-code-outline" size={16} color="#fff" />
                <Text style={s.footerBtnDarkText}>QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={s.footer}>
            <View style={s.footerLeft}>
              <Text style={s.footerLabel}>Tu spot</Text>
              <Text style={s.footerSpotSel}>
                {spotSel ? `✓ Spot ${spotNumero} seleccionado` : 'Selecciona en el mapa ↑'}
              </Text>
            </View>
            <TouchableOpacity
              style={[s.footerBtnDark, (!spotSel || reservando) && s.footerBtnDisabled]}
              disabled={!spotSel || reservando}
              onPress={() => { haptic.heavy(); onReservar() }}
              activeOpacity={0.85}>
              <Text style={s.footerBtnDarkText}>
                {reservando ? 'Reservando...' : 'Reservar →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f8fafc' },
  header:     { backgroundColor: '#171B24', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16 },
  headerBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ color: '#4b5563', fontSize: 13, fontFamily: 'Gotham_400Regular', letterSpacing: 0.5 },
  hero:       { backgroundColor: '#171B24', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  heroNombre: { color: '#ffffff', fontSize: 34, fontFamily: 'Gotham_700Bold', letterSpacing: -0.8, lineHeight: 40, marginBottom: 12 },
  metaRow:    { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  metaItem:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:   { color: '#9ca3af', fontSize: 12, fontFamily: 'Gotham_400Regular' },
  metaDot:    { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#171B24' },
  dispRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dispBarBg:  { flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' },
  dispBarFill:{ height: 5, borderRadius: 3 },
  dispNum:    { fontSize: 13, fontFamily: 'Gotham_700Bold', minWidth: 70, textAlign: 'right' },
  card:       { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitulo: { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#374151', textTransform: 'uppercase', letterSpacing: 1 },
  cardDesc:   { fontSize: 14, color: '#6b7280', fontFamily: 'Gotham_400Regular', lineHeight: 22 },
  cardHint:   { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginBottom: 16, marginTop: -8 },
  coachRow:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  coachAvatar:{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#171B24' },
  coachInitial:{ fontSize: 24, fontFamily: 'Gotham_700Bold', color: '#fff' },
  coachNombre:{ fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#171B24' },
  coachOnline:{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#22c55e' },
  coachTipo:  { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  coachBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)' },
  coachBadgeText:{ fontSize: 10, fontFamily: 'Gotham_700Bold', color: '#f59e0b' },
  metricsRow: { flexDirection: 'row' },
  metric:     { flex: 1, alignItems: 'center', paddingVertical: 8 },
  metricBorder:{ borderLeftWidth: 1, borderLeftColor: '#f1f5f9' },
  metricVal:  { fontSize: 30, fontFamily: 'Gotham_700Bold' },
  metricLabel:{ fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  footer:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#fff', gap: 12 },
  footerLeft: { flex: 1 },
  footerLabel:{ fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  footerSpotSel:{ fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#171B24' },
  footerHint: { fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 3 },
  footerReservadaBadge:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  footerReservadaText: { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#22c55e' },
  footerBtnDark:{ backgroundColor: '#171B24', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerBtnDarkText:{ color: '#fff', fontSize: 14, fontFamily: 'Gotham_700Bold' },
  footerBtnDisabled:{ backgroundColor: '#e5e7eb' },
  footerBtnOutline:{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16 },
  footerBtnOutlineText:{ fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#9ca3af' },
  overlay:    { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet:      { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 52, alignItems: 'center' },
  sheetHandle:{ width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, marginBottom: 28 },
  sheetIconWrap:{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(245,158,11,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 18, borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.15)' },
  sheetTitulo:{ fontSize: 24, fontFamily: 'Gotham_700Bold', color: '#171B24', textAlign: 'center', marginBottom: 10 },
  sheetDesc:  { fontSize: 14, color: '#6b7280', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  sheetBtnRed:{ backgroundColor: '#ef4444', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  sheetBtnRedText:{ color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  sheetBtnGhost:{ paddingVertical: 14, width: '100%', alignItems: 'center' },
  sheetBtnGhostText:{ fontSize: 15, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  exitoContainer:{ flex: 1, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  exitoCircle:{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  exitoTitulo:{ color: '#fff', fontSize: 32, fontFamily: 'Gotham_700Bold', textAlign: 'center', marginBottom: 14, letterSpacing: -0.5 },
  exitoSub:   { color: '#4b5563', fontSize: 15, fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  exitoBtnPrimario:{ backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, width: '100%', alignItems: 'center', marginBottom: 12 },
  exitoBtnPrimarioText:{ color: '#171B24', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  exitoBtnSecundario:{ paddingVertical: 14, width: '100%', alignItems: 'center' },
  exitoBtnSecundarioText:{ color: '#374151', fontSize: 15, fontFamily: 'Gotham_400Regular' },
})