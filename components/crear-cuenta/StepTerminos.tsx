import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native'
import { Ionicons }    from '@expo/vector-icons'
import ModalTerminos   from '../auth/ModalTerminos'

interface Props {
  form:     { terminos: boolean; privacidad: boolean; notificaciones: boolean; comunicaciones: boolean }
  onChange: (k: string, v: boolean) => void
}

export default function StepTerminos({ form, onChange }: Props) {
  const [modalTerminos, setModalTerminos] = useState(false)

  return (
    <View style={s.container}>
      <Text style={s.titulo}>Últimos detalles</Text>
      <Text style={s.sub}>Lee y acepta los documentos para continuar</Text>

      <TouchableOpacity style={[s.docRow, form.terminos && s.docRowActivo]}
        onPress={() => setModalTerminos(true)} activeOpacity={0.8}>
        <View style={[s.docIconBox, form.terminos && s.docIconBoxActivo]}>
          <Ionicons name={form.terminos ? 'checkmark' : 'document-text-outline'}
            size={20} color={form.terminos ? '#fff' : '#6b7280'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.docLabel}>Términos y Condiciones</Text>
          <Text style={s.docSub}>{form.terminos ? '✓ Aceptado' : 'Toca para leer y aceptar'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      </TouchableOpacity>

      <View style={[s.docRow, !form.terminos && s.docRowDisabled, form.privacidad && s.docRowActivo]}>
        <View style={[s.docIconBox, form.privacidad && s.docIconBoxActivo]}>
          <Ionicons name={form.privacidad ? 'checkmark' : 'shield-outline'}
            size={20} color={form.privacidad ? '#fff' : '#6b7280'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.docLabel}>Aviso de Privacidad</Text>
          <Text style={s.docSub}>
            {form.privacidad ? '✓ Aceptado' : form.terminos ? 'Se mostrará al aceptar los términos' : 'Acepta los términos primero'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      </View>

      {[
        { key: 'notificaciones', label: 'Recibir notificaciones push', sub: 'Recordatorios y alertas importantes' },
        { key: 'comunicaciones', label: 'Comunicaciones comerciales',  sub: 'Ofertas, eventos y novedades' },
      ].map(item => (
        <View key={item.key} style={s.toggleRow}>
          <View style={s.toggleText}>
            <Text style={s.toggleLabel}>{item.label}</Text>
            <Text style={s.toggleSub}>{item.sub}</Text>
          </View>
          <Switch
            value={(form as any)[item.key]}
            onValueChange={v => onChange(item.key, v)}
            trackColor={{ false: '#e5e7eb', true: '#171B24' }}
            thumbColor="#fff"
          />
        </View>
      ))}

      <ModalTerminos
        visible={modalTerminos}
        onAceptar={() => { onChange('terminos', true); onChange('privacidad', true); setModalTerminos(false) }}
        onRechazar={() => setModalTerminos(false)}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container:       { paddingHorizontal: 20, paddingTop: 24, gap: 20 },
  titulo:          { fontSize: 28, fontFamily: 'Gotham_700Bold', color: '#111' },
  sub:             { fontSize: 14, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: -12 },
  docRow:          { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#f3f4f6' },
  docRowActivo:    { backgroundColor: '#f0fdf4', borderColor: '#22c55e' },
  docRowDisabled:  { opacity: 0.5 },
  docIconBox:      { width: 40, height: 40, borderRadius: 12, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  docIconBoxActivo:{ backgroundColor: '#22c55e' },
  docLabel:        { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111' },
  docSub:          { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 2 },
  toggleRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 12 },
  toggleText:      { flex: 1, gap: 2 },
  toggleLabel:     { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111' },
  toggleSub:       { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
})