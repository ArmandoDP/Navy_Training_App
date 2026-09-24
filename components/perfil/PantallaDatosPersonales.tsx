import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons }         from '@expo/vector-icons'
import { supabase }         from '../../lib/supabase'
import SubPantallaLayout    from './SubPantallaLayout'
import CampoEditable        from './CampoEditable'

interface Props { cliente: any; onBack: () => void; onGuardado: () => void }

export default function PantallaDatosPersonales({ cliente, onBack, onGuardado }: Props) {
  const [form,      setForm]      = useState({ nombre: '', telefono: '', email: '', fecha_nacimiento: '' })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (cliente) setForm({
      nombre:           cliente.nombre_completo || '',
      telefono:         cliente.telefono         || '',
      email:            cliente.email            || '',
      fecha_nacimiento: cliente.fecha_nacimiento
        ? new Date(cliente.fecha_nacimiento).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '',
    })
  }, [cliente])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleGuardar = async () => {
    setGuardando(true)
    await supabase.from('clientes').update({
      nombre_completo:  form.nombre,
      telefono:         form.telefono,
    }).eq('id', cliente.id)
    setGuardando(false)
    onGuardado()
    onBack()
  }

  return (
    <SubPantallaLayout titulo="Datos personales" subtitulo="MI INFORMACIÓN" onBack={onBack} onGuardar={handleGuardar} guardando={guardando}>
      <View style={s.seccion}>
        <View style={s.seccionHeader}>
          <Ionicons name="person-outline" size={18} color="#374151" />
          <Text style={s.seccionTitulo}>Datos personales</Text>
        </View>
        <CampoEditable label="Nombre"     value={form.nombre}           onChange={v => set('nombre', v)} />
        <CampoEditable label="Teléfono"   value={form.telefono}         onChange={v => set('telefono', v)} keyboardType="phone-pad" />
        <CampoEditable label="Email"      value={form.email}            onChange={() => {}} editable={false} />
        <CampoEditable label="Cumpleaños" value={form.fecha_nacimiento} onChange={v => set('fecha_nacimiento', v)} />
      </View>
    </SubPantallaLayout>
  )
}

const s = StyleSheet.create({
  seccion:       { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  seccionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  seccionTitulo: { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
})