import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { Ionicons }      from '@expo/vector-icons'
import { supabase }      from '../../lib/supabase'
import SubPantallaLayout from './SubPantallaLayout'

interface Props { cliente: any; onBack: () => void }

const ESTADOS  = ['Todos', 'Completado', 'Fallido', 'Reembolsado']
const MESES    = ['Todos','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function PantallaHistorialPago({ cliente, onBack }: Props) {
  const [pagos,       setPagos]       = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filtroMes,   setFiltroMes]   = useState('Todos')
  const [filtroEst,   setFiltroEst]   = useState('Todos')
  const [showMeses,   setShowMeses]   = useState(false)
  const [showEstados, setShowEstados] = useState(false)

  useEffect(() => {
    if (!cliente?.id) return
    supabase.from('pagos')
      .select('*')
      .eq('cliente_id', cliente.id)
      .order('fecha_pago', { ascending: false })
      .then(({ data }) => { setPagos(data || []); setLoading(false) })
  }, [cliente])

  const filtrados = pagos.filter(p => {
    const fecha = new Date(p.fecha_pago)
    const mesOk = filtroMes === 'Todos' || fecha.toLocaleDateString('es-MX', { month: 'long' }).toLowerCase() === filtroMes.toLowerCase()
    const estOk = filtroEst === 'Todos' || p.estatus === filtroEst
    return mesOk && estOk
  })

  return (
    <SubPantallaLayout titulo="Historial de pago" subtitulo="MI PERFIL" onBack={onBack}>

      {/* Filtros */}
      <View style={s.filtrosRow}>
        {/* Filtro Fecha */}
        <View style={s.filtroWrapper}>
          <TouchableOpacity style={s.filtroBtn} onPress={() => { setShowMeses(!showMeses); setShowEstados(false) }}>
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text style={s.filtroBtnText}>{filtroMes === 'Todos' ? 'Fecha' : filtroMes}</Text>
            <Ionicons name="chevron-down" size={14} color="#6b7280" />
          </TouchableOpacity>
          {showMeses && (
            <View style={s.dropdown}>
              {MESES.map(m => (
                <TouchableOpacity key={m} style={[s.dropdownItem, filtroMes === m && s.dropdownItemActive]}
                  onPress={() => { setFiltroMes(m); setShowMeses(false) }}>
                  <Text style={[s.dropdownText, filtroMes === m && s.dropdownTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Filtro Estado */}
        <View style={s.filtroWrapper}>
          <TouchableOpacity style={s.filtroBtn} onPress={() => { setShowEstados(!showEstados); setShowMeses(false) }}>
            <Text style={s.filtroBtnText}>{filtroEst === 'Todos' ? 'Estado' : filtroEst}</Text>
            <Ionicons name="chevron-down" size={14} color="#6b7280" />
          </TouchableOpacity>
          {showEstados && (
            <View style={s.dropdown}>
              {ESTADOS.map(e => (
                <TouchableOpacity key={e} style={[s.dropdownItem, filtroEst === e && s.dropdownItemActive]}
                  onPress={() => { setFiltroEst(e); setShowEstados(false) }}>
                  <Text style={[s.dropdownText, filtroEst === e && s.dropdownTextActive]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={s.loadingBox}><ActivityIndicator color="#171B24" /></View>
      ) : filtrados.length === 0 ? (
        <View style={s.emptyBox}>
          <Ionicons name="receipt-outline" size={40} color="#e5e7eb" />
          <Text style={s.emptyText}>No hay pagos para este filtro</Text>
        </View>
      ) : (
        <View style={s.lista}>
          {filtrados.map(p => {
            const fecha = new Date(p.fecha_pago)
            const diaLabel = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
            const metodo   = p.metodo_pago === 'Tarjeta' ? 'Visa ***4242' : p.metodo_pago || '—'
            const tipo     = p.concepto?.includes('Renovación') ? 'Renovación' : 'Compra'

            return (
              <View key={p.id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardConcepto}>
                      <Text style={s.cardConceptoNegrita}>{p.concepto || 'Pago'}</Text>
                      {' '}
                      <Text style={s.cardTipo}>- {tipo}</Text>
                    </Text>
                    <Text style={s.cardInfo}>{diaLabel} · {metodo}</Text>
                  </View>
                  <Text style={s.cardMonto}>${p.monto?.toLocaleString('es-MX')}</Text>
                </View>
                <View style={[s.badge,
                  p.estatus === 'Completado' && s.badgePagado,
                  p.estatus === 'Fallido'    && s.badgeFallido,
                  p.estatus === 'Reembolsado'&& s.badgeReembolsado,
                ]}>
                  <Text style={[s.badgeText,
                    p.estatus === 'Completado' && s.badgePagadoText,
                    p.estatus === 'Fallido'    && s.badgeFallidoText,
                    p.estatus === 'Reembolsado'&& s.badgeReembolsadoText,
                  ]}>
                    {p.estatus === 'Completado' ? 'Pagado' : p.estatus}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </SubPantallaLayout>
  )
}

const s = StyleSheet.create({
  filtrosRow:          { flexDirection: 'row', gap: 10, marginBottom: 4 },
  filtroWrapper:       { flex: 1, position: 'relative', zIndex: 10 },
  filtroBtn:           { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#f3f4f6' },
  filtroBtnText:       { fontSize: 13, fontFamily: 'Gotham_400Regular', color: '#374151', flex: 1 },
  dropdown:            { position: 'absolute', top: 44, left: 0, right: 0, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', zIndex: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, maxHeight: 200 },
  dropdownItem:        { paddingVertical: 10, paddingHorizontal: 14 },
  dropdownItemActive:  { backgroundColor: '#f3f4f6' },
  dropdownText:        { fontSize: 13, color: '#374151', fontFamily: 'Gotham_400Regular' },
  dropdownTextActive:  { fontFamily: 'Gotham_700Bold', color: '#111' },
  loadingBox:          { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyBox:            { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText:           { fontSize: 15, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  lista:               { gap: 10 },
  card:                { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  cardTop:             { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  cardConcepto:        { fontSize: 15, marginBottom: 4 },
  cardConceptoNegrita: { fontFamily: 'Gotham_700Bold', color: '#111' },
  cardTipo:            { fontFamily: 'Gotham_400Regular', color: '#9ca3af' },
  cardInfo:            { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  cardMonto:           { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
  badge:               { alignSelf: 'flex-start', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  badgeText:           { fontSize: 12, fontFamily: 'Gotham_700Bold' },
  badgePagado:         { backgroundColor: '#f0fdf4' },
  badgePagadoText:     { color: '#22c55e' },
  badgeFallido:        { backgroundColor: '#fef2f2' },
  badgeFallidoText:    { color: '#ef4444' },
  badgeReembolsado:    { backgroundColor: '#fef9c3' },
  badgeReembolsadoText:{ color: '#ca8a04' },
})