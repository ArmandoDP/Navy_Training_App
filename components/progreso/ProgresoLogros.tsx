import { View, Text, StyleSheet, ScrollView } from 'react-native'

interface Props {
  clases:    number
  diasActivo: number
}

export default function ProgresoLogros({ clases, diasActivo }: Props) {
  const LOGROS = [
    { icon: '🏋️', titulo: 'Primera clase',      sub: 'Completaste tu primera clase',      desbloqueado: clases >= 1    },
    { icon: '🔥', titulo: '5 clases',            sub: 'Completaste 5 clases en Navy',      desbloqueado: clases >= 5    },
    { icon: '⚡', titulo: '10 clases',           sub: 'Completaste 10 clases en Navy',     desbloqueado: clases >= 10   },
    { icon: '💪', titulo: '25 clases',           sub: 'Eres un atleta Navy',               desbloqueado: clases >= 25   },
    { icon: '🏆', titulo: '50 clases',           sub: 'Leyenda de Navy Training Center',   desbloqueado: clases >= 50   },
    { icon: '📅', titulo: '1 semana activo',     sub: 'Llevas 7 días en Navy',             desbloqueado: diasActivo >= 7  },
    { icon: '🗓️', titulo: '1 mes activo',        sub: 'Llevas 30 días en Navy',            desbloqueado: diasActivo >= 30 },
    { icon: '🌟', titulo: '3 meses activo',      sub: 'Llevas 90 días en Navy',            desbloqueado: diasActivo >= 90 },
  ]

  return (
    <View style={s.card}>
      <Text style={s.titulo}>Logros</Text>
      <Text style={s.sub}>Tu historial de achievements en Navy</Text>
      <View style={s.lista}>
        {LOGROS.map((l, i) => (
          <View key={i} style={[s.item, !l.desbloqueado && s.itemLocked]}>
            <Text style={[s.itemIcon, !l.desbloqueado && s.itemIconLocked]}>{l.icon}</Text>
            <View style={s.itemTexto}>
              <Text style={[s.itemTitulo, !l.desbloqueado && s.itemTextoLocked]}>{l.titulo}</Text>
              <Text style={s.itemSub}>{l.sub}</Text>
            </View>
            {l.desbloqueado
              ? <View style={s.check}><Text style={{ color: '#22c55e', fontSize: 14 }}>✓</Text></View>
              : <View style={s.lock}><Text style={{ color: '#d1d5db', fontSize: 12 }}>🔒</Text></View>
            }
          </View>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card:           { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#f3f4f6' },
  titulo:         { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 4 },
  sub:            { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginBottom: 16 },
  lista:          { gap: 8 },
  item:           { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 14 },
  itemLocked:     { backgroundColor: '#f9fafb' },
  itemIcon:       { fontSize: 24, width: 40, textAlign: 'center' },
  itemIconLocked: { opacity: 0.3 },
  itemTexto:      { flex: 1 },
  itemTitulo:     { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#111' },
  itemTextoLocked:{ color: '#9ca3af' },
  itemSub:        { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 2 },
  check:          { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  lock:           { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
})