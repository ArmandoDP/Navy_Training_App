import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { supabase } from '../../lib/supabase'
import SubPantallaLayout from './SubPantallaLayout'

interface Props { cliente: any; onBack: () => void }

interface NotifConfig {
  reserva_confirmada:    boolean
  reserva_cancelada:     boolean
  recordatorio_clase:    boolean
  membresia_por_vencer:  boolean
  pago_exitoso:          boolean
  no_show:               boolean
  nueva_clase:           boolean
  promociones:           boolean
}

const SECCIONES = [
  {
    titulo: 'Reservas y clases',
    items: [
      { key: 'reserva_confirmada',   label: 'Reserva confirmada',    sub: 'Cuando tu reserva es confirmada exitosamente' },
      { key: 'reserva_cancelada',    label: 'Reserva cancelada',     sub: 'Cuando una clase es cancelada por el gym' },
      { key: 'recordatorio_clase',   label: 'Recordatorio de clase', sub: '1 hora antes de tu clase programada' },
    ]
  },
  {
    titulo: 'Membresía y pagos',
    items: [
      { key: 'membresia_por_vencer', label: 'Membresía por vencer',  sub: '3 días antes de que expire tu membresía' },
      { key: 'pago_exitoso',         label: 'Pago exitoso',          sub: 'Confirmación de cada pago realizado' },
      { key: 'no_show',              label: 'Penalización No Show',  sub: 'Cuando se genera una penalización por no asistir' },
    ]
  },
  {
    titulo: 'Navy',
    items: [
      { key: 'nueva_clase',  label: 'Nuevas clases',   sub: 'Cuando se agrega una nueva clase al horario' },
      { key: 'promociones',  label: 'Promociones',     sub: 'Ofertas especiales y descuentos exclusivos' },
    ]
  },
]

const DEFAULT_CONFIG: NotifConfig = {
  reserva_confirmada:   true,
  reserva_cancelada:    true,
  recordatorio_clase:   true,
  membresia_por_vencer: true,
  pago_exitoso:         true,
  no_show:              true,
  nueva_clase:          false,
  promociones:          false,
}

export default function PantallaNotificaciones({ cliente, onBack }: Props) {
  const [config,    setConfig]    = useState<NotifConfig>(DEFAULT_CONFIG)
  const [loading,   setLoading]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)

  useEffect(() => {
    if (!cliente?.id) return
    fetchConfig()
  }, [cliente])

  const fetchConfig = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('notificaciones_config')
      .select('*')
      .eq('cliente_id', cliente.id)
      .maybeSingle()
    if (data) setConfig(data)
    setLoading(false)
  }

  const toggleItem = async (key: keyof NotifConfig) => {
    const nueva = { ...config, [key]: !config[key] }
    setConfig(nueva)
    setGuardando(true)

    const { data: existe } = await supabase
      .from('notificaciones_config')
      .select('id')
      .eq('cliente_id', cliente.id)
      .maybeSingle()

    if (existe) {
      await supabase.from('notificaciones_config')
        .update({ [key]: !config[key] })
        .eq('cliente_id', cliente.id)
    } else {
      await supabase.from('notificaciones_config')
        .insert({ cliente_id: cliente.id, ...nueva })
    }

    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  if (loading) return (
    <SubPantallaLayout titulo="Notificaciones" subtitulo="MI PERFIL" onBack={onBack}>
      <View style={s.loadingBox}>
        <ActivityIndicator color="#171B24" />
      </View>
    </SubPantallaLayout>
  )

  return (
    <SubPantallaLayout titulo="Notificaciones" subtitulo="MI PERFIL" onBack={onBack}>

      {guardado && (
        <View style={s.toast}>
          <Text style={s.toastText}>✓ Preferencias guardadas</Text>
        </View>
      )}

      <Text style={s.descripcion}>
        Elige qué notificaciones quieres recibir. Siempre te avisaremos sobre cambios importantes en tu cuenta.
      </Text>

      {SECCIONES.map(seccion => (
        <View key={seccion.titulo} style={s.seccion}>
          <Text style={s.seccionTitulo}>{seccion.titulo}</Text>
          <View style={s.seccionCard}>
            {seccion.items.map((item, i) => {
              const activo = config[item.key as keyof NotifConfig]
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[s.item, i < seccion.items.length - 1 && s.itemBorder]}
                  onPress={() => toggleItem(item.key as keyof NotifConfig)}
                  activeOpacity={0.7}>
                  <View style={s.itemTexto}>
                    <Text style={s.itemLabel}>{item.label}</Text>
                    <Text style={s.itemSub}>{item.sub}</Text>
                  </View>
                  <View style={[s.toggle, activo && s.toggleActive]}>
                    <View style={[s.toggleThumb, activo && s.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      ))}

      <View style={s.infoBox}>
        <Text style={s.infoText}>
          📱 Las notificaciones push requieren que hayas dado permiso en tu dispositivo. Puedes cambiar esto en Configuración de tu teléfono.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </SubPantallaLayout>
  )
}

const s = StyleSheet.create({
  loadingBox:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  toast:            { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center' },
  toastText:        { color: '#16a34a', fontSize: 13, fontFamily: 'Gotham_700Bold' },
  descripcion:      { fontSize: 14, color: '#9ca3af', fontFamily: 'Gotham_400Regular', lineHeight: 22, marginBottom: 24 },
  seccion:          { marginBottom: 24 },
  seccionTitulo:    { fontSize: 12, fontFamily: 'Gotham_700Bold', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  seccionCard:      { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden' },
  item:             { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  itemBorder:       { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemTexto:        { flex: 1 },
  itemLabel:        { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 2 },
  itemSub:          { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', lineHeight: 18 },
  toggle:           { width: 44, height: 26, borderRadius: 13, backgroundColor: '#e5e7eb', justifyContent: 'center', paddingHorizontal: 3 },
  toggleActive:     { backgroundColor: '#171B24' },
  toggleThumb:      { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 },
  toggleThumbActive:{ transform: [{ translateX: 18 }] },
  infoBox:          { backgroundColor: '#f9fafb', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  infoText:         { fontSize: 13, color: '#6b7280', fontFamily: 'Gotham_400Regular', lineHeight: 20 },
})