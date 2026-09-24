import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, Platform, Modal,
  TextInput, ScrollView, KeyboardAvoidingView
} from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView }  from 'react-native-safe-area-context'
import { Ionicons }      from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { supabase }      from '../../lib/supabase'
import LogoNavy          from '../../assets/images/logo-navy.svg'
import { biometriaDisponible, tipoBiometria, autenticarBiometria } from '../../lib/biometrics'
import ModalTerminos from '../../components/auth/ModalTerminos'

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
  const [modalTerminosPrimerAcceso, setModalTerminosPrimerAcceso] = useState(false)

  const inputsRef = useRef<(TextInput | null)[]>([])
  const contentY  = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  useFocusEffect(
    useCallback(() => {
      const check = async () => {
        try {
          const disponible = await biometriaDisponible()
          console.log('Disponible:', disponible)
          setBioDisponible(disponible)
          if (!disponible) return

          const { data: { session } } = await supabase.auth.getSession()
          console.log('Session:', session?.user?.email || 'sin sesion')
          
          const emailGuardado = await SecureStore.getItemAsync('navy_last_email')
          console.log('Email guardado:', emailGuardado)
          
          const emailCheck = session?.user?.email || emailGuardado
          if (!emailCheck) { setBioActivada(false); return }

          const { data: cli, error } = await supabase.from('clientes')
            .select('bio_activada').eq('email', emailCheck).single()
          console.log('CLI:', cli, 'Error:', error)
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
      type:  'email',
    })

    if (verifyErr || !data.user) {
      setError('Código incorrecto o expirado')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => inputsRef.current[0]?.focus(), 100)
      setLoading(false)
      return
    }

    // Después de verificar OTP exitoso
    await SecureStore.setItemAsync('navy_last_email', email.trim().toLowerCase())

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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { openSheet(); return }
    const ok = await autenticarBiometria()
    if (!ok) return
    // Sesión activa — AuthStateChange lo maneja
  }

  return (
    <View style={s.container}>
      <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ translateY: contentY }] }]}>
        <Animated.Image
          source={require('../../assets/images/slide3.jpg')}
          style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%', transform: [{ scale: scaleAnim }] }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.95)']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={s.safe}>
          <View style={s.logoContainer}>
            <LogoNavy width={138} height={52} fill="#fff" />
          </View>
          <View style={s.hero}>
            <Text style={s.tagline}>TRAINING CENTER</Text>
            <Text style={s.heroText}>Experience</Text>
            <Text style={s.heroText}>strength like</Text>
            <Text style={s.heroText}>never before</Text>
            <Text style={s.heroSub}>Reserva, entrena y monitorea tu progreso en una sola app</Text>
            <View style={s.buttons}>
              <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('CrearCuenta')} activeOpacity={0.85}>
                <Text style={s.btnPrimaryText}>Crear cuenta</Text>
              </TouchableOpacity>
              {bioActivada && bioDisponible && (
                <TouchableOpacity style={s.btnBioHero} onPress={handleLoginBio} activeOpacity={0.85}>
                  <Ionicons name={bioTipo === 'Face ID' ? 'scan-outline' : 'finger-print-outline'} size={20} color="#fff" />
                  <Text style={s.btnBioHeroText}>Entrar con {bioTipo}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.btnSecondary} onPress={openSheet} activeOpacity={0.85}>
                <Text style={s.btnSecondaryText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Sheet login */}
      <Modal visible={showLogin} transparent animationType="slide" statusBarTranslucent onRequestClose={closeSheet}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={closeSheet} activeOpacity={1} />
          <View style={s.sheet}>
            <View style={s.handle} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" bounces={false}>

              {pasoLogin === 'correo' ? (
                <>
                  <View style={s.sheetHeader}>
                    <View>
                      <Text style={s.sheetTitulo}>Bienvenido de vuelta</Text>
                      <Text style={s.sheetSub}>Ingresa tu correo para recibir un código</Text>
                    </View>
                    <TouchableOpacity onPress={closeSheet} style={s.closeBtn}>
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
                        onSubmitEditing={handleEnviarOtp}
                        value={email}
                        onChangeText={v => { setEmail(v); setError('') }}
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
                    onPress={handleEnviarOtp}
                    activeOpacity={0.85}>
                    <Text style={s.btnLoginText}>{loading ? 'Enviando código...' : 'Enviar código →'}</Text>
                  </TouchableOpacity>

                  {bioActivada && bioDisponible && (
                    <TouchableOpacity style={s.btnBioSheet} onPress={handleLoginBio} activeOpacity={0.85}>
                      <Ionicons name={bioTipo === 'Face ID' ? 'scan-outline' : 'finger-print-outline'} size={20} color="#171B24" />
                      <Text style={s.btnBioSheetText}>Entrar con {bioTipo}</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  <View style={s.sheetHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.sheetTitulo}>Revisa tu correo</Text>
                      <Text style={s.sheetSub} numberOfLines={2}>
                        Enviamos un código a{'\n'}<Text style={{ color: '#111', fontFamily: 'Gotham_700Bold' }}>{email}</Text>
                      </Text>
                    </View>
                    <TouchableOpacity onPress={closeSheet} style={s.closeBtn}>
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
                        onChangeText={v => handleOtpChange(i, v)}
                        onKeyPress={({ nativeEvent }) => handleOtpKeyDown(i, nativeEvent.key)}
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
                    onPress={() => handleVerificarOtp()}
                    activeOpacity={0.85}>
                    <Text style={s.btnLoginText}>{loading ? 'Verificando...' : 'Entrar →'}</Text>
                  </TouchableOpacity>

                  <View style={s.otpFooter}>
                    <TouchableOpacity onPress={() => { setPasoLogin('correo'); setOtp(['', '', '', '', '', '']); setError('') }}>
                      <Text style={s.otpLink}>← Cambiar correo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleEnviarOtp} disabled={loading}>
                      <Text style={s.otpLink}>Reenviar código</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ModalTerminos
        visible={modalTerminosPrimerAcceso}
        onAceptar={async () => {
          if (clienteId) {
            await supabase.from('clientes').update({
              acepto_terminos:   true,
              acepto_privacidad: true,
            }).eq('id', clienteId)
          }
          setModalTerminosPrimerAcceso(false)
          closeSheet()
        }}
        onRechazar={async () => {
          setModalTerminosPrimerAcceso(false)
          await supabase.auth.signOut()
        }}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#000' },
  safe:             { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28 },
  logoContainer:    { paddingTop: 8, alignItems: 'flex-start' },
  hero:             { paddingBottom: 48 },
  tagline:          { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Gotham_700Bold', letterSpacing: 3, marginBottom: 12 },
  heroText:         { color: '#fff', fontSize: 57, fontFamily: 'Gotham_700Bold', lineHeight: 60 },
  heroSub:          { color: '#fff', fontSize: 20, fontFamily: 'Gotham_400Regular', marginTop: 16, lineHeight: 24, marginBottom: 28 },
  buttons:          { gap: 12 },
  btnPrimary:       { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  btnPrimaryText:   { color: '#000', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  btnBioHero:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  btnBioHeroText:   { color: '#fff', fontSize: 15, fontFamily: 'Gotham_700Bold' },
  btnSecondary:     { alignItems: 'center', paddingVertical: 12 },
  btnSecondaryText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontFamily: 'Gotham_400Regular' },
  sheet:            { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, maxHeight: height * 0.85 },
  handle:           { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
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
  otpRow:           { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 16 },
  otpInput:         { width: 46, height: 56, borderRadius: 14, backgroundColor: '#f3f4f6', borderWidth: 2, borderColor: '#e5e7eb', fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  otpInputFilled:   { backgroundColor: '#171B24', borderColor: '#171B24', color: '#fff' },
  otpInputError:    { borderColor: '#fca5a5', backgroundColor: '#fff5f5' },
  otpExpira:        { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', marginBottom: 16 },
  otpFooter:        { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 8 },
  otpLink:          { fontSize: 13, color: '#6b7280', fontFamily: 'Gotham_700Bold' },
  bioSheet:         { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12 },
  bioIconBox:       { width: 72, height: 72, borderRadius: 24, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  bioTitulo:        { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  bioSub:           { fontSize: 15, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
  btnActivar:       { backgroundColor: '#000', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  btnActivarText:   { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
})