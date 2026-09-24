import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { Ionicons }      from '@expo/vector-icons'
import { supabase }      from '../../lib/supabase'
import SubPantallaLayout from './SubPantallaLayout'

const BACKEND_URL = 'https://navy-traning-backend-production.up.railway.app'

interface Props { cliente: any; onBack: () => void }

const BRAND_ICONS: Record<string, string> = {
  visa:       '💳',
  mastercard: '💳',
  amex:       '💳',
}

export default function PantallaMetodosPago({ cliente, onBack }: Props) {
  const [metodos,   setMetodos]   = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [creando,   setCreando]   = useState(false)

  useEffect(() => {
    if (!cliente?.id) return
    fetchMetodos()
  }, [cliente])

  const fetchMetodos = async () => {
    console.log('cliente en metodos pago:', JSON.stringify(cliente))
    setLoading(true)
    try {
      // Primero asegurar que tenga customer_id en OrkestaPay
      await fetch(`${BACKEND_URL}/pagos/crear-customer`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          cliente_id:  cliente.id,
          sucursal_id: cliente.sucursal_id,
        }),
      })

      // Listar tarjetas
      const res  = await fetch(`${BACKEND_URL}/pagos/metodos-pago/${cliente.id}`)
      const data = await res.json()
      setMetodos(data.metodos || [])
    } catch (e) {
      console.log('Error fetching métodos:', e)
    }
    setLoading(false)
  }

  return (
    <SubPantallaLayout titulo="Métodos de pago" subtitulo="MI PERFIL" onBack={onBack}>
      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator color="#171B24" />
        </View>
      ) : (
        <View style={s.container}>

          {/* Tarjetas guardadas */}
          {metodos.length > 0 ? (
            <View style={s.lista}>
              <Text style={s.seccionTitulo}>Tarjetas guardadas</Text>
              {metodos.map((m: any, i: number) => (
                <View key={i} style={s.card}>
                  <View style={s.cardLeft}>
                    <View style={s.cardIcon}>
                      <Text style={{ fontSize: 24 }}>{BRAND_ICONS[m.brand?.toLowerCase()] || '💳'}</Text>
                    </View>
                    <View>
                      <Text style={s.cardBrand}>{m.brand?.toUpperCase() || 'Tarjeta'} •••• {m.last_four}</Text>
                      <Text style={s.cardExpiry}>Vence {m.expiration_month}/{m.expiration_year}</Text>
                    </View>
                  </View>
                  <View style={s.cardBadge}>
                    <Text style={s.cardBadgeText}>Guardada</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={s.emptyBox}>
              <Ionicons name="card-outline" size={40} color="#e5e7eb" />
              <Text style={s.emptyTitle}>Sin tarjetas guardadas</Text>
              <Text style={s.emptySub}>Agrega una tarjeta para pagar más rápido en Navy</Text>
            </View>
          )}

          {/* Info seguridad */}
          <View style={s.infoBox}>
            <View style={s.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#22c55e" />
              <Text style={s.infoText}>Datos encriptados y seguros</Text>
            </View>
            <View style={s.infoRow}>
              <Ionicons name="card-outline" size={16} color="#6366f1" />
              <Text style={s.infoText}>Visa, Mastercard y AMEX</Text>
            </View>
            <View style={s.infoRow}>
              <Ionicons name="lock-closed-outline" size={16} color="#f59e0b" />
              <Text style={s.infoText}>Cumplimiento PCI DSS</Text>
            </View>
          </View>

          <Text style={s.nota}>
            Las tarjetas se guardan automáticamente al realizar tu próxima compra en la app.
          </Text>

        </View>
      )}
    </SubPantallaLayout>
  )
}

const s = StyleSheet.create({
  loadingBox:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  container:      { gap: 20 },
  seccionTitulo:  { fontSize: 12, fontFamily: 'Gotham_700Bold', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  lista:          { gap: 4 },
  card:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft:       { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardIcon:       { width: 48, height: 48, borderRadius: 14, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  cardBrand:      { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 3 },
  cardExpiry:     { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  cardBadge:      { backgroundColor: '#f0fdf4', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  cardBadgeText:  { fontSize: 11, fontFamily: 'Gotham_700Bold', color: '#22c55e' },
  emptyBox:       { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyTitle:     { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
  emptySub:       { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 20 },
  infoBox:        { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f3f4f6', gap: 14 },
  infoRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText:       { fontSize: 14, color: '#374151', fontFamily: 'Gotham_400Regular' },
  nota:           { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 18 },
})