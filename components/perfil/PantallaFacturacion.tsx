import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons }       from '@expo/vector-icons'
import { supabase }       from '../../lib/supabase'
import SubPantallaLayout  from './SubPantallaLayout'
import CampoEditable      from './CampoEditable'

interface Props { cliente: any; onBack: () => void; onGuardado: () => void }

export default function PantallaFacturacion({ cliente, onBack, onGuardado }: Props) {
  const [form,      setForm]      = useState({ nombre: '', rfc: '', telefono: '', direccion: '', cp: '', ciudad: '', estado: '', email: '' })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (cliente) setForm({
      nombre:    cliente.nombre_completo   || '',
      rfc:       cliente.rfc              || '',
      telefono:  cliente.telefono         || '',
      direccion: cliente.direccion        || '',
      cp:        cliente.codigo_postal    || '',
      ciudad:    cliente.ciudad           || '',
      estado:    cliente.estado_residencia|| '',
      email:     cliente.email            || '',
    })
  }, [cliente])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleGuardar = async () => {
    setGuardando(true)
    await supabase.from('clientes').update({
      rfc:               form.rfc,
      direccion:         form.direccion,
      codigo_postal:     form.cp,
      ciudad:            form.ciudad,
      estado_residencia: form.estado,
    }).eq('id', cliente.id)
    setGuardando(false)
    onGuardado()
    onBack()
  }

  return (
    <SubPantallaLayout titulo="Datos de facturación" subtitulo="MI INFORMACIÓN" onBack={onBack} onGuardar={handleGuardar} guardando={guardando}>
      <View style={s.seccion}>
        <View style={s.seccionHeader}>
          <Ionicons name="document-text-outline" size={18} color="#374151" />
          <Text style={s.seccionTitulo}>Datos de facturación</Text>
        </View>
        <CampoEditable label="Nombre"        value={form.nombre}   onChange={v => set('nombre', v)} />
        <CampoEditable label="RFC"           value={form.rfc}      onChange={v => set('rfc', v)} />
        <CampoEditable label="Teléfono"      value={form.telefono} onChange={v => set('telefono', v)} keyboardType="phone-pad" />
        <CampoEditable label="Dirección"     value={form.direccion}onChange={v => set('direccion', v)} />
        <CampoEditable label="Código postal" value={form.cp}       onChange={v => set('cp', v)} keyboardType="numeric" />
        <CampoEditable label="Ciudad"        value={form.ciudad}   onChange={v => set('ciudad', v)} />
        <CampoEditable label="Estado"        value={form.estado}   onChange={v => set('estado', v)} />
        <CampoEditable label="Email"         value={form.email}    onChange={() => {}} editable={false} />
      </View>
    </SubPantallaLayout>
  )
}

const s = StyleSheet.create({
  seccion:       { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  seccionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  seccionTitulo: { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
})