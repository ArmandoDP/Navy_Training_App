import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, TextInput, ScrollView, Alert, ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase }  from '../../lib/supabase'

interface Props {
  visible:   boolean
  cliente:   any
  onClose:   () => void
}

type Paso = 'motivos' | 'confirmacion' | 'eliminando'

const MOTIVOS = [
  { key: 'no_uso',       label: 'Ya no uso el gym' },
  { key: 'precio',       label: 'El precio es muy alto' },
  { key: 'experiencia',  label: 'Mala experiencia' },
  { key: 'cambio',       label: 'Me cambié a otro gym' },
  { key: 'temporal',     label: 'Es algo temporal' },
  { key: 'otro',         label: 'Otro motivo' },
]

export default function ModalEliminarCuenta({ visible, cliente, onClose }: Props) {
  const [paso,          setPaso]          = useState<Paso>('motivos')
  const [motivoSel,     setMotivoSel]     = useState('')
  const [comentario,    setComentario]    = useState('')
  const [eliminando,    setEliminando]    = useState(false)

  const handleEliminar = async () => {
    setEliminando(true)
    setPaso('eliminando')

    try {
      // 1. Guardar feedback antes de eliminar
      await supabase.from('feedback_bajas').insert({
        cliente_id:   cliente.id,
        nombre:       cliente.nombre_completo,
        email:        cliente.email,
        motivo:       motivoSel,
        comentario:   comentario || null,
        created_at:   new Date().toISOString(),
      })

      // 2. Enviar email al equipo de Navy
      await fetch(`${process.env.EXPO_PUBLIC_CRM_URL}/api/notificaciones/baja-cliente`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          nombre:     cliente.nombre_completo,
          email:      cliente.email,
          motivo:     MOTIVOS.find(m => m.key === motivoSel)?.label || motivoSel,
          comentario: comentario || null,
        }),
      })

      // 3. Enviar email de confirmación al cliente
      await fetch(`${process.env.EXPO_PUBLIC_CRM_URL}/api/email/cuenta-eliminada`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          nombre: cliente.nombre_completo?.split(' ')[0],
          email:  cliente.email,
        }),
      })

      // 4. Eliminar datos
      await supabase.from('push_tokens').delete().eq('cliente_id', cliente.id)
      await supabase.from('reservas').delete().eq('cliente_id', cliente.id)
      await supabase.from('membresias').delete().eq('cliente_id', cliente.id)
      await supabase.from('reseñas').delete().eq('cliente_id', cliente.id)
      await supabase.from('clientes').delete().eq('id', cliente.id)

      // 5. Cerrar sesión
      await supabase.auth.signOut()

    } catch (err: any) {
      setEliminando(false)
      setPaso('confirmacion')
      Alert.alert('Error', 'No se pudo eliminar la cuenta. Contacta a soporte en hola@navytrainingcenter.com')
    }
  }

  const handleClose = () => {
    setPaso('motivos')
    setMotivoSel('')
    setComentario('')
    setEliminando(false)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>

          {/* ── Paso eliminando ── */}
          {paso === 'eliminando' && (
            <View style={s.eliminandoBox}>
              <ActivityIndicator size="large" color="#171B24" />
              <Text style={s.eliminandoText}>Eliminando tu cuenta...</Text>
              <Text style={s.eliminandoSub}>Esto puede tomar unos segundos</Text>
            </View>
          )}

          {/* ── Paso motivos ── */}
          {paso === 'motivos' && (
            <>
              <View style={s.sheetHeader}>
                <View style={s.sheetHeaderTexto}>
                  <Text style={s.sheetTitulo}>¿Por qué te vas?</Text>
                  <Text style={s.sheetSub}>Tu opinión nos ayuda a mejorar</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }}>
                <View style={s.motivosLista}>
                    {MOTIVOS.map(m => (
                    <TouchableOpacity key={m.key}
                        style={[s.motivoItem, motivoSel === m.key && s.motivoItemActive]}
                        onPress={() => setMotivoSel(m.key)}
                        activeOpacity={0.7}>
                        <Text style={[s.motivoLabel, motivoSel === m.key && s.motivoLabelActive]}>
                        {m.label}
                        </Text>
                        {motivoSel === m.key && (
                        <Ionicons name="checkmark-circle" size={20} color="#171B24" />
                        )}
                    </TouchableOpacity>
                    ))}
                </View>

                <View style={s.comentarioBox}>
                    <Text style={s.comentarioLabel}>¿Algo más que quieras compartir? (opcional)</Text>
                    <TextInput
                    style={s.comentarioInput}
                    placeholder="Cuéntanos más..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={3}
                    value={comentario}
                    onChangeText={setComentario}
                    />
                </View>
            </View>

              <View style={s.footer}>
                <TouchableOpacity
                  style={[s.btnSiguiente, !motivoSel && s.btnDisabled]}
                  disabled={!motivoSel}
                  onPress={() => setPaso('confirmacion')}
                  activeOpacity={0.85}>
                  <Text style={s.btnSiguienteText}>Continuar →</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnCancelar} onPress={handleClose}>
                  <Text style={s.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Paso confirmación ── */}
          {paso === 'confirmacion' && (
            <>
              <View style={s.sheetHeader}>
                <TouchableOpacity onPress={() => setPaso('motivos')} style={s.backBtn}>
                  <Ionicons name="chevron-back" size={20} color="#6b7280" />
                </TouchableOpacity>
                <View style={s.sheetHeaderTexto}>
                  <Text style={s.sheetTitulo}>¿Estás seguro?</Text>
                  <Text style={s.sheetSub}>Esta acción es permanente</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={s.confirmBox}>
                <View style={s.confirmIconBox}>
                  <Ionicons name="warning-outline" size={40} color="#ef4444" />
                </View>
                <Text style={s.confirmTitulo}>Se eliminarán permanentemente:</Text>
                <View style={s.confirmLista}>
                  {[
                    'Tu perfil y datos personales',
                    'Historial de reservas y asistencias',
                    'Tu membresía activa',
                    'Métodos de pago guardados',
                  ].map((item, i) => (
                    <View key={i} style={s.confirmItem}>
                      <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
                      <Text style={s.confirmItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <View style={s.confirmHint}>
                  <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
                  <Text style={s.confirmHintText}>
                    Los registros de pagos se conservan por obligaciones fiscales.
                  </Text>
                </View>
              </View>

              <View style={s.footer}>
                <TouchableOpacity
                  style={s.btnEliminar}
                  onPress={handleEliminar}
                  disabled={eliminando}
                  activeOpacity={0.85}>
                  <Ionicons name="trash-outline" size={16} color="#fff" />
                  <Text style={s.btnEliminarText}>Sí, eliminar mi cuenta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnCancelar} onPress={handleClose}>
                  <Text style={s.btnCancelarText}>No, conservar mi cuenta</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay:           { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:             { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48, height: '85%' },
  sheetHeader:       { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
  sheetHeaderTexto:  { flex: 1 },
  sheetTitulo:       { fontSize: 20, fontFamily: 'Gotham_700Bold', color: '#111' },
  sheetSub:          { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 2 },
  closeBtn:          { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backBtn:           { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  motivosLista:      { gap: 8, marginBottom: 20 },
  motivoItem:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#f9fafb', borderRadius: 14, borderWidth: 1.5, borderColor: '#f3f4f6' },
  motivoItemActive:  { backgroundColor: '#f0fdf4', borderColor: '#171B24' },
  motivoLabel:       { fontSize: 15, fontFamily: 'Gotham_400Regular', color: '#374151' },
  motivoLabelActive: { fontFamily: 'Gotham_700Bold', color: '#111' },
  comentarioBox:     { gap: 8 },
  comentarioLabel:   { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#374151' },
  comentarioInput:   { backgroundColor: '#f9fafb', borderRadius: 14, padding: 16, fontSize: 14, color: '#111', fontFamily: 'Gotham_400Regular', minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#f3f4f6' },
  footer:            { gap: 10, marginTop: 16 },
  btnSiguiente:      { backgroundColor: '#171B24', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  btnDisabled:       { backgroundColor: '#e5e7eb' },
  btnSiguienteText:  { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  btnCancelar:       { paddingVertical: 14, alignItems: 'center' },
  btnCancelarText:   { color: '#9ca3af', fontSize: 14, fontFamily: 'Gotham_400Regular' },
  confirmBox:        { flex: 1, gap: 16, paddingVertical: 8 },
  confirmIconBox:    { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  confirmTitulo:     { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
  confirmLista:      { gap: 10 },
  confirmItem:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  confirmItemText:   { fontSize: 14, color: '#6b7280', fontFamily: 'Gotham_400Regular' },
  confirmHint:       { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#f9fafb', borderRadius: 12, padding: 14 },
  confirmHintText:   { flex: 1, fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', lineHeight: 18 },
  btnEliminar:       { backgroundColor: '#ef4444', borderRadius: 16, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  btnEliminarText:   { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  eliminandoBox:     { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 16 },
  eliminandoText:    { fontSize: 18, fontFamily: 'Gotham_700Bold', color: '#111' },
  eliminandoSub:     { fontSize: 14, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
})