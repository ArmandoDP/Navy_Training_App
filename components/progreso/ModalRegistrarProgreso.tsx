import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'

interface Props {
  visible:   boolean
  clienteId: string
  onClose:   () => void
  onSuccess: () => void
}

export default function ModalRegistrarProgreso({ visible, clienteId, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    peso_kg:     '',
    grasa_pct:   '',
    musculo_pct: '',
    calorias:    '',
    notas:       '',
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleGuardar = async () => {
    if (!form.peso_kg && !form.grasa_pct && !form.musculo_pct && !form.calorias) return
    setLoading(true)
    try {
      await supabase.from('progreso_fisico').insert({
        cliente_id:  clienteId,
        fecha:       new Date().toISOString().split('T')[0],
        peso_kg:     form.peso_kg     ? Number(form.peso_kg)     : null,
        grasa_pct:   form.grasa_pct   ? Number(form.grasa_pct)   : null,
        musculo_pct: form.musculo_pct ? Number(form.musculo_pct) : null,
        calorias:    form.calorias    ? Number(form.calorias)    : null,
        notas:       form.notas || null,
      })
      setForm({ peso_kg: '', grasa_pct: '', musculo_pct: '', calorias: '', notas: '' })
      onSuccess()
      onClose()
    } catch(e) {
      console.log('Error guardando progreso:', e)
    }
    setLoading(false)
  }

  const CAMPOS = [
    { key: 'peso_kg',     label: 'Peso',           unit: 'kg',   icon: 'scale-outline',   color: '#6366f1', decimal: true },
    { key: 'grasa_pct',   label: '% Grasa corporal',unit: '%',   icon: 'water-outline',   color: '#f59e0b', decimal: true },
    { key: 'musculo_pct', label: '% Músculo',       unit: '%',   icon: 'fitness-outline', color: '#22c55e', decimal: true },
    { key: 'calorias',    label: 'Calorías diarias', unit: 'kcal',icon: 'flame-outline',   color: '#ef4444', decimal: false },
  ]

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle} />

            <View style={s.header}>
              <View style={s.headerIcon}>
                <Ionicons name="body-outline" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.titulo}>Registrar medidas</Text>
                <Text style={s.sub}>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <View style={s.campos}>
                {CAMPOS.map(c => (
                  <View key={c.key} style={s.campo}>
                    <View style={[s.campoIcon, { backgroundColor: `${c.color}15` }]}>
                      <Ionicons name={c.icon as any} size={18} color={c.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.campoLabel}>{c.label}</Text>
                      <TextInput
                        style={s.campoInput}
                        value={(form as any)[c.key]}
                        onChangeText={v => set(c.key, v)}
                        placeholder={`Ej: ${c.key === 'peso_kg' ? '72.5' : c.key === 'calorias' ? '2000' : '18.5'}`}
                        placeholderTextColor="#d1d5db"
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <Text style={s.campoUnit}>{c.unit}</Text>
                  </View>
                ))}

                <View style={s.notasWrap}>
                  <Text style={s.campoLabel}>Notas (opcional)</Text>
                  <TextInput
                    style={s.notasInput}
                    value={form.notas}
                    onChangeText={v => set('notas', v)}
                    placeholder="Cómo te sientes hoy, observaciones..."
                    placeholderTextColor="#d1d5db"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[s.btnGuardar, loading && s.btnDisabled]}
              onPress={handleGuardar}
              disabled={loading}
              activeOpacity={0.85}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={s.btnGuardarText}>{loading ? 'Guardando...' : 'Guardar registro'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay:      { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle:       { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  headerIcon:   { width: 44, height: 44, borderRadius: 22, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center' },
  titulo:       { fontSize: 18, fontFamily: 'Gotham_700Bold', color: '#0f172a' },
  sub:          { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 2 },
  closeBtn:     { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  campos:       { gap: 12 },
  campo:        { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc', borderRadius: 14, padding: 14 },
  campoIcon:    { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  campoLabel:   { fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_700Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  campoInput:   { fontSize: 18, fontFamily: 'Gotham_700Bold', color: '#171B24', padding: 0 },
  campoUnit:    { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  notasWrap:    { gap: 8 },
  notasInput:   { backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, fontSize: 14, color: '#374151', fontFamily: 'Gotham_400Regular', minHeight: 80, textAlignVertical: 'top' },
  btnGuardar:   { backgroundColor: '#171B24', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  btnDisabled:  { backgroundColor: '#e5e7eb' },
  btnGuardarText:{ color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
})