import { View, Text, StyleSheet, ScrollView } from 'react-native'

interface Props {
  clases:     number
  diasActivo: number
  racha:      number
}

const LOGROS = [
  { id: 'primera',   icon: '🥇', titulo: 'Primera clase',     desc: 'Completaste tu primera clase', req: (c: number) => c >= 1 },
  { id: 'cinco',     icon: '⚡', titulo: '5 clases',          desc: 'Llevas 5 clases completadas',  req: (c: number) => c >= 5 },
  { id: 'diez',      icon: '🔟', titulo: '10 clases',         desc: '10 clases en tu historial',    req: (c: number) => c >= 10 },
  { id: 'veinticinco',icon: '🎯',titulo: '25 clases',         desc: '25 clases — ¡imparable!',      req: (c: number) => c >= 25 },
  { id: 'cincuenta', icon: '💪', titulo: '50 clases',         desc: '50 clases — eres élite',       req: (c: number) => c >= 50 },
  { id: 'cien',      icon: '🏆', titulo: '100 clases',        desc: 'Centenario — leyenda Navy',    req: (c: number) => c >= 100 },
  { id: 'racha3',    icon: '🔥', titulo: 'Racha de 3 semanas',desc: '3 semanas seguidas entrenando',req: (_: number, r: number) => r >= 3 },
  { id: 'mes',       icon: '📅', titulo: 'Un mes activo',     desc: '30 días siendo parte de Navy', req: (_: number, __: number, d: number) => d >= 30 },
]

export default function ProgresoLogros({ clases, diasActivo, racha }: Props) {
  const desbloqueados = LOGROS.filter(l => l.req(clases, racha, diasActivo))
  const bloqueados    = LOGROS.filter(l => !l.req(clases, racha, diasActivo))

  return (
    <View style={s.container}>
      <Text style={s.title}>Logros</Text>
      <Text style={s.sub}>{desbloqueados.length} de {LOGROS.length} desbloqueados</Text>

      {/* Desbloqueados */}
      {desbloqueados.length > 0 && (
        <View style={s.grid}>
          {desbloqueados.map(l => (
            <View key={l.id} style={s.logroCard}>
              <Text style={s.logroIcon}>{l.icon}</Text>
              <Text style={s.logroTitulo}>{l.titulo}</Text>
              <Text style={s.logroDesc}>{l.desc}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Bloqueados */}
      {bloqueados.length > 0 && (
        <View style={s.grid}>
          {bloqueados.slice(0, 3).map(l => (
            <View key={l.id} style={[s.logroCard, s.logroBloqueado]}>
              <Text style={[s.logroIcon, { opacity: 0.3 }]}>🔒</Text>
              <Text style={[s.logroTitulo, { color: '#d1d5db' }]}>{l.titulo}</Text>
              <Text style={[s.logroDesc, { color: '#e5e7eb' }]}>{l.desc}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container:     { backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  title:         { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#0f172a' },
  sub:           { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: -8 },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  logroCard:     { flex: 1, minWidth: '45%', backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, gap: 4, alignItems: 'center' },
  logroBloqueado:{ backgroundColor: '#f9fafb', opacity: 0.6 },
  logroIcon:     { fontSize: 28 },
  logroTitulo:   { fontSize: 12, fontFamily: 'Gotham_700Bold', color: '#171B24', textAlign: 'center' },
  logroDesc:     { fontSize: 10, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 14 },
})