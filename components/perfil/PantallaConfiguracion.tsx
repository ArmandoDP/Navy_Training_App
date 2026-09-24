import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native'
import { Ionicons }        from '@expo/vector-icons'
import { supabase }        from '../../lib/supabase'
import SubPantallaLayout   from './SubPantallaLayout'
import ModalEliminarCuenta from './ModalEliminarCuenta'

interface Props { cliente: any; onBack: () => void; onGuardado: () => void }

export default function PantallaConfiguracion({ cliente, onBack, onGuardado }: Props) {
  const [form,         setForm]         = useState({ terminos: false, privacidad: false, legal: false, notificaciones: false, comerciales: false })
  const [guardando,    setGuardando]    = useState(false)
  const [modalEliminar,setModalEliminar]= useState(false)

  useEffect(() => {
    if (cliente) setForm({
      terminos:       cliente.acepto_terminos   || false,
      privacidad:     cliente.acepto_privacidad || false,
      legal:          false,
      notificaciones: false,
      comerciales:    false,
    })
  }, [cliente])

  const set = (k: string, v: boolean) => setForm(p => ({ ...p, [k]: v }))

  const handleGuardar = async () => {
    setGuardando(true)
    await supabase.from('clientes').update({
      acepto_terminos:   form.terminos,
      acepto_privacidad: form.privacidad,
    }).eq('id', cliente.id)
    setGuardando(false)
    onGuardado()
    onBack()
  }

  const TOGGLES = [
    { key: 'terminos',       label: 'Acepto los términos y condiciones', sub: 'Lee el documento completo',           required: true  },
    { key: 'privacidad',     label: 'Política de privacidad',            sub: 'Cómo usamos tus datos',              required: true  },
    { key: 'legal',          label: 'Otro texto legal',                  sub: 'Lorem ipsum',                        required: true  },
    { key: 'notificaciones', label: 'Recibir notificaciones push',       sub: 'Recordatorios y alertas importantes', required: false },
    { key: 'comerciales',    label: 'Comunicaciones comerciales',        sub: 'Ofertas eventos y novedades',         required: false },
  ]

  return (
    <>
      <ModalEliminarCuenta
        visible={modalEliminar}
        cliente={cliente}
        onClose={() => setModalEliminar(false)}
      />

      <SubPantallaLayout
        titulo="Configuración"
        subtitulo="MI INFORMACIÓN"
        onBack={onBack}
        onGuardar={handleGuardar}
        guardando={guardando}
        footerExtra={
          <TouchableOpacity style={s.eliminarBtn} onPress={() => setModalEliminar(true)}>
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={s.eliminarText}>Eliminar mi cuenta</Text>
          </TouchableOpacity>
        }>

        <View style={s.seccion}>
          {TOGGLES.map((t, i) => (
            <View key={t.key} style={[s.toggleRow, i < TOGGLES.length - 1 && s.toggleBorder]}>
              <View style={s.toggleTexto}>
                <Text style={s.toggleLabel}>
                  {t.label}{t.required && <Text style={s.required}>*</Text>}
                </Text>
                <Text style={s.toggleSub}>{t.sub}</Text>
              </View>
              <Switch
                value={(form as any)[t.key]}
                onValueChange={v => set(t.key, v)}
                trackColor={{ false: '#e5e7eb', true: '#171B24' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

      </SubPantallaLayout>
    </>
  )
}

const s = StyleSheet.create({
  seccion:      { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden' },
  toggleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
  toggleBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  toggleTexto:  { flex: 1 },
  toggleLabel:  { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 2 },
  toggleSub:    { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  required:     { color: '#ef4444' },
  eliminarBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderWidth: 1, borderColor: '#fee2e2', borderRadius: 14, marginTop: 8 },
  eliminarText: { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#ef4444' },
})