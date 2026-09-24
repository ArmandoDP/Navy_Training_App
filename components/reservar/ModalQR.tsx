import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import QRCode  from 'react-native-qrcode-svg'
import { supabase } from '../../lib/supabase'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  visible:      boolean
  confirmacion: any | null
  onClose:      () => void
}

export default function ModalQR({ visible, confirmacion, onClose }: Props) {
  const [checkinDetectado, setCheckinDetectado] = useState(false)
  const scaleAnim  = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible || !confirmacion?.reserva?.id) return

    setCheckinDetectado(false)

    // Escuchar cambios en asistencias
    const channel = supabase.channel(`checkin-${confirmacion.reserva.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'asistencias',
        filter: `clase_id=eq.${confirmacion.clase?.id}`,
      }, (payload) => {
        if (payload.new.cliente_id === confirmacion.reserva.cliente_id) {
          setCheckinDetectado(true)
          // Animación de entrada
          Animated.parallel([
            Animated.spring(scaleAnim,   { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]).start()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [visible, confirmacion?.reserva?.id])

  const handleCerrarCheckin = () => {
    setCheckinDetectado(false)
    scaleAnim.setValue(0)
    opacityAnim.setValue(0)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={s.back}>← Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={s.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.fecha}>
          {confirmacion?.clase?.horario
            ? new Date(confirmacion.clase.horario).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
            : ''}
        </Text>

        <View style={s.qrBox}>
          {confirmacion?.reserva?.id && (
            <QRCode value={confirmacion.reserva.id} size={200} />
          )}
        </View>

        <Text style={s.clase}>{confirmacion?.clase?.nombre_clase}</Text>
        <Text style={s.coach}>
          Coach {confirmacion?.clase?.staff?.nombre} {confirmacion?.clase?.staff?.primer_apellido}
        </Text>
        <Text style={s.info}>
          {confirmacion?.clase?.horario
            ? new Date(confirmacion.clase.horario).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
            : ''} · Spot {confirmacion?.spot?.numero} · {confirmacion?.clase?.sucursales?.nombre}
        </Text>

        <View style={s.hint}>
          <Text style={s.hintText}>ⓘ Acerca el código al lector en recepción</Text>
        </View>

        <TouchableOpacity style={s.btnVolver} onPress={onClose}>
          <Text style={s.btnVolverText}>Volver al inicio</Text>
        </TouchableOpacity>

        {/* Overlay de Check-in exitoso */}
        {checkinDetectado && (
          <Animated.View style={[s.overlay, { opacity: opacityAnim }]}>
            <Animated.View style={[s.checkinCard, { transform: [{ scale: scaleAnim }] }]}>

              {/* Icono animado */}
              <View style={s.checkIconBox}>
                <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
              </View>

              <Text style={s.checkinTitulo}>¡Check-in confirmado!</Text>
              <Text style={s.checkinNombre}>
                Bienvenido, {confirmacion?.reserva?.clientes?.nombre_completo?.split(' ')[0] || 'Navy Member'} 💪
              </Text>

              {/* Detalle clase */}
              <View style={s.detalleBox}>
                <View style={s.detalleRow}>
                  <Ionicons name="fitness-outline" size={14} color="#6b7280" />
                  <Text style={s.detalleText}>{confirmacion?.clase?.nombre_clase}</Text>
                </View>
                <View style={s.detalleRow}>
                  <Ionicons name="time-outline" size={14} color="#6b7280" />
                  <Text style={s.detalleText}>
                    {confirmacion?.clase?.horario
                      ? new Date(confirmacion.clase.horario).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </Text>
                </View>
                <View style={s.detalleRow}>
                  <Ionicons name="location-outline" size={14} color="#6b7280" />
                  <Text style={s.detalleText}>{confirmacion?.clase?.sucursales?.nombre}</Text>
                </View>
                <View style={s.detalleRow}>
                  <Ionicons name="grid-outline" size={14} color="#6b7280" />
                  <Text style={s.detalleText}>Spot {confirmacion?.spot?.numero} · {confirmacion?.clase?.rooms?.nombre}</Text>
                </View>
              </View>

              {/* Mensaje motivacional */}
              <View style={s.motivoBox}>
                <Text style={s.motivoText}>
                  🔥 ¡Que tengas una excelente sesión! Recuerda dar el 100%.
                </Text>
              </View>

              {/* Botones */}
              <TouchableOpacity style={s.btnCheckin} onPress={handleCerrarCheckin} activeOpacity={0.85}>
                <Text style={s.btnCheckinText}>Ir al inicio →</Text>
              </TouchableOpacity>

            </Animated.View>
          </Animated.View>
        )}
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#171B24', paddingHorizontal: 32, alignItems: 'center' },
  header:         { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingTop: 60, paddingBottom: 24 },
  back:           { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  close:          { color: '#fff', fontSize: 20 },
  fecha:          { color: '#9ca3af', fontSize: 12, fontFamily: 'Gotham_700Bold', letterSpacing: 2, marginBottom: 32 },
  qrBox:          { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24 },
  clase:          { color: '#fff', fontSize: 22, fontFamily: 'Gotham_700Bold', textAlign: 'center', marginBottom: 8 },
  coach:          { color: '#9ca3af', fontSize: 14, fontFamily: 'Gotham_400Regular', marginBottom: 6 },
  info:           { color: '#9ca3af', fontSize: 13, fontFamily: 'Gotham_400Regular', marginBottom: 32 },
  hint:           { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, width: '100%', marginBottom: 16 },
  hintText:       { color: '#9ca3af', fontSize: 13, textAlign: 'center', fontFamily: 'Gotham_400Regular' },
  btnVolver:      { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center' },
  btnVolverText:  { color: '#111', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  overlay:        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  checkinCard:    { backgroundColor: '#fff', borderRadius: 28, padding: 28, width: '100%', alignItems: 'center', gap: 12 },
  checkIconBox:   { marginBottom: 4 },
  checkinTitulo:  { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  checkinNombre:  { fontSize: 16, color: '#6b7280', fontFamily: 'Gotham_400Regular', textAlign: 'center' },
  detalleBox:     { backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, width: '100%', gap: 8 },
  detalleRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detalleText:    { fontSize: 13, color: '#374151', fontFamily: 'Gotham_400Regular', flex: 1 },
  motivoBox:      { backgroundColor: '#fef3c7', borderRadius: 12, padding: 12, width: '100%' },
  motivoText:     { fontSize: 13, color: '#92400e', fontFamily: 'Gotham_700Bold', textAlign: 'center' },
  btnCheckin:     { backgroundColor: '#171B24', borderRadius: 14, paddingVertical: 16, width: '100%', alignItems: 'center', marginTop: 4 },
  btnCheckinText: { color: '#fff', fontSize: 15, fontFamily: 'Gotham_700Bold' },
})