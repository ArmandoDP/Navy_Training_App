import { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons }      from '@expo/vector-icons'
import { supabase }      from '../../lib/supabase'

import StepDatos     from '../../components/crear-cuenta/StepDatos'
import StepTerminos  from '../../components/crear-cuenta/StepTerminos'
import StepSucursal  from '../../components/crear-cuenta/StepSucursal'
import StepOTP       from '../../components/crear-cuenta/StepOTP'

type Step = 1 | 2 | 3 | 4

const STEP_LABELS: Record<Step, string> = {
  1: 'Tus datos',
  2: 'Términos y condiciones',
  3: 'Tu sucursal',
  4: 'Verifica tu correo',
}

export default function CrearCuentaScreen() {
  const navigation = useNavigation<any>()
  const [step,    setStep]    = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [userId,  setUserId]  = useState<string | null>(null)
  const [otp,     setOtp]     = useState(['', '', '', '', '', ''])

  const [form, setForm] = useState({
    nombre:         '',
    telefono:       '',
    email:          '',
    terminos:       false,
    privacidad:     false,
    notificaciones: false,
    comunicaciones: false,
    sucursal_id:    '',
  })

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const canStep1 = !!(form.nombre && form.telefono && form.email)
  const canStep2 = form.terminos && form.privacidad
  const canStep3 = !!form.sucursal_id

  // ── Step 2 → 3: crear usuario y enviar OTP
  const handleEnviarOtp = async () => {
    setLoading(true)
    try {
      const { data: existe } = await supabase
        .from('clientes').select('id').eq('email', form.email).maybeSingle()

      if (existe) {
        Alert.alert('Correo en uso', 'Ya existe una cuenta con este correo. Intenta iniciar sesión.')
        setLoading(false)
        return
      }

      const { data: cli, error: cliErr } = await supabase.from('clientes').insert({
        nombre_completo:     form.nombre,
        email:               form.email,
        telefono:            form.telefono,
        sucursal_id:         form.sucursal_id,
        estatus:             'Activo',
        origen:              'App',
        acepto_terminos:     form.terminos,
        acepto_privacidad:   form.privacidad,
        fecha_alta_original: new Date().toISOString().split('T')[0],
        debe_cambiar_password: false,
      }).select().single()

      if (cliErr) throw new Error(cliErr.message)
      setUserId(cli.id)

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: form.email,
        options: { shouldCreateUser: true },
      })
      if (otpErr) throw new Error(otpErr.message)

      setStep(4)
    } catch (err: any) {
      Alert.alert('Error', err.message)
    }
    setLoading(false)
  }

  // ── Step 4: verificar OTP
  const handleVerificarOtp = async (code?: string) => {
    const token = code || otp.join('')
    if (token.length < 6) return
    setLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({
      email: form.email,
      token,
      type:  'email',
    })

    if (error || !data.user) {
      Alert.alert('Código incorrecto', 'El código es incorrecto o expiró. Intenta de nuevo.')
      setOtp(['', '', '', '', '', ''])
      setLoading(false)
      return
    }

    if (userId) {
      await supabase.from('clientes')
        .update({ supabase_user_id: data.user.id })
        .eq('id', userId)
    }

    setLoading(false)
  }

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (newOtp.every(d => d) && digit) handleVerificarOtp(newOtp.join(''))
  }

  const handleNext = () => {
    if (step === 1 && canStep1)  setStep(2)
    if (step === 2 && canStep2)  setStep(3)
    if (step === 3 && canStep3)  handleEnviarOtp()
  }

  const canNext = step === 1 ? canStep1 : step === 2 ? canStep2 : step === 3 ? canStep3 : otp.every(d => d)

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.container}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => step === 1 ? navigation.goBack() : setStep(p => (p - 1) as Step)}
            style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Crear cuenta</Text>
        </View>

        {/* Progress */}
        <View style={s.progressContainer}>
          {([1, 2, 3, 4] as Step[]).map(n => (
            <View key={n} style={[s.progressBar, n <= step && s.progressBarActive]} />
          ))}
        </View>
        <Text style={s.stepLabel}>{step}/4 · {STEP_LABELS[step]}</Text>

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {step === 1 && (
            <StepDatos
              form={{ nombre: form.nombre, telefono: form.telefono, email: form.email }}
              onChange={set}
            />
          )}

          {step === 2 && (
            <StepTerminos
              form={{ terminos: form.terminos, privacidad: form.privacidad, notificaciones: form.notificaciones, comunicaciones: form.comunicaciones }}
              onChange={set}
            />
          )}

          {step === 3 && (
            <StepSucursal onSelect={id => { set('sucursal_id', id); }} />
          )}

          {step === 4 && (
            <StepOTP
              email={form.email}
              otp={otp}
              loading={loading}
              onChange={handleOtpChange}
              onKeyDown={(i, key) => {
                if (key === 'Backspace' && !otp[i] && i > 0) {
                  const newOtp = [...otp]
                  newOtp[i - 1] = ''
                  setOtp(newOtp)
                }
              }}
            />
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          {step !== 4 ? (
            <TouchableOpacity
              style={[s.btn, (!canNext || loading) && s.btnDisabled]}
              disabled={!canNext || loading}
              onPress={handleNext}
              activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>
                    {step === 3 ? 'Enviar código →' : 'Continuar →'}
                  </Text>
              }
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.btn, (!canNext || loading) && s.btnDisabled]}
              disabled={!canNext || loading}
              onPress={() => handleVerificarOtp()}
              activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Verificar y entrar →</Text>
              }
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#fff' },
  header:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#171B24', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, gap: 12 },
  backBtn:           { padding: 4 },
  headerTitle:       { color: '#fff', fontSize: 18, fontFamily: 'Gotham_700Bold' },
  progressContainer: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 16 },
  progressBar:       { flex: 1, height: 3, backgroundColor: '#e5e7eb', borderRadius: 2 },
  progressBarActive: { backgroundColor: '#171B24' },
  stepLabel:         { paddingHorizontal: 20, paddingTop: 8, fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  scroll:            { flex: 1 },
  footer:            { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12, backgroundColor: '#fff' },
  btn:               { backgroundColor: '#171B24', borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  btnDisabled:       { backgroundColor: '#e5e7eb' },
  btnText:           { color: '#fff', fontSize: 17, fontFamily: 'Gotham_700Bold' },
})