import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { Ionicons }      from '@expo/vector-icons'
import SubPantallaLayout from '../perfil/SubPantallaLayout'

interface Props {
  paquetes:         any[]
  loading:          boolean
  planSeleccionado: string | null
  onSeleccionar:    (id: string) => void
  onComprar:        (paquete: any) => void
  onBack:           () => void
}

const TABS = [
  { key: 'recurrente', label: '🔄 Recurrente' },
  { key: 'unico',      label: '💳 Pago único'  },
]

export default function PantallaElegirPlan({ paquetes, loading, planSeleccionado, onSeleccionar, onComprar, onBack }: Props) {
  const [tab, setTab] = useState<'recurrente' | 'unico'>('recurrente')

  const filtrados = paquetes.filter(p =>
    tab === 'recurrente' ? p.es_recurrente : !p.es_recurrente
  )

  return (
    <SubPantallaLayout titulo="Plan" onBack={onBack}>

      <Text style={s.titulo}>Elige tu plan</Text>
      <Text style={s.sub}>Empieza con lo que necesitas</Text>

      {/* Tabs */}
      <View style={s.tabsRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key}
            style={[s.tabBtn, tab === t.key && s.tabBtnActive]}
            onPress={() => setTab(t.key as any)}
            activeOpacity={0.8}>
            <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.loadingBox}><ActivityIndicator color="#171B24" /></View>
      ) : filtrados.length === 0 ? (
        <View style={s.emptyBox}>
          <Ionicons name="cube-outline" size={40} color="#e5e7eb" />
          <Text style={s.emptyText}>Sin paquetes disponibles</Text>
        </View>
      ) : (
        <View style={s.lista}>
          {filtrados.map(p => {
            const seleccionado = planSeleccionado === p.id
            return (
              <TouchableOpacity key={p.id}
                style={[s.card, seleccionado && s.cardActive]}
                onPress={() => onSeleccionar(p.id)}
                activeOpacity={0.85}>

                {/* Badge recomendado */}
                {p.nombre.includes('Flex') && (
                  <View style={[s.badge, seleccionado && s.badgeActive]}>
                    <Text style={[s.badgeText, seleccionado && s.badgeTextActive]}>Recomendado</Text>
                  </View>
                )}

                {/* Badge tipo pago */}
                <View style={s.tipoPagoRow}>
                  {p.codigo_interno?.includes('MSI') ? (
                    <View style={[s.tipoBadge, s.tipoBadgeMSI]}>
                      <Text style={[s.tipoBadgeText, s.tipoBadgeTextMSI]}>Meses sin intereses</Text>
                    </View>
                  ) : (
                    <View style={[s.tipoBadge, s.tipoBadgeContado]}>
                      <Text style={[s.tipoBadgeText, s.tipoBadgeTextContado]}>Pago de contado</Text>
                    </View>
                  )}
                </View>

                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <View style={s.cardCheck}>
                      {seleccionado && <Ionicons name="checkmark" size={16} color="#fff" />}
                      <Text style={[s.cardNombre, seleccionado && s.cardNombreActive]}>{p.nombre}</Text>
                    </View>
                    <Text style={[s.cardInfo, seleccionado && s.cardInfoActive]}>
                      {p.clases_incluidas ? `${p.clases_incluidas} clases` : 'Ilimitado'} · {p.vigencia_dias} días
                    </Text>
                    {p.bio && (
                      <View style={s.bioContainer}>
                        {p.bio.split('\n').filter(Boolean).slice(0, 3).map((linea: string, i: number) => (
                          <View key={`${p.id}-bio-${i}`} style={s.bioItem}>
                            <View style={[s.bioDot, seleccionado && s.bioDotActive]} />
                            <Text style={[s.bioText, seleccionado && s.bioTextActive]}>{linea.trim()}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  <Text style={[s.cardPrecio, seleccionado && s.cardPrecioActive]}>
                    ${p.precio.toLocaleString('es-MX')}
                  </Text>
                </View>

                {p.rooms?.length > 0 && (
                  <View style={s.rooms}>
                    {p.rooms.map((r: string, index: number) => (
                      <View key={`${p.id}-${index}`} style={[s.roomBadge, seleccionado && s.roomBadgeActive]}>
                        <Text style={[s.roomText, seleccionado && s.roomTextActive]}>{r}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={[s.btnComprar, seleccionado && s.btnComprarActive]}
                  onPress={() => onComprar(p)}
                  activeOpacity={0.85}>
                  <Text style={[s.btnComprarText, seleccionado && s.btnComprarTextActive]}>
                    Comprar {seleccionado ? '→' : ''}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )
          })}
        </View>
      )}
    </SubPantallaLayout>
  )
}

const s = StyleSheet.create({
  titulo:            { fontSize: 24, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 4, paddingTop: 12 },
  sub:               { fontSize: 14, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginBottom: 16 },
  tabsRow:           { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn:            { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#f3f4f6', alignItems: 'center' },
  tabBtnActive:      { backgroundColor: '#171B24' },
  tabText:           { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#9ca3af' },
  tabTextActive:     { color: '#fff' },
  loadingBox:        { paddingTop: 40, alignItems: 'center' },
  emptyBox:          { alignItems: 'center', paddingTop: 48, gap: 8 },
  emptyText:         { fontSize: 14, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  lista:             { gap: 12 },
  card:              { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f3f4f6', position: 'relative' },
  cardActive:        { backgroundColor: '#171B24', borderColor: '#171B24' },
  badge:             { position: 'absolute', top: 16, right: 16, backgroundColor: '#f3f4f6', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 },
  badgeActive:       { backgroundColor: 'rgba(255,255,255,0.15)' },
  badgeText:         { fontSize: 11, fontFamily: 'Gotham_700Bold', color: '#6b7280' },
  badgeTextActive:   { color: '#fff' },
  cardTop:           { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  cardCheck:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardNombre:        { fontSize: 18, fontFamily: 'Gotham_700Bold', color: '#111' },
  cardNombreActive:  { color: '#fff' },
  cardInfo:          { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  cardInfoActive:    { color: 'rgba(255,255,255,0.6)' },
  cardPrecio:        { fontSize: 20, fontFamily: 'Gotham_700Bold', color: '#111' },
  cardPrecioActive:  { color: '#fff' },
  rooms:             { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  roomBadge:         { backgroundColor: '#f3f4f6', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  roomBadgeActive:   { backgroundColor: 'rgba(255,255,255,0.1)' },
  roomText:          { fontSize: 12, fontFamily: 'Gotham_700Bold', color: '#6b7280' },
  roomTextActive:    { color: '#fff' },
  btnComprar:        { backgroundColor: '#171B24', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnComprarActive:  { backgroundColor: '#fff' },
  btnComprarText:    { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#fff' },
  btnComprarTextActive: { color: '#171B24' },
  bioContainer:      { gap: 4, marginTop: 8, marginBottom: 4 },
  bioItem:           { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  bioDot:            { width: 5, height: 5, borderRadius: 3, backgroundColor: '#9ca3af', marginTop: 5, flexShrink: 0 },
  bioDotActive:      { backgroundColor: 'rgba(255,255,255,0.5)' },
  bioText:           { fontSize: 12, color: '#6b7280', fontFamily: 'Gotham_400Regular', flex: 1, lineHeight: 18 },
  bioTextActive:     { color: 'rgba(255,255,255,0.6)' },
  tipoPagoRow:       { marginBottom: 8 },
  tipoBadge:         { alignSelf: 'flex-start', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 },
  tipoBadgeMSI:      { backgroundColor: 'rgba(99,102,241,0.15)' },
  tipoBadgeContado:  { backgroundColor: 'rgba(34,197,94,0.15)' },
  tipoBadgeText:     { fontSize: 11, fontFamily: 'Gotham_700Bold' },
  tipoBadgeTextMSI:  { color: '#6366f1' },
  tipoBadgeTextContado: { color: '#22c55e' },
})