import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
  ScrollView
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons }      from '@expo/vector-icons'
import { supabase }      from '../../lib/supabase'
import LogoNavy          from '../../assets/images/logo-navy.svg'

type Vista = 'form' | 'enviado'

export default function RecuperarPasswordScreen() {
  const navigation = useNavigation<any>()
  const [email,    setEmail]   = useState('')
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState('')
  const [vista,    setVista]   = useState<Vista>('form')

  const handleEnviar = async () => {
    if (!email.trim()) { setError('Ingresa tu correo'); return }
    setLoading(true)
    setError('')

    // ← Verificar que el correo existe en la tabla clientes
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (!cliente) {
      setLoading(false)
      setError('No encontramos una cuenta Navy con ese correo')
      return
    }

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'navyapp://auth/nueva-password',
    })
    setLoading(false)
    if (err) { setError('Error al enviar el correo. Intenta de nuevo.'); return }
    setVista('enviado')
  }

  // ── Vista enviado ──────────────────────────────────────────
  if (vista === 'enviado') return (
    <View style={s.fullDark}>
      <LogoNavy width={120} height={40} fill="#fff" style={{ marginBottom: 48 }} />

      <View style={s.bigIconBox}>
        <Ionicons name="mail-outline" size={52} color="#fff" />
      </View>

      <Text style={s.darkTitulo}>Revisa tu correo</Text>
      <Text style={s.darkSub}>
        Te enviamos un enlace para crear{'\n'}una nueva contraseña a
      </Text>
      <Text style={s.darkEmail}>{email}</Text>

      <View style={s.hintBox}>
        <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
        <Text style={s.hintText}>El enlace expira en 24 horas</Text>
      </View>

      <View style={s.darkFooter}>
        <TouchableOpacity style={s.btnBlanco} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
          <Text style={s.btnBlancoText}>Volver al login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnGhost} onPress={() => setVista('form')}>
          <Text style={s.btnGhostText}>¿No llegó? Reenviar correo</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  // ── Vista formulario ───────────────────────────────────────
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.container}>

        <View style={s.topRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={25} color="#fff" />
            </TouchableOpacity>
            <LogoNavy width={140} height={46} fill="#fff" />
            <View style={{ width: 36 }} />
        </View>
        {/* Parte oscura — flexible */}
        <ScrollView
            style={{ backgroundColor: '#000' }}  // ← sin flex: 1
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <View style={s.darkSection}>
            <View style={s.heroContent}>
                <View style={s.bigIconBox}>
                <Ionicons name="lock-open-outline" size={52} color="#fff" />
                </View>
                <Text style={s.heroTitulo}>¿Olvidaste tu{'\n'}contraseña?</Text>
                <Text style={s.heroSub}>
                Ingresa el email con el que iniciaste sesión y te enviaremos instrucciones para crear una nueva.
                </Text>
            </View>
            </View>

            {/* Parte blanca — solo input y botones */}
            <View style={s.lightSection}>
            <Text style={s.cardLabel}>Correo electrónico</Text>
            <View style={[s.inputContainer, error ? s.inputError : null]}>
                <Ionicons name="mail-outline" size={18} color="#9ca3af" />
                <TextInput
                style={s.input}
                placeholder="nombre@email.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={t => { setEmail(t); setError('') }}
                />
            </View>
            {error ? (
                <View style={s.errorRow}>
                <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
                <Text style={s.errorText}>{error}</Text>
                </View>
            ) : null}

            <TouchableOpacity
                style={[s.btnEnviar, (!email.trim() || loading) && s.btnDisabled]}
                disabled={!email.trim() || loading}
                onPress={handleEnviar}
                activeOpacity={0.85}>
                <Text style={s.btnEnviarText}>
                {loading ? 'Enviando...' : 'Enviar instrucciones →'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.btnVolver} onPress={() => navigation.navigate('Login')}>
                <Ionicons name="chevron-back" size={14} color="#9ca3af" />
                <Text style={s.btnVolverText}>Volver al login</Text>
            </TouchableOpacity>
            </View>

        </ScrollView>
        </View>
    </KeyboardAvoidingView>
    )
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#000' },

  // Sección oscura
  darkSection: { backgroundColor: '#000', paddingHorizontal: 24, paddingVertical: 32, flex: 1, justifyContent: 'center' },
  topRow:      { backgroundColor: '#000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 65, paddingBottom: 16, paddingHorizontal: 24 },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  heroContent:  { gap: 20, alignItems: 'flex-start' }, // ← alineado a la izquierda
  bigIconBox:     { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  heroTitulo:   { fontSize: 38, fontFamily: 'Gotham_700Bold', color: '#fff', lineHeight: 46, textAlign: 'left' },
  heroSub:      { fontSize: 15, color: '#6b7280', fontFamily: 'Gotham_400Regular', lineHeight: 24, textAlign: 'left' },

  // Sección blanca
  lightSection: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40, gap: 14 },
  cardLabel:      { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#374151' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 16, borderWidth: 1.5, borderColor: '#f3f4f6', paddingHorizontal: 16, gap: 10 },
  inputError:     { borderColor: '#ef4444' },
  input:          { flex: 1, paddingVertical: 16, fontSize: 15, color: '#111', fontFamily: 'Gotham_400Regular' },
  errorRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -4 },
  errorText:      { fontSize: 13, color: '#ef4444', fontFamily: 'Gotham_400Regular' },
  btnEnviar:      { backgroundColor: '#000', borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  btnDisabled:    { backgroundColor: '#e5e7eb' },
  btnEnviarText:  { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  btnVolver:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 4 },
  btnVolverText:  { color: '#9ca3af', fontSize: 14, fontFamily: 'Gotham_400Regular' },

  // Pantalla éxito full dark
  fullDark:       { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16, paddingTop: 60 },
  darkTitulo:     { color: '#fff', fontSize: 28, fontFamily: 'Gotham_700Bold', textAlign: 'center' },
  darkSub:        { color: '#6b7280', fontSize: 15, fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 24 },
  darkEmail:      { color: '#fff', fontSize: 15, fontFamily: 'Gotham_700Bold', textAlign: 'center' },
  hintBox:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  hintText:       { color: '#6b7280', fontSize: 13, fontFamily: 'Gotham_400Regular' },
  darkFooter:     { width: '100%', gap: 12, marginTop: 16 },
  btnBlanco:      { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, width: '100%', alignItems: 'center' },
  btnBlancoText:  { color: '#111', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  btnGhost:       { paddingVertical: 12, width: '100%', alignItems: 'center' },
  btnGhostText:   { color: '#6b7280', fontSize: 14, fontFamily: 'Gotham_400Regular' },
})