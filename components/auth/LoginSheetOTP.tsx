import { useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  email:           string
  otp:             string[]
  loading:         boolean
  error:           string
  onChangeOtp:     (index: number, value: string) => void
  onKeyDown:       (index: number, key: string) => void
  onVerificar:     (code?: string) => void
  onReenviar:      () => void
  onClose:         () => void
  onCambiarCorreo: () => void
  onPaste:         (newOtp: string[]) => void
  inputsRef:       React.MutableRefObject<(TextInput | null)[]>
}

export default function LoginSheetOTP({ email, otp, loading, error, onChangeOtp, onVerificar, onReenviar, onClose, onCambiarCorreo, onPaste, inputsRef }: Props) {
  const hiddenRef = useRef<TextInput>(null)
  const hiddenValue = useRef('')

  const handleHiddenChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 6)
    hiddenValue.current = digits
    const arr = digits.split('')
    const newOtp = ['', '', '', '', '', '']
    arr.forEach((d, i) => { newOtp[i] = d })
    onPaste(newOtp)
    if (digits.length === 6) {
      onVerificar(digits)
    }
  }

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

      {/* Input invisible que captura el texto */}
      <TextInput
        ref={hiddenRef}
        style={s.hiddenInput}
        value={otp.join('')}
        onChangeText={handleHiddenChange}
        keyboardType="numeric"
        maxLength={6}
        autoFocus={false}
        caretHidden
      />

      {/* Cajas visuales */}
      <TouchableOpacity activeOpacity={1} onPress={() => hiddenRef.current?.focus()}>
        <View style={s.otpRow}>
          {otp.map((digit, i) => (
            <View
              key={i}
              style={[
                s.otpBox,
                digit ? s.otpBoxFilled : null,
                error ? s.otpBoxError : null,
              ]}>
              <Text style={[s.otpDigit, digit ? s.otpDigitFilled : null]}>
                {digit || ''}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

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
  hiddenInput:   { position: 'absolute', opacity: 0, width: 1, height: 1 },
  otpRow:        { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 16 },
  otpBox:        { width: 46, height: 56, borderRadius: 14, backgroundColor: '#f3f4f6', borderWidth: 2, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  otpBoxFilled:  { backgroundColor: '#171B24', borderColor: '#171B24' },
  otpBoxError:   { borderColor: '#fca5a5', backgroundColor: '#fff5f5' },
  otpDigit:      { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111' },
  otpDigitFilled:{ color: '#fff' },
  otpExpira:     { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', marginBottom: 16 },
  errorRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText:     { fontSize: 13, color: '#ef4444', fontFamily: 'Gotham_400Regular' },
  btnLogin:      { backgroundColor: '#000', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  btnDisabled:   { backgroundColor: '#e5e7eb' },
  btnLoginText:  { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  otpFooter:     { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 8 },
  otpLink:       { fontSize: 13, color: '#6b7280', fontFamily: 'Gotham_700Bold' },
})