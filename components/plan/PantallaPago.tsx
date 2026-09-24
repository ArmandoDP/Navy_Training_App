import { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native'
import { Ionicons }      from '@expo/vector-icons'
import { WebView }       from 'react-native-webview'
import SubPantallaLayout from '../perfil/SubPantallaLayout'
import { supabase }      from '../../lib/supabase'

// const BACKEND_URL = 'https://navy-traning-backend-production.up.railway.app'
// const BACKEND_URL = 'https://navy-traning-backend-production.up.railway.app'
const BACKEND_URL = 'https://navy-traning-backend-production.up.railway.app'


interface Props {
  paquete:  any
  cliente:  any
  tarjetas: any[]
  onPagado: () => void
  onBack:   () => void
}

export default function PantallaPago({ paquete, cliente, tarjetas, onPagado, onBack }: Props) {
  const [loading,      setLoading]      = useState(false)
  const [checkoutUrl,  setCheckoutUrl]  = useState<string | null>(null)
  const [checkoutId,   setCheckoutId]   = useState<string | null>(null)
  const [orderId,      setOrderId]      = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)

  const handleIniciarPago = async () => {
    setLoading(true)
    console.log('cliente:', JSON.stringify(cliente))
    console.log('sucursal_id:', cliente.sucursal_id)
    try {
      const res = await fetch(`${BACKEND_URL}/pagos/crear-checkout`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id:        cliente.id,
          paquete_id:        paquete.id,
          sucursal_id:       cliente.sucursal_id,  // ← falta aquí
          payment_method_id: '',
          device_session_id: '',
          monto: paquete.precio,
          checkout_id: checkoutId,   // ← agrega
          order_id:    orderId,
          allow_save_payment_methods: true,
        }),
      })
      const data = await res.json()
      console.log('Checkout response:', JSON.stringify(data))  // ← agrega
      if (!res.ok) throw new Error(data.detail || 'Error al crear checkout')
      setCheckoutUrl(data.checkout_url)
      setCheckoutId(data.checkout_id)
      setOrderId(data.order_id)
    } catch (err: any) {
      Alert.alert('Error', err.message)
    }
    setLoading(false)
  }

  const handleNavChange = async (navState: any) => {
    const url = navState.url

    // Detectar redirect de éxito
    if (url.includes('navyapp://pago/completado') || url.includes('pago/completado')) {
      setCheckoutUrl(null)

      // Guardar pago y membresía en DB
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await fetch(`${BACKEND_URL}/pagos/confirmar-checkout`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            cliente_id:  cliente.id,
            paquete_id:  paquete.id,
            checkout_id: checkoutId,
            order_id:    orderId,
            monto:       paquete.precio,
          }),
        })
      } catch (e) {
        console.log('Error confirmando checkout:', e)
      }
      onPagado()
      return
    }

    // Detectar redirect de cancelación
    if (url.includes('navyapp://pago/cancelado') || url.includes('pago/cancelado')) {
      setCheckoutUrl(null)
      Alert.alert('Pago cancelado', 'El pago fue cancelado. Puedes intentarlo de nuevo.')
    }
  }

  // Vista del WebView de checkout
  if (checkoutUrl) return (
    <View style={{ flex: 1 }}>
      <View style={s.webviewHeader}>
        <TouchableOpacity onPress={() => setCheckoutUrl(null)} style={s.webviewBack}>
          <Ionicons name="close" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={s.webviewTitulo}>Pago seguro</Text>
        <View style={{ width: 32 }} />
      </View>
      <WebView
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={handleNavChange}
        onShouldStartLoadWithRequest={(request) => {
          const url = request.url
          console.log('URL cambiando a:', url)
          if (url.includes('pago/completado')) {
            setCheckoutUrl(null)
            setProcesando(true)  // ← activa la pantalla de procesando

            const urlObj         = new URL(url)
            const orderIdParam   = urlObj.searchParams.get('order_id') || orderId
            
            fetch(`${BACKEND_URL}/pagos/confirmar-checkout`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cliente_id:        cliente.id,
                paquete_id:        paquete.id,
                sucursal_id:       cliente.sucursal_id,  // ← agrega
                payment_method_id: '',
                device_session_id: '',
                checkout_id: checkoutId,   // ← agrega
                order_id:    orderId,
                monto:             paquete.precio,
              }),
            }).then(() => {
              setProcesando(false)
              onPagado()
            }).catch(() => {
              setProcesando(false)
              onPagado()
            })

            return false
          }
          if (url.includes('pago/cancelado')) {
            setCheckoutUrl(null)
            Alert.alert('Pago cancelado', 'El pago fue cancelado.')
            return false
          }
          return true
        }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={s.webviewLoading}>
            <ActivityIndicator color="#171B24" />
            <Text style={s.webviewLoadingText}>Cargando pago seguro...</Text>
          </View>
        )}
      />
    </View>
  )

  if (procesando) return (
  <View style={s.procesandoContainer}>
    <View style={s.procesandoCard}>
      <ActivityIndicator color="#171B24" size="large" />
      <Text style={s.procesandoTitulo}>Procesando tu pago</Text>
      <Text style={s.procesandoSub}>Estamos activando tu membresía,{'\n'}esto tarda solo un momento...</Text>
      <View style={s.procesandoBarra}>
        <View style={s.procesandoBarraFill} />
      </View>
    </View>
  </View>
)

  // Vista principal
  return (
    <SubPantallaLayout titulo="Método de pago" onBack={onBack}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Resumen */}
        <View style={s.resumen}>
          <Text style={s.resumenTitulo}>Resumen</Text>
          <View style={s.resumenRow}>
            <Text style={s.resumenNombre}>{paquete.nombre}</Text>
            <Text style={s.resumenPrecio}>${paquete.precio?.toLocaleString('es-MX')}</Text>
          </View>
          <Text style={s.resumenInfo}>
            {paquete.clases_incluidas ? `${paquete.clases_incluidas} clases` : 'Ilimitado'} · {paquete.vigencia_dias} días
          </Text>
          <View style={[s.resumenRow, s.resumenDivider]}>
            <Text style={s.resumenLabel}>IVA</Text>
            <Text style={s.resumenLabel}>Incluido</Text>
          </View>
          <View style={s.resumenRow}>
            <Text style={s.resumenTotal}>Total hoy</Text>
            <Text style={s.resumenTotalPrecio}>${paquete.precio?.toLocaleString('es-MX')}</Text>
          </View>
        </View>

        {/* Info pago */}
        <View style={s.infoBox}>
          <View style={s.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#22c55e" />
            <Text style={s.infoText}>Pago seguro procesado por OrkestaPay</Text>
          </View>
          <View style={s.infoRow}>
            <Ionicons name="card-outline" size={16} color="#6366f1" />
            <Text style={s.infoText}>Visa, Mastercard y AMEX</Text>
          </View>
          <View style={s.infoRow}>
            <Ionicons name="lock-closed-outline" size={16} color="#f59e0b" />
            <Text style={s.infoText}>Datos encriptados y seguros</Text>
          </View>
        </View>

        {/* Aviso */}
        <View style={s.aviso}>
          <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
          <Text style={s.avisoText}>
            Al pagar aceptas que se cobre automáticamente los no-shows según las reglas de tu paquete.
          </Text>
        </View>

        {/* Botón pagar */}
        <TouchableOpacity
          style={[s.btnPagar, loading && s.btnPagarDisabled]}
          disabled={loading}
          onPress={handleIniciarPago}
          activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnPagarText}>Pagar ${paquete.precio?.toLocaleString('es-MX')} →</Text>
          }
        </TouchableOpacity>

        <Text style={s.seguro}>Pago seguro encriptado · OrkestaPay</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SubPantallaLayout>
  )
}

const s = StyleSheet.create({
  resumen:           { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 20, gap: 8 },
  resumenTitulo:     { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#9ca3af', marginBottom: 4 },
  resumenRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumenNombre:     { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
  resumenPrecio:     { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
  resumenInfo:       { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  resumenDivider:    { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8, marginTop: 4 },
  resumenLabel:      { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  resumenTotal:      { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111' },
  resumenTotalPrecio:{ fontSize: 18, fontFamily: 'Gotham_700Bold', color: '#111' },
  infoBox:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16, gap: 12 },
  infoRow:           { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText:          { fontSize: 13, color: '#374151', fontFamily: 'Gotham_400Regular' },
  aviso:             { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 20 },
  avisoText:         { flex: 1, fontSize: 12, color: '#6b7280', fontFamily: 'Gotham_400Regular', lineHeight: 18 },
  btnPagar:          { backgroundColor: '#171B24', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  btnPagarDisabled:  { backgroundColor: '#e5e7eb' },
  btnPagarText:      { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  seguro:            { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center' },
  webviewHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  webviewBack:       { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  webviewTitulo:     { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
  webviewLoading:    { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff' },
  webviewLoadingText: { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  procesandoContainer: { flex: 1, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', padding: 32 },
  procesandoCard:      { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', gap: 16, width: '100%' },
  procesandoTitulo:    { fontSize: 20, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  procesandoSub:       { fontSize: 14, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 22 },
  procesandoBarra:     { width: '100%', height: 4, backgroundColor: '#f3f4f6', borderRadius: 2, overflow: 'hidden' },
  procesandoBarraFill: { width: '70%', height: 4, backgroundColor: '#171B24', borderRadius: 2 },
})