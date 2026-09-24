import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRef } from 'react'

interface Props {
  clase:     any
  reservada: boolean
  onPress:   () => void
}

export default function ClaseRow({ clase, reservada, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current

  const ocupados    = clase.reservas?.filter((r: any) => r.estatus !== 'Cancelada').length || 0
  const disponibles = clase.capacidad_max - ocupados
  const llena       = disponibles <= 0
  const quedan4     = disponibles <= 4 && disponibles > 0
  const pct         = Math.min(100, Math.round((ocupados / clase.capacidad_max) * 100))
  const barColor    = llena ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#22c55e'

  const coachNombre = clase.staff?.nombre || null
  const roomNombre  = clase.rooms?.nombre || null

  const hora = new Date(clase.horario).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City'
  })

  const handlePressIn  = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start()
  const handlePressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 50 }).start()

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[s.card, reservada && s.cardReservada, llena && !reservada && s.cardLlena]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={llena && !reservada}
        activeOpacity={1}>

        {/* Borde accent izquierdo */}
        <View style={[s.accent, { backgroundColor: reservada ? '#22c55e' : llena ? '#ef4444' : '#171B24' }]} />

        {/* Hora */}
        <View style={s.horaCol}>
          <Text style={[s.hora, reservada && s.horaReservada]}>{hora}</Text>
          <Text style={[s.dur, reservada && { color: '#4b5563' }]}>{clase.duracion_minutos}m</Text>
        </View>

        {/* Contenido */}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[s.nombre, reservada && s.nombreReservada]} numberOfLines={1}>
            {clase.nombre_clase}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {coachNombre && (
              <View style={s.coachRow}>
                <View style={[s.coachAvatar, reservada && s.coachAvatarReservada]}>
                  <Text style={[s.coachInitial, reservada && { color: '#60a5fa' }]}>
                    {coachNombre.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[s.coachNombre, reservada && { color: '#6b7280' }]}>{coachNombre}</Text>
              </View>
            )}
            {roomNombre && (
              <Text style={[s.room, reservada && { color: '#374151' }]}>{roomNombre}</Text>
            )}
          </View>

          {!reservada && (
            <View style={s.barBg}>
              <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
            </View>
          )}
        </View>

        {/* Estado derecha */}
        <View style={{ alignItems: 'flex-end', gap: 6, minWidth: 56 }}>
          {reservada ? (
            <View style={s.badgeReservada}>
              <Ionicons name="checkmark" size={10} color="#22c55e" />
              <Text style={s.badgeReservadaText}>LISTA</Text>
            </View>
          ) : llena ? (
            <View style={s.badgeLlena}>
              <Text style={s.badgeLlenaText}>LLENA</Text>
            </View>
          ) : quedan4 ? (
            <View style={s.badgeQuedan}>
              <Text style={s.badgeQdnText}>🔥 {disponibles}</Text>
            </View>
          ) : (
            <View style={s.spotsRow}>
              <Text style={s.spotsNum}>{disponibles}</Text>
              <Text style={s.spotsSep}>/</Text>
              <Text style={s.spotsTotal}>{clase.capacidad_max}</Text>
            </View>
          )}
          {!llena && (
            <Ionicons name="chevron-forward" size={14} color={reservada ? '#374151' : '#d1d5db'} />
          )}
        </View>

      </TouchableOpacity>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  card: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   14,
    paddingHorizontal: 14,
    gap:               12,
    backgroundColor:   '#ffffff',
    borderRadius:      16,
    marginBottom:      8,
    borderWidth:       1,
    borderColor:       '#f1f5f9',
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 1 },
    shadowOpacity:     0.05,
    shadowRadius:      6,
    elevation:         2,
    overflow:          'hidden',
  },
  cardReservada: {
    backgroundColor: '#080f1a',
    borderColor:     '#0f1f35',
  },
  cardLlena: {
    opacity: 0.4,
  },
  accent: {
    position:     'absolute',
    left:         0,
    top:          0,
    bottom:       0,
    width:        3,
    borderRadius: 3,
  },
  horaCol: {
    alignItems: 'center',
    minWidth:   50,
    marginLeft: 8,
  },
  hora: {
    fontSize:   15,
    color:      '#0f172a',
    fontFamily: 'Gotham_700Bold',
  },
  horaReservada: {
    color: '#93c5fd',
  },
  dur: {
    fontSize:   11,
    color:      '#9ca3af',
    fontFamily: 'Gotham_400Regular',
    marginTop:  2,
  },
  nombre: {
    fontSize:      15,
    color:         '#0f172a',
    fontFamily:    'Gotham_700Bold',
    letterSpacing: -0.2,
  },
  nombreReservada: {
    color: '#f1f5f9',
  },
  coachRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
  },
  coachAvatar: {
    width:          18,
    height:         18,
    borderRadius:   9,
    backgroundColor: '#f1f5f9',
    alignItems:     'center',
    justifyContent: 'center',
  },
  coachAvatarReservada: {
    backgroundColor: '#1e3a5f',
  },
  coachInitial: {
    fontSize:   9,
    fontFamily: 'Gotham_700Bold',
    color:      '#6b7280',
  },
  coachNombre: {
    fontSize:   12,
    color:      '#6b7280',
    fontFamily: 'Gotham_400Regular',
  },
  room: {
    fontSize:      10,
    color:         '#9ca3af',
    fontFamily:    'Gotham_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  barBg: {
    height:          3,
    backgroundColor: '#f1f5f9',
    borderRadius:    2,
    overflow:        'hidden',
    marginTop:       2,
  },
  barFill: {
    height:       3,
    borderRadius: 2,
  },
  badgeReservada: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               3,
    backgroundColor:   'rgba(34,197,94,0.1)',
    borderRadius:      20,
    paddingVertical:   3,
    paddingHorizontal: 8,
    borderWidth:       1,
    borderColor:       'rgba(34,197,94,0.2)',
  },
  badgeReservadaText: {
    fontSize:      9,
    fontFamily:    'Gotham_700Bold',
    color:         '#22c55e',
    letterSpacing: 1,
  },
  badgeLlena: {
    backgroundColor:   'rgba(239,68,68,0.08)',
    borderRadius:      20,
    paddingVertical:   3,
    paddingHorizontal: 8,
    borderWidth:       1,
    borderColor:       'rgba(239,68,68,0.2)',
  },
  badgeLlenaText: {
    fontSize:      9,
    fontFamily:    'Gotham_700Bold',
    color:         '#ef4444',
    letterSpacing: 1,
  },
  badgeQuedan: {
    backgroundColor:   'rgba(245,158,11,0.08)',
    borderRadius:      20,
    paddingVertical:   3,
    paddingHorizontal: 8,
    borderWidth:       1,
    borderColor:       'rgba(245,158,11,0.2)',
  },
  badgeQdnText: {
    fontSize:   11,
    fontFamily: 'Gotham_700Bold',
    color:      '#f59e0b',
  },
  spotsRow: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap:           1,
  },
  spotsNum: {
    fontSize:   18,
    color:      '#0f172a',
    fontFamily: 'Gotham_700Bold',
  },
  spotsSep: {
    fontSize:   13,
    color:      '#d1d5db',
    fontFamily: 'Gotham_400Regular',
  },
  spotsTotal: {
    fontSize:   13,
    color:      '#9ca3af',
    fontFamily: 'Gotham_400Regular',
  },
})