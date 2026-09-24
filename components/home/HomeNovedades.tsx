import { useState, useEffect }                        from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons }  from '@expo/vector-icons'
import { supabase }  from '../../lib/supabase'

export default function HomeNovedades() {
  const [novedades, setNovedades] = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const hace30dias = new Date()
    hace30dias.setDate(hace30dias.getDate() - 30)

    supabase
      .from('anuncios')
      .select('*')
      .contains('canales', ['novedades'])
      .gte('created_at', hace30dias.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setNovedades(data || [])
        setLoading(false)
      })
  }, [])

  const getIcon = (titulo: string) => {
    const t = titulo.toLowerCase()
    if (t.includes('coach') || t.includes('equipo'))   return 'person-circle-outline'
    if (t.includes('clase') || t.includes('horario'))  return 'calendar-outline'
    if (t.includes('challenge') || t.includes('reto')) return 'trophy-outline'
    if (t.includes('promo') || t.includes('descuento'))return 'pricetag-outline'
    return 'megaphone-outline'
  }

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

  if (loading) return (
    <View style={s.section}>
      <View style={s.header}>
        <Text style={s.titulo}>Novedades</Text>
      </View>
      <ActivityIndicator color="#171B24" />
    </View>
  )

  if (novedades.length === 0) return (
    <View style={s.section}>
      <View style={s.header}>
        <Text style={s.titulo}>Novedades</Text>
      </View>
      <View style={s.empty}>
        <Ionicons name="megaphone-outline" size={32} color="#e5e7eb" />
        <Text style={s.emptyText}>Sin novedades por ahorita,{'\n'}¡vuelve pronto! 💪</Text>
      </View>
    </View>
  )

  return (
    <View style={s.section}>
      <View style={s.header}>
        <Text style={s.titulo}>Novedades</Text>
      </View>
      {novedades.map((n, i) => (
        <TouchableOpacity key={i} style={s.card} activeOpacity={0.8}>
          <View style={s.icon}>
            <Ionicons name={getIcon(n.titulo) as any} size={24} color="#6b7280" />
          </View>
          <View style={s.texto}>
            <View style={s.topRow}>
              <Text style={s.tipo}>{n.scope === 'global' ? 'NAVY' : 'CONDESA'}</Text>
              <Text style={s.fecha}>{formatFecha(n.created_at)}</Text>
            </View>
            <Text style={s.nombre}>{n.titulo}</Text>
            <Text style={s.sub}>{n.cuerpo}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  section: { marginBottom: 24 },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titulo:  { fontSize: 17, fontFamily: 'Gotham_700Bold', color: '#111' },
  card:    { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 10 },
  icon:    { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  texto:   { flex: 1 },
  topRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  tipo:    { fontSize: 11, fontFamily: 'Gotham_700Bold', color: '#6b7280', letterSpacing: 1 },
  fecha:   { fontSize: 11, color: '#d1d5db', fontFamily: 'Gotham_400Regular' },
  nombre:  { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 3 },
  sub: { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  empty:     { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 20 },
})