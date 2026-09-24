import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  onSelect:      (key: string) => void
  onLogout:      () => void
  tienePlan:     boolean
  reservasCount: number
  ultimoPago:    any | null
}

export default function PerfilMenu({ onSelect, onLogout, tienePlan, reservasCount, ultimoPago }: Props) {

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

      <TouchableOpacity style={s.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={s.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container:    { padding: 16, gap: 12 },
  lista:        { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden', marginBottom: 8 },
  item:         { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  itemBorder:   { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemIcon:     { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  itemTexto:    { flex: 1 },
  itemLabel:    { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 2 },
  itemSub:      { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  logoutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#fee2e2' },
  logoutText:   { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#ef4444' },
})