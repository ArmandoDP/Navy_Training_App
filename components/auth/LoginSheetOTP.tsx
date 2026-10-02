import { useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  email:     string
  otp:       string[]
  loading:   boolean
  error:     string
  onChangeOtp: (index: number, value: string) => void
  onKeyDown:   (index: number, key: string) => void
  onVerificar: (code?: string) => void
  onReenviar:  () => void
  onClose:     () => void
  onCambiarCorreo: () => void
  inputsRef:   React.MutableRefObject<(TextInput | null)[]>
}

export default function LoginSheetOTP({ email, otp, loading, error, onChangeOtp, onKeyDown, onVerificar, onReenviar, onClose, onCambiarCorreo, inputsRef }: Props) {
  return (
    <>
      <View style={s.sheetHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.sheetTitulo}>Revisa tu correo</Text>
          <Text style={s.sheetSub} numberOfLines={2}>
            Enviamos un código a{'\n'}<Text style={{ color: '#111', fontFamily: 'Gotham_700Bold' }}>{email}</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={s.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={el => { inputsRef.current[i] = el }}
            style={[s.otpInput, digit ? s.otpInputFilled : null, error ? s.otpInputError : null]}
            value={digit}
            onChangeText={v => {
                const digits = v.replace(/\D/g, '')
                if (digits.length > 1) {
                    // Pegaron varios dígitos — distribuir
                    const arr = digits.slice(0, 6).split('')
                    const newOtp = ['', '', '', '', '', '']
                    arr.forEach((d, idx) => { newOtp[idx] = d })
                    arr.forEach((_, idx) => onChangeOtp(idx, arr[idx] || ''))
                    if (arr.length === 6) onVerificar(arr.join(''))
                    return
                }
                onChangeOtp(i, v)
            }}
            onKeyPress={({ nativeEvent }) => onKeyDown(i, nativeEvent.key)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
          />
        ))}
      </View>

      {error ? (
        <View style={[s.errorRow, { justifyContent: 'center', marginBottom: 12 }]}>
          <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : null}

      <Text style={s.otpExpira}>Válido por 10 minutos · Un solo uso</Text>

      <TouchableOpacity
        style={[s.btnLogin, (otp.some(d => !d) || loading) && s.btnDisabled]}
        disabled={otp.some(d => !d) || loading}
        onPress={() => onVerificar()}
        activeOpacity={0.85}>
        <Text style={s.btnLoginText}>{loading ? 'Verificando...' : 'Entrar →'}</Text>
      </TouchableOpacity>

      <View style={s.otpFooter}>
        <TouchableOpacity onPress={onCambiarCorreo}>
          <Text style={s.otpLink}>← Cambiar correo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onReenviar} disabled={loading}>
          <Text style={s.otpLink}>Reenviar código</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

const s = StyleSheet.create({
  sheetHeader:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  sheetTitulo:   { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111' },
  sheetSub:      { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 4, lineHeight: 20 },
  closeBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  otpRow:        { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 16 },
  otpInput:      { width: 46, height: 56, borderRadius: 14, backgroundColor: '#f3f4f6', borderWidth: 2, borderColor: '#e5e7eb', fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  otpInputFilled:{ backgroundColor: '#171B24', borderColor: '#171B24', color: '#fff' },
  otpInputError: { borderColor: '#fca5a5', backgroundColor: '#fff5f5' },
  otpExpira:     { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', marginBottom: 16 },
  errorRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText:     { fontSize: 13, color: '#ef4444', fontFamily: 'Gotham_400Regular' },
  btnLogin:      { backgroundColor: '#000', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  btnDisabled:   { backgroundColor: '#e5e7eb' },
  btnLoginText:  { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  otpFooter:     { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 8 },
  otpLink:       { fontSize: 13, color: '#6b7280', fontFamily: 'Gotham_700Bold' },
})