import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, Dimensions, Animated,
  Platform, Modal, ScrollView, KeyboardAvoidingView, TextInput
} from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { supabase } from '../../lib/supabase'
import { biometriaDisponible, tipoBiometria, autenticarBiometria } from '../../lib/biometrics'
import ModalTerminos from '../../components/auth/ModalTerminos'
import WelcomeHero from '../../components/auth/WelcomeHero'
import LoginSheetCorreo from '../../components/auth/LoginSheetCorreo'
import LoginSheetOTP from '../../components/auth/LoginSheetOTP'

const { height } = Dimensions.get('window')
type PasoLogin = 'correo' | 'otp'

export default function WelcomeScreen() {
  const navigation = useNavigation<any>()

  const [email,        setEmail]        = useState('')
  const [otp,          setOtp]          = useState(['', '', '', '', '', ''])
  const [pasoLogin,    setPasoLogin]    = useState<PasoLogin>('correo')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [showLogin,    setShowLogin]    = useState(false)
  const [bioDisponible, setBioDisponible] = useState(false)
  const [bioActivada,   setBioActivada]   = useState(false)
  const [bioTipo,       setBioTipo]       = useState('Biometría')
  const [clienteId,    setClienteId]    = useState<string | null>(null)
  const [modalTerminos, setModalTerminos] = useState(false)

  const inputsRef = useRef<(TextInput | null)[]>([])
  const contentY  = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  useFocusEffect(
    useCallback(() => {
      const check = async () => {
        try {
          const disponible = await biometriaDisponible()
          setBioDisponible(disponible)
          if (!disponible) return
          const { data: { session } } = await supabase.auth.getSession()
          const emailGuardado = await SecureStore.getItemAsync('navy_last_email')
          const emailCheck = session?.user?.email || emailGuardado
          if (!emailCheck) { setBioActivada(false); return }
          const { data: cli } = await supabase.from('clientes')
            .select('bio_activada').eq('email', emailCheck).single()
          setBioActivada(cli?.bio_activada || false)
          tipoBiometria().then(setBioTipo)
        } catch(e: any) {
          console.log('ERROR check bio:', e.message)
        }
      }
      check()
    }, [])
  )

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 8000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1,    duration: 8000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const openSheet = () => {
    setPasoLogin('correo')
    setOtp(['', '', '', '', '', ''])
    setError('')
    setShowLogin(true)
    Animated.spring(contentY, { toValue: -height * 0.2, useNativeDriver: true, tension: 60, friction: 12 }).start()
  }

  const closeSheet = () => {
    Animated.spring(contentY, { toValue: 0, useNativeDriver: true, tension: 60, friction: 12 })
      .start(() => { setShowLogin(false); setPasoLogin('correo'); setOtp(['', '', '', '', '', '']) })
  }

  const handleEnviarOtp = async () => {
    if (!email) { setError('Ingresa tu correo electrónico'); return }
    setLoading(true)
    setError('')
    const { data: cli } = await supabase.from('clientes')
      .select('id, acepto_terminos')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()
    if (!cli) {
      setError('No encontramos una cuenta con ese correo')
      setLoading(false)
      return
    }
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    })
    if (otpErr) {
      setError('Error al enviar el código. Intenta de nuevo.')
      setLoading(false)
      return
    }
    setClienteId(cli.id)
    setPasoLogin('otp')
    setLoading(false)
    setTimeout(() => inputsRef.current[0]?.focus(), 400)
  }

  const handleVerificarOtp = async (code?: string) => {
    const token = code || otp.join('')
    if (token.length < 6) return
    setLoading(true)
    setError('')
    const { data, error: verifyErr } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: 'email',
    })
    if (verifyErr || !data.user) {
      setError('Código incorrecto o expirado')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => inputsRef.current[0]?.focus(), 100)
      setLoading(false)
      return
    }
    await SecureStore.setItemAsync('navy_last_email', email.trim().toLowerCase())

    // Guardar tokens para Face ID
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      await SecureStore.setItemAsync('navy_access_token', session.access_token)
      await SecureStore.setItemAsync('navy_refresh_token', session.refresh_token || '')
    }
    
    setLoading(false)
    closeSheet()
  }

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setError('')
    if (digit && index < 5) inputsRef.current[index + 1]?.focus()
    if (newOtp.every(d => d) && digit) handleVerificarOtp(newOtp.join(''))
  }

  const handleOtpKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp]
      newOtp[index - 1] = ''
      setOtp(newOtp)
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleLoginBio = async () => {
    const emailGuardado = await SecureStore.getItemAsync('navy_last_email')
    if (!emailGuardado) { openSheet(); return }

    const ok = await autenticarBiometria()
    if (!ok) return

    // Restaurar sesión con tokens guardados
    const accessToken  = await SecureStore.getItemAsync('navy_access_token')
    const refreshToken = await SecureStore.getItemAsync('navy_refresh_token')

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token:  accessToken,
        refresh_token: refreshToken,
      })
      if (!error) return // App.tsx detecta la sesión y navega
    }

    // Si no hay tokens, pedir OTP
    setEmail(emailGuardado)
    const { error } = await supabase.auth.signInWithOtp({
      email: emailGuardado,
      options: { shouldCreateUser: false },
    })
    if (!error) {
      setPasoLogin('otp')
      setShowLogin(true)
    }
  }

  return (
    <View style={s.container}>
      <WelcomeHero
        scaleAnim={scaleAnim}
        contentY={contentY}
        bioActivada={bioActivada}
        bioDisponible={bioDisponible}
        bioTipo={bioTipo}
        onCrearCuenta={() => navigation.navigate('CrearCuenta')}
        onLogin={openSheet}
        onLoginBio={handleLoginBio}
      />

      <Modal visible={showLogin} transparent animationType="slide" statusBarTranslucent onRequestClose={closeSheet}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onTouchEnd={closeSheet} />
          <View style={s.sheet}>
            <View style={s.handle} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" bounces={false}>
              {pasoLogin === 'correo' ? (
                <LoginSheetCorreo
                  email={email}
                  loading={loading}
                  error={error}
                  bioActivada={bioActivada}
                  bioDisponible={bioDisponible}
                  bioTipo={bioTipo}
                  onChangeEmail={v => { setEmail(v); setError('') }}
                  onEnviar={handleEnviarOtp}
                  onClose={closeSheet}
                  onLoginBio={handleLoginBio}
                />
              ) : (
                <LoginSheetOTP
                  email={email}
                  otp={otp}
                  loading={loading}
                  error={error}
                  inputsRef={inputsRef}
                  onChangeOtp={handleOtpChange}
                  onKeyDown={handleOtpKeyDown}
                  onVerificar={handleVerificarOtp}
                  onReenviar={handleEnviarOtp}
                  onClose={closeSheet}
                  onCambiarCorreo={() => { setPasoLogin('correo'); setOtp(['', '', '', '', '', '']); setError('') }}
                />
              )}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
          closeSheet()
        }}
        onRechazar={async () => {
          setModalTerminos(false)
          await supabase.auth.signOut()
        }}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  sheet:     { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, maxHeight: height * 0.85 },
  handle:    { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
})