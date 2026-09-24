import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const BACKEND_URL = 'https://navy-traning-backend-production.up.railway.app'

interface Props {
  paquete:   any
  cliente:   any
  onTerminar: () => void
}

export default function ModalInvitadoApp({ paquete, cliente, onTerminar }: Props) {
  const [form, setForm] = useState({
    nombre:          '',
    primer_apellido: '',
    email:           '',
    telefono:        '',
  })
  const [loading,  setLoading]  = useState(false)
  const [omitido,  setOmitido]  = useState(false)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleCrear = async () => {
    if (!form.nombre || !form.email) return
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/clientes/crear-invitado`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          titular_id: cliente.id,
          nombre:     form.nombre,
          apellido:   form.primer_apellido,
          email:      form.email,
          telefono:   form.telefono,
        }),
      })
      if (!res.ok) throw new Error('Error al crear invitado')
      onTerminar()
    } catch (err: any) {
      Alert.alert('Error', err.message)
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      <View style={s.card}>
        {/* Header */}
        <View style={s.iconBox}>
          <Ionicons name="people" size={28} color="#6366f1" />
        </View>
        <Text style={s.titulo}>¡Tienes un lugar para invitar!</Text>
        <Text style={s.sub}>
          Tu paquete <Text style={s.bold}>{paquete?.nombre}</Text> incluye un usuario adicional. 
          Invita a alguien para que también disfrute de Navy.
        </Text>

        {/* Info */}
        <View style={s.infoBox}>
          <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
          <Text style={s.infoText}>El invitado tendrá acceso a las mismas clases sin costo adicional</Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          <View style={s.row}>
            <View style={s.fieldHalf}>
              <Text style={s.label}>Nombre *</Text>
              <TextInput
                style={s.input}
                placeholder="Nombre"
                placeholderTextColor="#9ca3af"
                value={form.nombre}
                onChangeText={v => set('nombre', v)}
              />
            </View>
            <View style={s.fieldHalf}>
              <Text style={s.label}>Apellido</Text>
              <TextInput
                style={s.input}
                placeholder="Apellido"
                placeholderTextColor="#9ca3af"
                value={form.primer_apellido}
                onChangeText={v => set('primer_apellido', v)}
              />
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Correo electrónico *</Text>
            <TextInput
              style={s.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={v => set('email', v)}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Teléfono</Text>
            <TextInput
              style={s.input}
              placeholder="Teléfono"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={form.telefono}
              onChangeText={v => set('telefono', v)}
            />
          </View>
        </View>

        {/* Botones */}
        <TouchableOpacity
          style={[s.btnPrimario, (!form.nombre || !form.email || loading) && s.btnDisabled]}
          disabled={!form.nombre || !form.email || loading}
          onPress={handleCrear}
          activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnPrimarioText}>Invitar →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={s.btnOmitir} onPress={onTerminar}>
          <Text style={s.btnOmitirText}>Omitir por ahora</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card:           { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', gap: 14 },
  iconBox:        { width: 56, height: 56, borderRadius: 18, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  titulo:         { fontSize: 20, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  sub:            { fontSize: 13, color: '#6b7280', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 20 },
  bold:           { fontFamily: 'Gotham_700Bold', color: '#111' },
  infoBox:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', borderRadius: 10, padding: 10 },
  infoText:       { fontSize: 12, color: '#22c55e', fontFamily: 'Gotham_400Regular', flex: 1 },
  form:           { gap: 12 },
  row:            { flexDirection: 'row', gap: 10 },
  field:          { gap: 4 },
  fieldHalf:      { flex: 1, gap: 4 },
  label:          { fontSize: 12, fontFamily: 'Gotham_700Bold', color: '#374151' },
  input:          { backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111', fontFamily: 'Gotham_400Regular' },
  btnPrimario:    { backgroundColor: '#171B24', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnDisabled:    { backgroundColor: '#e5e7eb' },
  btnPrimarioText:{ color: '#fff', fontSize: 15, fontFamily: 'Gotham_700Bold' },
  btnOmitir:      { alignItems: 'center', paddingVertical: 8 },
  btnOmitirText:  { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
})