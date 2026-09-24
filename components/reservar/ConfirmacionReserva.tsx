import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRef, useEffect } from 'react'
import ConfettiCannon from 'react-native-confetti-cannon'

interface Props {
  confirmacion: any | null
  onVerQR:      () => void
  onVolver:     () => void
}

export default function ConfirmacionReserva({ confirmacion, onVerQR, onVolver }: Props) {
  const confettiRef = useRef<any>(null)
  const checkScale  = useRef(new Animated.Value(0)).current
  const cardOpacity = useRef(new Animated.Value(0)).current
  const cardSlide   = useRef(new Animated.Value(40)).current
  const btnOpacity  = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!confirmacion) return

    // Secuencia de entrada
    Animated.sequence([
      // 1. Check aparece con bounce
      Animated.spring(checkScale, {
        toValue: 1, tension: 60, friction: 5, useNativeDriver: true
      }),
      // 2. Card sube con fade
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardSlide,   { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      // 3. Botones aparecen
      Animated.timing(btnOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start()
  }, [confirmacion])

  if (!confirmacion) return null

  const hora = confirmacion.clase?.horario
    ? new Date(confirmacion.clase.horario).toLocaleTimeString('es-MX', {
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City'
      })
    : ''

  const fecha = confirmacion.clase?.horario
    ? new Date(confirmacion.clase.horario).toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Mexico_City'
      })
    : ''

  return (
    <Modal visible={!!confirmacion} animationType="fade">
      <View style={s.container}>

        {/* Fondo con círculos decorativos */}
        <View style={s.bgCircle1} />
        <View style={s.bgCircle2} />

        {/* Check animado */}
        <Animated.View style={[s.checkWrap, { transform: [{ scale: checkScale }] }]}>
          <View style={s.checkOuter}>
            <View style={s.checkInner}>
              <Ionicons name="checkmark" size={44} color="#fff" />
            </View>
          </View>
        </Animated.View>

        {/* Título */}
        <Text style={s.titulo}>¡Reserva confirmada!</Text>
        <Text style={s.sub}>Llega 10 min antes y haz check-in con tu QR</Text>

        {/* Card de detalles */}
        <Animated.View style={[s.card, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>

          {/* Nombre clase */}
          <Text style={s.cardClase}>{confirmacion.clase?.nombre_clase}</Text>

          {/* Divider */}
          <View style={s.divider} />

          {/* Info grid */}
          <View style={s.infoGrid}>
            <View style={s.infoItem}>
              <View style={s.infoIcon}>
                <Ionicons name="calendar-outline" size={14} color="#22c55e" />
              </View>
              <View>
                <Text style={s.infoLabel}>FECHA</Text>
                <Text style={s.infoVal}>{fecha}</Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <View style={[s.infoItem, { flex: 1 }]}>
                <View style={s.infoIcon}>
                  <Ionicons name="time-outline" size={14} color="#22c55e" />
                </View>
                <View>
                  <Text style={s.infoLabel}>HORA</Text>
                  <Text style={s.infoVal}>{hora}</Text>
                </View>
              </View>

              <View style={[s.infoItem, { flex: 1 }]}>
                <View style={s.infoIcon}>
                  <Ionicons name="location-outline" size={14} color="#22c55e" />
                </View>
                <View>
                  <Text style={s.infoLabel}>SPOT</Text>
                  <Text style={[s.infoVal, { fontSize: 22 }]}>{confirmacion.spot?.numero || '—'}</Text>
                </View>
              </View>
            </View>

            <View style={s.infoItem}>
              <View style={s.infoIcon}>
                <Ionicons name="business-outline" size={14} color="#22c55e" />
              </View>
              <View>
                <Text style={s.infoLabel}>SUCURSAL</Text>
                <Text style={s.infoVal}>{confirmacion.clase?.sucursales?.nombre || 'Navy Training Center'}</Text>
              </View>
            </View>
          </View>

          {/* ID reserva */}
          <View style={s.idRow}>
            <Text style={s.idText}>#{confirmacion.reserva?.id?.slice(0, 8).toUpperCase()}</Text>
            <View style={s.idBadge}>
              <Ionicons name="shield-checkmark" size={10} color="#22c55e" />
              <Text style={s.idBadgeText}>CONFIRMADA</Text>
            </View>
          </View>
        </Animated.View>

        {/* Botones */}
        <Animated.View style={[s.btns, { opacity: btnOpacity }]}>
          <TouchableOpacity style={s.btnQR} onPress={onVerQR} activeOpacity={0.85}>
            <Ionicons name="qr-code-outline" size={18} color="#171B24" />
            <Text style={s.btnQRText}>Ver mi QR de acceso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnVolver} onPress={onVolver} activeOpacity={0.7}>
            <Text style={s.btnVolverText}>Volver al inicio</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Confetti */}
        <ConfettiCannon
          ref={confettiRef}
          count={180}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
          colors={['#22c55e', '#ffffff', '#86efac', '#4ade80', '#d1fae5', '#bbf7d0']}
          explosionSpeed={400}
          fallSpeed={2800}
        />

      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0a1628', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },

  // Fondo decorativo
  bgCircle1:  { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(34,197,94,0.04)' },
  bgCircle2:  { position: 'absolute', bottom: -80, left: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(34,197,94,0.03)' },

  // Check
  checkWrap:  { marginBottom: 28 },
  checkOuter: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(34,197,94,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)' },
  checkInner: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', shadowColor: '#22c55e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12 },

  // Títulos
  titulo:     { color: '#ffffff', fontSize: 26, fontFamily: 'Gotham_700Bold', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
  sub:        { color: '#6b7280', fontSize: 13, fontFamily: 'Gotham_400Regular', textAlign: 'center', marginBottom: 28, lineHeight: 20 },

  // Card
  card:       { backgroundColor: '#111c2e', borderRadius: 24, padding: 20, width: '100%', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardClase:  { color: '#fff', fontSize: 22, fontFamily: 'Gotham_700Bold', textAlign: 'center', marginBottom: 16, letterSpacing: -0.3 },
  divider:    { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 },

  // Info
  infoGrid:   { gap: 14 },
  infoRow:    { flexDirection: 'row', gap: 12 },
  infoItem:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIcon:   { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(34,197,94,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(34,197,94,0.12)' },
  infoLabel:  { fontSize: 9, color: '#4b5563', fontFamily: 'Gotham_700Bold', letterSpacing: 1.5, marginBottom: 2 },
  infoVal:    { fontSize: 14, color: '#f1f5f9', fontFamily: 'Gotham_700Bold' },

  // ID
  idRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  idText:     { fontSize: 12, color: '#374151', fontFamily: 'Gotham_400Regular', letterSpacing: 1 },
  idBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(34,197,94,0.15)' },
  idBadgeText:{ fontSize: 9, color: '#22c55e', fontFamily: 'Gotham_700Bold', letterSpacing: 1 },

  // Botones
  btns:       { width: '100%', gap: 10 },
  btnQR:      { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: '#fff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  btnQRText:  { color: '#171B24', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  btnVolver:  { paddingVertical: 14, width: '100%', alignItems: 'center' },
  btnVolverText:{ color: '#4b5563', fontSize: 14, fontFamily: 'Gotham_400Regular' },
})