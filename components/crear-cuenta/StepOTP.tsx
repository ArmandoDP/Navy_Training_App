import { useRef } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { supabase } from '../../lib/supabase'

interface Props {
  email:    string
  otp:      string[]
  loading:  boolean
  onChange: (index: number, value: string) => void
  onKeyDown:(index: number, key: string) => void
}

export default function StepOTP({ email, otp, loading, onChange, onKeyDown }: Props) {
  const inputsRef = useRef<(TextInput | null)[]>([])

  return (
    <View style={s.container}>
      <View style={s.hero}>
        <View style={s.iconBox}>
          <Text style={{ fontSize: 32 }}>✉️</Text>
        </View>
        <Text style={s.titulo}>Revisa tu correo</Text>
        <Text style={s.sub}>
          Enviamos un código de 6 dígitos a{'\n'}
          <Text style={s.email}>{email}</Text>
        </Text>
      </View>

      <View style={s.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={el => { inputsRef.current[i] = el }}
            style={[s.otpInput, digit ? s.otpInputFilled : null]}
            value={digit}
            onChangeText={v => {
              onChange(i, v)
              const clean = v.replace(/\D/g, '').slice(-1)
              if (clean && i < 5) inputsRef.current[i + 1]?.focus()
            }}
            onKeyPress={({ nativeEvent }) => {
              onKeyDown(i, nativeEvent.key)
              if (nativeEvent.key === 'Backspace' && !otp[i] && i > 0) {
                inputsRef.current[i - 1]?.focus()
              }
            }}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
          />
        ))}
      </View>

      <Text style={s.expira}>Válido por 10 minutos · Un solo uso</Text>

      <TouchableOpacity
        onPress={() => supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })}>
        <Text style={s.reenviar}>¿No llegó? Reenviar código</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container:    { paddingHorizontal: 20, paddingTop: 24, gap: 24 },
  hero:         { alignItems: 'center', gap: 12, paddingVertical: 12 },
  iconBox:      { width: 72, height: 72, borderRadius: 24, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  titulo:       { fontSize: 26, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  sub:          { fontSize: 14, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 22 },
  email:        { color: '#111', fontFamily: 'Gotham_700Bold' },
  otpRow:       { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  otpInput:     { width: 48, height: 58, borderRadius: 14, backgroundColor: '#f3f4f6', borderWidth: 2, borderColor: '#e5e7eb', fontSize: 24, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  otpInputFilled:{ backgroundColor: '#171B24', borderColor: '#171B24', color: '#fff' },
  expira:       { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center' },
  reenviar:     { fontSize: 13, color: '#6b7280', fontFamily: 'Gotham_700Bold', textAlign: 'center', textDecorationLine: 'underline' },
})