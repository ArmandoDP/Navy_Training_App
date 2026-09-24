import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRef } from 'react'
import { useHaptic } from '../../hooks/useHaptic'

interface Props {
  room:             any
  spotsOcupados:    string[]
  spotSeleccionado: string | null
  onSelectSpot:     (id: string) => void
}

const CELL = 42
const GAP  = 5

function SpotCell({ spot, ocupado, seleccionado, onPress }: {
  spot: any; ocupado: boolean; seleccionado: boolean; onPress: () => void
}) {
  const scale = useRef(new Animated.Value(1)).current
  const handleIn  = () => !ocupado && Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 60 }).start()
  const handleOut = () => !ocupado && Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 60 }).start()
  const haptic = useHaptic()

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        disabled={ocupado}
        onPress={() => { haptic.medium(); onPress() }}
        onPressIn={handleIn}
        onPressOut={handleOut}
        activeOpacity={1}
        style={[
          s.celda,
          ocupado      && s.celdaOcupada,
          seleccionado && s.celdaSeleccionada,
          !ocupado && !seleccionado && s.celdaLibre,
        ]}>
        {seleccionado ? (
          <Ionicons name="checkmark" size={16} color="#fff" />
        ) : ocupado ? (
          <View style={s.celdaOcupadaX} />
        ) : (
          <Text style={s.celdaNum}>{spot.numero}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function RoomMapa({ room, spotsOcupados, spotSeleccionado, onSelectSpot }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ alignItems: 'center', paddingHorizontal: 4, paddingBottom: 4 }}>

        {/* Frente */}
        <View style={s.frente}>
          <View style={s.frenteInner}>
            <Ionicons name="tv-outline" size={12} color="#9ca3af" />
            <Text style={s.frenteText}>FRENTE</Text>
          </View>
        </View>

        {/* Grid */}
        <View style={{ marginTop: 12 }}>
          {Array.from({ length: room.alto }, (_, fila) => (
            <View key={fila} style={{ flexDirection: 'row', gap: GAP, marginBottom: GAP }}>
              {Array.from({ length: room.ancho }, (_, col) => {
                const celda = room.layout?.find((c: any) => c.fila === fila && c.columna === col)
                if (!celda) return <View key={col} style={{ width: CELL, height: CELL }} />

                if (celda.tipo === 'Coach') return (
                  <View key={col} style={s.celdaCoach}>
                    <Ionicons name="person" size={14} color="#fff" />
                  </View>
                )

                if (celda.tipo === 'Entrada') return (
                  <View key={col} style={s.celdaEntrada}>
                    <Ionicons name="enter-outline" size={14} color="#6b7280" />
                  </View>
                )

                const spot = room.room_spots?.find((sp: any) => sp.fila === celda.fila && sp.columna === celda.columna)
                if (!spot) return <View key={col} style={{ width: CELL, height: CELL }} />

                const ocupado      = spotsOcupados.includes(spot.id) || spot.bloqueado
                const seleccionado = spotSeleccionado === spot.id

                return (
                  <SpotCell
                    key={col}
                    spot={spot}
                    ocupado={ocupado}
                    seleccionado={seleccionado}
                    onPress={() => onSelectSpot(spot.id)}
                  />
                )
              })}
            </View>
          ))}
        </View>

        {/* Leyenda */}
        <View style={s.leyenda}>
          {[
            { bg: '#171B24', border: '#171B24', icon: 'checkmark', label: 'Seleccionado' },
            { bg: '#f8fafc', border: '#e2e8f0', icon: null,        label: 'Disponible'   },
            { bg: '#f1f5f9', border: '#f1f5f9', icon: null,        label: 'Ocupado'      },
          ].map(l => (
            <View key={l.label} style={s.leyendaItem}>
              <View style={[s.leyendaBox, { backgroundColor: l.bg, borderColor: l.border }]}>
                {l.icon && <Ionicons name={l.icon as any} size={8} color="#fff" />}
              </View>
              <Text style={s.leyendaText}>{l.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  frente:            { alignSelf: 'stretch', backgroundColor: '#0f172a', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, marginBottom: 4 },
  frenteInner:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  frenteText:        { color: '#9ca3af', fontSize: 9, fontFamily: 'Gotham_700Bold', letterSpacing: 2 },
  celda:             { width: CELL, height: CELL, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  celdaLibre:        { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  celdaOcupada:      { backgroundColor: '#f1f5f9', borderColor: '#f1f5f9' },
  celdaSeleccionada: { backgroundColor: '#171B24', borderColor: '#171B24' },
  celdaCoach:        { width: CELL, height: CELL, borderRadius: 10, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#374151' },
  celdaEntrada:      { width: CELL, height: CELL, borderRadius: 10, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#f1f5f9', borderStyle: 'dashed' },
  celdaOcupadaX:     { width: 16, height: 2, backgroundColor: '#d1d5db', borderRadius: 1 },
  celdaNum:          { fontSize: 11, fontFamily: 'Gotham_700Bold', color: '#374151' },
  leyenda:           { flexDirection: 'row', gap: 16, marginTop: 16, justifyContent: 'center' },
  leyendaItem:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaBox:        { width: 18, height: 18, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  leyendaText:       { fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
})