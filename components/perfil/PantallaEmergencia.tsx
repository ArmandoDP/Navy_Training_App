import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons }       from '@expo/vector-icons'
import { supabase }       from '../../lib/supabase'
import SubPantallaLayout  from './SubPantallaLayout'
import CampoEditable      from './CampoEditable'

interface Props { cliente: any; onBack: () => void; onGuardado: () => void }

export default function PantallaEmergencia({ cliente, onBack, onGuardado }: Props) {
  const [form,      setForm]      = useState({ nombre: '', telefono: '', email: '', relacion: '' })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (cliente) setForm({
      nombre:   cliente.contacto_emergencia_nombre   || '',
      telefono: cliente.contacto_emergencia_telefono || '',
      email:    cliente.contacto_emergencia_email    || '',
      relacion: cliente.contacto_emergencia_relacion || '',
    })
  }, [cliente])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleGuardar = async () => {
    setGuardando(true)
    await supabase.from('clientes').update({
      contacto_emergencia_nombre:   form.nombre,
      contacto_emergencia_telefono: form.telefono,
      contacto_emergencia_email:    form.email,
      contacto_emergencia_relacion: form.relacion,
    }).eq('id', cliente.id)
    setGuardando(false)
    onGuardado()
    onBack()
  }

  return (
    <SubPantallaLayout titulo="Contacto de emergencia" subtitulo="MI INFORMACIÓN" onBack={onBack} onGuardar={handleGuardar} guardando={guardando}>
      <View style={s.seccion}>
        <View style={s.seccionHeader}>
          <Ionicons name="id-card-outline" size={18} color="#374151" />
          <Text style={s.seccionTitulo}>Contacto de emergencia</Text>
        </View>
        <CampoEditable label="Nombre"               value={form.nombre}   onChange={v => set('nombre', v)} />
        <CampoEditable label="Teléfono"              value={form.telefono} onChange={v => set('telefono', v)} keyboardType="phone-pad" />
        <CampoEditable label="Email"                 value={form.email}    onChange={v => set('email', v)} keyboardType="email-address" />
        <CampoEditable label="Relación / parentesco" value={form.relacion} onChange={v => set('relacion', v)} />
      </View>
    </SubPantallaLayout>
  )
}

const s = StyleSheet.create({
  seccion:       { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  seccionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  seccionTitulo: { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
})