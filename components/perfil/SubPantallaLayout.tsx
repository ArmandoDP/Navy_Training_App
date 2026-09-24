import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  titulo:    string
  subtitulo?: string
  onBack:    () => void
  children:  React.ReactNode
  onGuardar?: () => void
  guardando?: boolean
  footerExtra?: React.ReactNode
}

export default function SubPantallaLayout({ titulo, subtitulo, onBack, children, onGuardar, guardando, footerExtra }: Props) {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.container}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={s.titulo}>{titulo}</Text>
            {subtitulo && <Text style={s.subtitulo}>{subtitulo}</Text>}
          </View>
        </View>

        {/* Contenido */}
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 120 }}>
          {children}
        </ScrollView>

        {/* Footer */}
        {(onGuardar || footerExtra) && (
          <View style={s.footer}>
            {onGuardar && (
              <TouchableOpacity style={s.btnGuardar} onPress={onGuardar} disabled={guardando} activeOpacity={0.85}>
                <Text style={s.btnGuardarText}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Text>
              </TouchableOpacity>
            )}
            {footerExtra}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f9fafb' },
  header:       { backgroundColor: '#171B24', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:      { padding: 4 },
  titulo:       { color: '#fff', fontSize: 20, fontFamily: 'Gotham_700Bold' },
  subtitulo:    { color: '#9ca3af', fontSize: 11, fontFamily: 'Gotham_700Bold', letterSpacing: 2, marginTop: 2 },
  scroll:       { flex: 1 },
  footer:       { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32, backgroundColor: '#f9fafb', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  btnGuardar:   { backgroundColor: '#171B24', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  btnGuardarText:{ color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
})