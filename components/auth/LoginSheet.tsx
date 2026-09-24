import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Platform, KeyboardAvoidingView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  visible:       boolean
  email:         string
  password:      string
  showPass:      boolean
  loading:       boolean
  error:         string
  bioActivada:   boolean
  bioDisponible: boolean
  bioTipo:       string
  sheetY:        Animated.Value
  onEmail:       (v: string) => void
  onPassword:    (v: string) => void
  onShowPass:    () => void
  onLogin:       () => void
  onLoginBio:    () => void
  onClose:       () => void
  onRecuperar:   () => void
}

export default function LoginSheet({
  visible, email, password, showPass, loading, error,
  bioActivada, bioDisponible, bioTipo, sheetY,
  onEmail, onPassword, onShowPass, onLogin, onLoginBio,
  onClose, onRecuperar,
}: Props) {
  if (!visible) return null

  return (
    <Animated.View style={[s.wrapper, { transform: [{ translateY: sheetY }] }]}>
      <TouchableOpacity style={s.backdrop} onPress={onClose} activeOpacity={1} />
      <View style={s.sheet}>
        <View style={s.handle} />

        <View style={s.header}>
          <View>
            <Text style={s.titulo}>Bienvenido de vuelta</Text>
            <Text style={s.sub}>Inicia sesión en tu cuenta</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Ionicons name="close" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={s.inputs}>
          <View style={s.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#9ca3af" />
            <TextInput
              style={s.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              value={email}
              onChangeText={onEmail}
            />
          </View>

          <View style={s.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Contraseña"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={onLogin}
              value={password}
              onChangeText={onPassword}
            />
            <TouchableOpacity onPress={onShowPass}>
              <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={s.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[s.btnLogin, (!email || !password || loading) && s.btnDisabled]}
          disabled={!email || !password || loading}
          onPress={onLogin}
          activeOpacity={0.85}>
          <Text style={s.btnLoginText}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión →'}
          </Text>
        </TouchableOpacity>

        {bioActivada && bioDisponible && (
          <TouchableOpacity style={s.btnBio} onPress={onLoginBio} activeOpacity={0.85}>
            <Ionicons
              name={bioTipo === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
              size={20} color="#171B24" />
            <Text style={s.btnBioText}>Entrar con {bioTipo}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.btnRecuperar} onPress={onRecuperar}>
          <Text style={s.btnRecuperarText}>
            ¿No recuerdas tu contraseña?{' '}
            <Text style={{ fontFamily: 'Gotham_700Bold', color: '#111' }}>Recupérala</Text>
          </Text>
        </TouchableOpacity>

        <View style={{ height: Platform.OS === 'ios' ? 34 : 20 }} />
      </View>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12 },
  handle:       { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  titulo:       { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111' },
  sub:          { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 4 },
  closeBtn:     { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  inputs:       { gap: 12, marginBottom: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 16, borderWidth: 1.5, borderColor: '#f3f4f6', paddingHorizontal: 16, gap: 10 },
  input:        { paddingVertical: 16, fontSize: 15, color: '#111', fontFamily: 'Gotham_400Regular' },
  errorRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText:    { fontSize: 13, color: '#ef4444', fontFamily: 'Gotham_400Regular' },
  btnLogin:     { backgroundColor: '#000', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  btnDisabled:  { backgroundColor: '#e5e7eb' },
  btnLoginText: { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  btnBio:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#f9fafb', borderRadius: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: '#f3f4f6', marginBottom: 12 },
  btnBioText:   { color: '#171B24', fontSize: 15, fontFamily: 'Gotham_700Bold' },
  btnRecuperar: { alignItems: 'center', paddingVertical: 8 },
  btnRecuperarText: { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
})