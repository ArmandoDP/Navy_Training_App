import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '../../lib/supabase'

interface Props {
  onSelect:      (key: string) => void
  onLogout:      () => void
  tienePlan:     boolean
  reservasCount: number
  ultimoPago:    any | null
  cliente:       any
  reservas:      any[]
}

export default function PerfilMenu({ onSelect, onLogout, tienePlan, reservasCount, ultimoPago, cliente, reservas }: Props) {
  const [showLogout, setShowLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const formatPago = () => {
    if (!ultimoPago) return 'Sin pagos registrados'
    const fecha = new Date(ultimoPago.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    return `Último: ${fecha} · $${ultimoPago.monto?.toLocaleString('es-MX')}`
  }

  const ITEMS = [
    { key: 'reservas',  label: 'Mis Reservas',      sub: `${reservasCount} próximas`,           icon: 'calendar-outline' },
    { key: 'historial', label: 'Historial de pago',  sub: formatPago(),                          icon: 'receipt-outline' },
    { key: 'metodos',   label: 'Métodos de pago',    sub: 'Tarjetas guardadas',                  icon: 'wallet-outline' },
    { key: 'notif',     label: 'Notificaciones',     sub: 'Push · Email',                        icon: 'notifications-outline' },
    { key: 'plan',      label: tienePlan ? 'Cambiar plan' : 'Comprar Plan', sub: 'Drop in, Mensuales, Full pass...', icon: 'card-outline' },
    { key: 'config',    label: 'Configuración',      sub: 'Privacidad y cuenta',                 icon: 'settings-outline' },
  ]

  const handleConfirmarLogout = async () => {
    setLoggingOut(true)
    try {
      // Borrar tokens de SecureStore
      await SecureStore.deleteItemAsync('navy_access_token').catch(() => {})
      await SecureStore.deleteItemAsync('navy_refresh_token').catch(() => {})
      await SecureStore.deleteItemAsync('navy_last_email').catch(() => {})

      // Poner bio_activada = false en BD
      if (cliente?.email) {
        await supabase.from('clientes')
          .update({ bio_activada: false })
          .eq('email', cliente.email)
      }

      setShowLogout(false)
      onLogout()
    } catch (e) {
      console.log('Error cerrando sesión:', e)
    }
    setLoggingOut(false)
  }

  const reservasProximas = reservas?.filter((r: any) => {
    return r.clases?.horario && new Date(r.clases.horario) > new Date() && r.estatus === 'Confirmada'
  }) || []

  return (
    <View style={s.container}>
      <View style={s.lista}>
        {ITEMS.map((item, i) => (
          <TouchableOpacity key={item.key}
            style={[s.item, i < ITEMS.length - 1 && s.itemBorder]}
            onPress={() => onSelect(item.key)}
            activeOpacity={0.7}>
            <View style={s.itemIcon}>
              <Ionicons name={item.icon as any} size={20} color="#6b7280" />
            </View>
            <View style={s.itemTexto}>
              <Text style={s.itemLabel}>{item.label}</Text>
              <Text style={s.itemSub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={() => setShowLogout(true)} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={s.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* Bottom sheet confirmación */}
      <Modal visible={showLogout} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle} />

            {/* Header */}
            <View style={s.sheetHeader}>
              <View style={s.sheetIconWrap}>
                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetTitulo}>¿Cerrar sesión?</Text>
                <Text style={s.sheetSub}>Tendrás que ingresar tus credenciales la próxima vez</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
              {/* Advertencias */}
              <View style={s.warningCard}>
                <View style={s.warningRow}>
                  <Ionicons name="shield-outline" size={16} color="#f59e0b" />
                  <Text style={s.warningText}>Tu Face ID / Huella se desactivará y tendrás que configurarlos de nuevo al iniciar sesión</Text>
                </View>
                <View style={s.warningRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                  <Text style={s.warningText}>Tus reservas activas se mantienen — no se cancelan al cerrar sesión</Text>
                </View>
                <View style={s.warningRow}>
                  <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
                  <Text style={s.warningText}>Si no asistes a tus clases reservadas, recibirás una penalización por No-Show</Text>
                </View>
              </View>

              {/* Reservas activas */}
              {reservasProximas.length > 0 && (
                <View style={s.reservasCard}>
                  <Text style={s.reservasTitle}>⚠️ Tienes {reservasProximas.length} reserva{reservasProximas.length > 1 ? 's' : ''} próxima{reservasProximas.length > 1 ? 's' : ''}</Text>
                  {reservasProximas.slice(0, 3).map((r: any) => (
                    <View key={r.id} style={s.reservaRow}>
                      <Ionicons name="fitness-outline" size={14} color="#6b7280" />
                      <Text style={s.reservaText}>
                        {r.clases?.nombre_clase} · {new Date(r.clases?.horario).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Botones */}
            <View style={s.sheetBtns}>
              <TouchableOpacity style={s.btnCancelar} onPress={() => setShowLogout(false)} activeOpacity={0.85}>
                <Text style={s.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnLogout} onPress={handleConfirmarLogout} disabled={loggingOut} activeOpacity={0.85}>
                <Text style={s.btnLogoutText}>{loggingOut ? 'Cerrando...' : 'Sí, cerrar sesión'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  container:     { padding: 16, gap: 12 },
  lista:         { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden', marginBottom: 8 },
  item:          { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  itemBorder:    { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemIcon:      { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  itemTexto:     { flex: 1 },
  itemLabel:     { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 2 },
  itemSub:       { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  logoutBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#fee2e2' },
  logoutText:    { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#ef4444' },

  // Sheet
  overlay:       { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:         { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle:        { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetHeader:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sheetIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fecaca' },
  sheetTitulo:   { fontSize: 18, fontFamily: 'Gotham_700Bold', color: '#111' },
  sheetSub:      { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 2 },

  // Warnings
  warningCard:   { backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, gap: 12, marginBottom: 12 },
  warningRow:    { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  warningText:   { flex: 1, fontSize: 13, color: '#374151', fontFamily: 'Gotham_400Regular', lineHeight: 18 },

  // Reservas
  reservasCard:  { backgroundColor: '#fef9c3', borderRadius: 16, padding: 16, gap: 8, marginBottom: 12, borderWidth: 1, borderColor: '#fde68a' },
  reservasTitle: { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#92400e' },
  reservaRow:    { flexDirection: 'row', gap: 8, alignItems: 'center' },
  reservaText:   { fontSize: 12, color: '#6b7280', fontFamily: 'Gotham_400Regular' },

  // Botones
  sheetBtns:     { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnCancelar:   { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnCancelarText:{ fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#374151' },
  btnLogout:     { flex: 1, backgroundColor: '#ef4444', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnLogoutText: { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#fff' },
})