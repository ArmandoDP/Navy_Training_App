import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  email:        string
  loading:      boolean
  error:        string
  bioActivada:  boolean
  bioDisponible:boolean
  bioTipo:      string
  onChangeEmail:(v: string) => void
  onEnviar:     () => void
  onClose:      () => void
  onLoginBio:   () => void
}

export default function LoginSheetCorreo({ email, loading, error, bioActivada, bioDisponible, bioTipo, onChangeEmail, onEnviar, onClose, onLoginBio }: Props) {
  return (
    <>
      <View style={s.sheetHeader}>
        <View>
          <Text style={s.sheetTitulo}>Bienvenido de vuelta</Text>
          <Text style={s.sheetSub}>Ingresa tu correo para recibir un código</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={s.inputs}>
        <View style={[s.inputWrapper, error ? s.inputWrapperError : null]}>
          <Ionicons name="mail-outline" size={18} color="#9ca3af" />
          <TextInput
            style={s.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={onEnviar}
            value={email}
            onChangeText={onChangeEmail}
          />
        </View>
        {error ? (
          <View style={s.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={[s.btnLogin, (!email || loading) && s.btnDisabled]}
        disabled={!email || loading}
        onPress={onEnviar}
        activeOpacity={0.85}>
        <Text style={s.btnLoginText}>{loading ? 'Enviando código...' : 'Enviar código →'}</Text>
      </TouchableOpacity>

      {bioActivada && bioDisponible && (
        <TouchableOpacity style={s.btnBioSheet} onPress={onLoginBio} activeOpacity={0.85}>
          <Ionicons name={bioTipo === 'Face ID' ? 'scan-outline' : 'finger-print-outline'} size={20} color="#171B24" />
          <Text style={s.btnBioSheetText}>Entrar con {bioTipo}</Text>
        </TouchableOpacity>
      )}
    </>
  )
}

const s = StyleSheet.create({
  sheetHeader:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  sheetTitulo:      { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111' },
  sheetSub:         { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 4, lineHeight: 20 },
  closeBtn:         { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  inputs:           { gap: 12, marginBottom: 20 },
  inputWrapper:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 16, borderWidth: 1.5, borderColor: '#f3f4f6', paddingHorizontal: 16, gap: 10 },
  inputWrapperError:{ borderColor: '#fca5a5', backgroundColor: '#fff5f5' },
  input:            { flex: 1, paddingVertical: 16, fontSize: 15, color: '#111', fontFamily: 'Gotham_400Regular' },
  errorRow:         { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText:        { fontSize: 13, color: '#ef4444', fontFamily: 'Gotham_400Regular' },
  btnLogin:         { backgroundColor: '#000', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  btnDisabled:      { backgroundColor: '#e5e7eb' },
  btnLoginText:     { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  btnBioSheet:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#f9fafb', borderRadius: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: '#f3f4f6', marginBottom: 12 },
  btnBioSheetText:  { color: '#171B24', fontSize: 15, fontFamily: 'Gotham_700Bold' },
})