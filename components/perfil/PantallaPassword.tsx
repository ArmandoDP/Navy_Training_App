import { useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { Ionicons }       from '@expo/vector-icons'
import { supabase }       from '../../lib/supabase'
import SubPantallaLayout  from './SubPantallaLayout'
import CampoEditable      from './CampoEditable'

interface Props { onBack: () => void }

export default function PantallaPassword({ onBack }: Props) {
  const [form,      setForm]      = useState({ actual: '', nueva: '', confirmar: '' })
  const [guardando, setGuardando] = useState(false)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleCambiar = async () => {
    if (form.nueva !== form.confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden')
      return
    }
    if (form.nueva.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres')
      return
    }
    setGuardando(true)
    const { error } = await supabase.auth.updateUser({ password: form.nueva })
    setGuardando(false)
    if (error) {
      Alert.alert('Error', error.message)
      return
    }
    Alert.alert('¡Listo!', 'Tu contraseña se cambió correctamente')
    onBack()
  }

  return (
    <SubPantallaLayout titulo="Cambiar contraseña" subtitulo="MI INFORMACIÓN" onBack={onBack} onGuardar={handleCambiar} guardando={guardando}>
      <View style={s.seccion}>
        <View style={s.seccionHeader}>
          <Ionicons name="lock-closed-outline" size={18} color="#374151" />
          <Text style={s.seccionTitulo}>Seguridad</Text>
        </View>
        <CampoEditable label="Contraseña Actual"   value={form.actual}    onChange={v => set('actual', v)}    secureTextEntry />
        <CampoEditable label="Nueva contraseña"    value={form.nueva}     onChange={v => set('nueva', v)}     secureTextEntry />
        <CampoEditable label="Confirmar contraseña" value={form.confirmar} onChange={v => set('confirmar', v)} secureTextEntry />
      </View>
    </SubPantallaLayout>
  )
}

const s = StyleSheet.create({
  seccion:       { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  seccionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  seccionTitulo: { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
})