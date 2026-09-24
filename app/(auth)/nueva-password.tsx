import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons }      from '@expo/vector-icons'
import { supabase }      from '../../lib/supabase'
import LogoNavy          from '../../assets/images/logo-navy.svg'
import ModalTerminos     from '../../components/auth/ModalTerminos'

type Vista = 'form' | 'exitoso'

interface Props {
  clienteId?:   string | null
  primerAcceso?: boolean
  onTerminado?: () => void
}

export default function NuevaPasswordScreen({ clienteId: clienteIdProp, primerAcceso: primerAccesoProp, onTerminado }: Props) {
  const navigation      = useNavigation<any>()
  const route        = useRoute<any>()
  const primerAcceso = primerAccesoProp !== undefined ? primerAccesoProp : (route.params?.primerAcceso || false)
  const clienteId    = clienteIdProp    !== null      ? clienteIdProp    : (route.params?.clienteId   || null)
  const [password,      setPassword]      = useState('')
  const [confirmar,     setConfirmar]     = useState('')
  const [showPass,      setShowPass]      = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [vista,         setVista]         = useState<Vista>('form')
  const [modalTerminos, setModalTerminos] = useState(false)

  const validar = () => {
    if (password.length < 8)            return 'Mínimo 8 caracteres'
    if (!/[A-Z]/.test(password))        return 'Debe incluir al menos una mayúscula'
    if (!/[0-9]/.test(password))        return 'Debe incluir al menos un número'
    if (!/[^A-Za-z0-9]/.test(password)) return 'Debe incluir al menos un símbolo'
    if (password !== confirmar)          return 'Las contraseñas no coinciden'
    return ''
  }

  const handleGuardar = async () => {
    const err = validar()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')

    const { error: updateErr } = await supabase.auth.updateUser({ password })
    if (updateErr) { setError('Error al actualizar. Intenta de nuevo.'); setLoading(false); return }

    // Obtener cliente de la sesión activa
    const { data: { session } } = await supabase.auth.getSession()
    const { data: cli } = await supabase
      .from('clientes')
      .select('id, acepto_terminos')
      .eq('email', session?.user?.email || '')
      .single()

    if (cli) {
      await supabase.from('clientes')
        .update({ debe_cambiar_password: false })
        .eq('id', cli.id)

      setLoading(false)

      if (!cli.acepto_terminos) {
        setModalTerminos(true)
      } else {
        onTerminado?.()
        setVista('exitoso')
      }
    } else {
      setLoading(false)
      setVista('exitoso')
    }
  }

  // ── Pantalla éxito ─────────────────────────────────────────
  if (vista === 'exitoso') return (
    <View style={s.fullDark}>
      <LogoNavy width={110} height={40} fill="#fff" style={{ marginBottom: 48 }} />
      <View style={s.bigIconBox}>
        <Ionicons name="checkmark" size={52} color="#22c55e" />
      </View>
      <Text style={s.darkTitulo}>¡Contraseña{'\n'}actualizada!</Text>
      <Text style={s.darkSub}>
        Ahora puedes iniciar sesión{'\n'}con tu nueva contraseña.
      </Text>
      <View style={s.darkFooter}>
        <TouchableOpacity style={s.btnBlanco} onPress={async () => {
          await supabase.auth.signOut()
        }} activeOpacity={0.85}>
          <Text style={s.btnBlancoText}>Ir al login →</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  // ── Formulario ─────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.container}>

        <View style={s.topRow}>
          <View style={{ width: 36 }} />
          <LogoNavy width={100} height={36} fill="#fff" />
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={{ backgroundColor: '#000' }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={s.darkSection}>
            <View style={s.heroContent}>
              <View style={s.bigIconBox}>
                <Ionicons name="key-outline" size={52} color="#fff" />
              </View>
              <Text style={s.heroTitulo}>
                {primerAcceso ? `Crea tu\ncontraseña` : `Crea una nueva\ncontraseña`}
              </Text>
              <Text style={s.heroSub}>
                {primerAcceso
                  ? 'Por seguridad, crea una contraseña personal para tu cuenta.'
                  : 'Mínimo 8 caracteres. Debe incluir al menos una mayúscula, un número y un símbolo.'
                }
              </Text>
            </View>
          </View>

          <View style={s.lightSection}>
            <Text style={s.cardLabel}>Nueva contraseña</Text>
            <View style={[s.inputContainer, error ? s.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={t => { setPassword(t); setError('') }}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <Text style={s.cardLabel}>Confirmar contraseña</Text>
            <View style={[s.inputContainer, error ? s.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirmar}
                value={confirmar}
                onChangeText={t => { setConfirmar(t); setError('') }}
              />
              <TouchableOpacity onPress={() => setShowConfirmar(!showConfirmar)}>
                <Ionicons name={showConfirmar ? 'eye-outline' : 'eye-off-outline'} size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={s.indicadores}>
              {[
                { texto: 'Mínimo 8 caracteres',   ok: password.length >= 8 },
                { texto: 'Al menos una mayúscula', ok: /[A-Z]/.test(password) },
                { texto: 'Al menos un número',     ok: /[0-9]/.test(password) },
                { texto: 'Al menos un símbolo',    ok: /[^A-Za-z0-9]/.test(password) },
                { texto: 'Contraseñas coinciden',  ok: password === confirmar && confirmar.length > 0 },
              ].map((ind, i) => (
                <View key={i} style={s.indRow}>
                  <Ionicons
                    name={ind.ok ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={ind.ok ? '#22c55e' : '#d1d5db'}
                  />
                  <Text style={[s.indTexto, ind.ok && s.indTextoOk]}>{ind.texto}</Text>
                </View>
              ))}
            </View>

            {error ? (
              <View style={s.errorRow}>
                <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[s.btnEnviar, (!password || !confirmar || loading) && s.btnDisabled]}
              disabled={!password || !confirmar || loading}
              onPress={handleGuardar}
              activeOpacity={0.85}>
              <Text style={s.btnEnviarText}>
                {loading ? 'Guardando...' : primerAcceso ? 'Continuar →' : 'Cambiar contraseña →'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Modal términos primer acceso */}
      <ModalTerminos
        visible={modalTerminos}
        onAceptar={async () => {
          if (clienteId) {
            await supabase.from('clientes').update({
              acepto_terminos:   true,
              acepto_privacidad: true,
            }).eq('id', clienteId)
          }
          setModalTerminos(false)
          onTerminado?.()
        }}
        onRechazar={async () => {
          setModalTerminos(false)
          await supabase.auth.signOut()
          navigation.navigate('Welcome')
        }}
      />
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#000' },
  topRow:         { backgroundColor: '#000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 24 },
  darkSection:    { backgroundColor: '#000', paddingHorizontal: 24, paddingVertical: 32, flex: 1, justifyContent: 'center' },
  heroContent:    { gap: 20, alignItems: 'flex-start' },
  bigIconBox:     { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  heroTitulo:     { fontSize: 38, fontFamily: 'Gotham_700Bold', color: '#fff', lineHeight: 46, textAlign: 'left' },
  heroSub:        { fontSize: 15, color: '#6b7280', fontFamily: 'Gotham_400Regular', lineHeight: 24, textAlign: 'left' },
  lightSection:   { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48, gap: 14 },
  cardLabel:      { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#374151' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 16, borderWidth: 1.5, borderColor: '#f3f4f6', paddingHorizontal: 16, gap: 10 },
  inputError:     { borderColor: '#ef4444' },
  input:          { flex: 1, paddingVertical: 16, fontSize: 15, color: '#111', fontFamily: 'Gotham_400Regular' },
  indicadores:    { gap: 6 },
  indRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  indTexto:       { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  indTextoOk:     { color: '#22c55e' },
  errorRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText:      { fontSize: 13, color: '#ef4444', fontFamily: 'Gotham_400Regular' },
  btnEnviar:      { backgroundColor: '#000', borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  btnDisabled:    { backgroundColor: '#e5e7eb' },
  btnEnviarText:  { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  fullDark:       { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  darkTitulo:     { color: '#fff', fontSize: 32, fontFamily: 'Gotham_700Bold', textAlign: 'center', lineHeight: 40 },
  darkSub:        { color: '#6b7280', fontSize: 15, fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 24 },
  darkFooter:     { width: '100%', gap: 12, marginTop: 16 },
  btnBlanco:      { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, width: '100%', alignItems: 'center' },
  btnBlancoText:  { color: '#111', fontSize: 16, fontFamily: 'Gotham_700Bold' },
})