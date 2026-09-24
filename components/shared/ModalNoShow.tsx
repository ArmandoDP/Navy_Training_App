import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { WebView } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'

// const BACKEND_URL = 'https://navy-traning-backend-production.up.railway.app'
const BACKEND_URL = 'https://navy-traning-backend-production.up.railway.app'

interface Props {
  penalizacion: any
  clienteId:    string
  onPagado:     () => void
}

export default function ModalNoShow({ penalizacion, clienteId, onPagado }: Props) {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [checkoutId,  setCheckoutId]  = useState<string | null>(null)
  const [orderId,     setOrderId]     = useState<string | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [procesando,  setProcesando]  = useState(false)

  const handlePagar = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/pagos/pagar-penalizacion`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          cliente_id:      clienteId,
          penalizacion_id: penalizacion.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
      setCheckoutUrl(data.checkout_url)
      setCheckoutId(data.checkout_id)
      setOrderId(data.order_id)
    } catch (err: any) {
      Alert.alert('Error', err.message)
    }
    setLoading(false)
  }

  if (checkoutUrl) return (
    <View style={{ flex: 1 }}>
      <View style={s.webviewHeader}>
        <Text style={s.webviewTitulo}>Pago seguro</Text>
      </View>
      <WebView
        source={{ uri: checkoutUrl }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onShouldStartLoadWithRequest={(request) => {
          const url = request.url
          if (url.includes('pago/completado')) {
            setCheckoutUrl(null)
            setProcesando(true)
            fetch(`${BACKEND_URL}/pagos/confirmar-penalizacion`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                penalizacion_id: penalizacion.id,
                checkout_id:     checkoutId,
                order_id:        orderId,
              }),
            }).then(() => { setProcesando(false); onPagado() })
              .catch(() => { setProcesando(false); onPagado() })
            return false
          }
          if (url.includes('pago/cancelado')) {
            setCheckoutUrl(null)
            return false
          }
          return true
        }}
      />
    </View>
  )

  if (procesando) return (
    <View style={s.procesando}>
      <ActivityIndicator color="#fff" size="large" />
      <Text style={s.procesandoText}>Procesando tu pago...</Text>
    </View>
  )

  return (
    <View style={s.container}>
      <View style={s.card}>
        <View style={s.iconBox}>
          <Ionicons name="warning" size={32} color="#ef4444" />
        </View>
        <Text style={s.titulo}>No Show pendiente</Text>
        <Text style={s.sub}>
          No te presentaste a una clase reservada. Para continuar usando la app debes liquidar el cargo correspondiente.
        </Text>
        {/* Detalle de la clase */}
        {penalizacion.clases && (
        <View style={s.detalleBox}>
            <Text style={s.detalleTitulo}>Clase no asistida</Text>
            <View style={s.detalleRow}>
            <Ionicons name="fitness-outline" size={14} color="#6b7280" />
            <Text style={s.detalleText}>{penalizacion.clases.nombre_clase}</Text>
            </View>
            <View style={s.detalleRow}>
            <Ionicons name="person-outline" size={14} color="#6b7280" />
            <Text style={s.detalleText}>
                {penalizacion.clases.staff?.nombre} {penalizacion.clases.staff?.primer_apellido}
            </Text>
            </View>
            <View style={s.detalleRow}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={s.detalleText}>
                {new Date(penalizacion.clases.horario).toLocaleDateString('es-MX', {
                weekday: 'long', day: 'numeric', month: 'long'
                })} · {new Date(penalizacion.clases.horario).toLocaleTimeString('es-MX', {
                hour: '2-digit', minute: '2-digit'
                })}
            </Text>
            </View>
            <View style={s.detalleRow}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={s.detalleText}>
                {penalizacion.clases.sucursales?.nombre} · {penalizacion.clases.rooms?.nombre}
            </Text>
            </View>
        </View>
        )}
        <View style={s.montoBox}>
          <Text style={s.montoLabel}>Cargo pendiente</Text>
          <Text style={s.monto}>${penalizacion.monto?.toLocaleString('es-MX')} MXN</Text>
        </View>
        <TouchableOpacity
          style={[s.btn, loading && s.btnDisabled]}
          disabled={loading}
          onPress={handlePagar}
          activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Pagar ${penalizacion.monto?.toLocaleString('es-MX')} →</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card:           { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', gap: 16 },
  iconBox:        { width: 64, height: 64, borderRadius: 20, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  titulo:         { fontSize: 20, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  sub:            { fontSize: 14, color: '#6b7280', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 22 },
  montoBox:       { backgroundColor: '#fef2f2', borderRadius: 14, padding: 16, width: '100%', alignItems: 'center', gap: 4 },
  montoLabel:     { fontSize: 12, color: '#ef4444', fontFamily: 'Gotham_700Bold', textTransform: 'uppercase', letterSpacing: 1 },
  monto:          { fontSize: 28, fontFamily: 'Gotham_700Bold', color: '#ef4444' },
  btn:            { backgroundColor: '#171B24', borderRadius: 14, paddingVertical: 16, width: '100%', alignItems: 'center' },
  btnDisabled:    { backgroundColor: '#e5e7eb' },
  btnText:        { color: '#fff', fontSize: 15, fontFamily: 'Gotham_700Bold' },
  webviewHeader:  { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  webviewTitulo:  { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  procesando:     { flex: 1, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', gap: 16 },
  procesandoText: { color: '#fff', fontSize: 14, fontFamily: 'Gotham_400Regular' },
  detalleBox:    { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, width: '100%', gap: 8 },
    detalleTitulo: { fontSize: 11, fontFamily: 'Gotham_700Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    detalleRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detalleText:   { fontSize: 13, color: '#374151', fontFamily: 'Gotham_400Regular', flex: 1 },
})