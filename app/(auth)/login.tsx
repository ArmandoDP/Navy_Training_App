import { useState, useEffect }                                         from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput,
         KeyboardAvoidingView, Platform }                              from 'react-native'
import { useNavigation }                                               from '@react-navigation/native'
import { Ionicons }                                                    from '@expo/vector-icons'
import * as LocalAuthentication                                        from 'expo-local-authentication'
import * as SecureStore                                                from 'expo-secure-store'
import { supabase }                                                    from '../../lib/supabase'
import LogoNavy                                                        from '../../assets/images/logo-navy.svg'

export default function LoginScreen() {
  const navigation   = useNavigation<any>()
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [tieneBio,   setTieneBio]   = useState(false)
  const [bioLoading, setBioLoading] = useState(false)

  useEffect(() => {
    checkBiometria()
  }, [])

  const checkBiometria = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    const inscrito   = await LocalAuthentication.isEnrolledAsync()
    const guardado   = await SecureStore.getItemAsync('navy_email')
    console.log('compatible:', compatible)
    console.log('inscrito:', inscrito)
    console.log('guardado:', guardado)
    setTieneBio(compatible && inscrito && !!guardado)
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña')
      return
    }
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    // Verificar si debe cambiar contraseña
    const { data: cli } = await supabase
      .from('clientes')
      .select('id, debe_cambiar_password, acepto_terminos')
      .eq('email', email.trim().toLowerCase())
      .single()

    setLoading(false)

    if (!cli?.acepto_terminos) {
      // Si no tienes modal de términos aquí, solo navega al main
      navigation.navigate('Main')
      return
    }

    // Guardar credenciales para biometría
    await SecureStore.setItemAsync('navy_bio_email_temp',    email)
    await SecureStore.setItemAsync('navy_bio_password_temp', password)
  }

  const handleBiometria = async () => {
    setBioLoading(true)
    try {
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage:          'Accede a Navy Training Center',
        cancelLabel:            'Cancelar',
        fallbackLabel:          'Usar contraseña',
        disableDeviceFallback:  false,
      })

      if (!resultado.success) {
        setBioLoading(false)
        return
      }

      const emailGuardado    = await SecureStore.getItemAsync('navy_email')
      const passwordGuardado = await SecureStore.getItemAsync('navy_password')

      if (!emailGuardado || !passwordGuardado) {
        setBioLoading(false)
        return
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email:    emailGuardado,
        password: passwordGuardado,
      })

      if (authError) {
        setError('Error al iniciar sesión. Intenta con tu contraseña.')
      }
    } catch (e) {
      setError('Error al autenticar. Intenta de nuevo.')
    }
    setBioLoading(false)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>

        {/* Header negro */}
        <View style={styles.header}>
          <LogoNavy width={100} height={36} fill="#fff" />
          <Text style={styles.tagline}>TRAINING CENTER</Text>
          <Text style={styles.heroText}>El estudio.</Text>
          <Text style={styles.heroText}>El gym.</Text>
          <Text style={[styles.heroText, styles.heroAccent]}>Tu ritual.</Text>
        </View>

        {/* Card blanca */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>¡Hola!</Text>
          <Text style={styles.cardSub}>Por favor, ingresa tus datos</Text>

          {/* Correo */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Correo</Text>
            <TextInput
              style={styles.input}
              placeholder="nombre@email.com"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={t => { setEmail(t); setError('') }}
            />
          </View>

          {/* Contraseña */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Contraseña</Text>
            <View style={styles.passContainer}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="••••••••••"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={t => { setPassword(t); setError('') }}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Botón entrar */}
          <TouchableOpacity
            style={[styles.btnEntrar, (!email || !password || loading) && styles.btnEntrarDisabled]}
            onPress={handleLogin}
            disabled={loading || (!email || !password)}
            activeOpacity={0.85}>
            <Text style={styles.btnEntrarText}>
              {loading ? 'Verificando...' : 'Entrar →'}
            </Text>
          </TouchableOpacity>

          {/* Biometría */}
          {tieneBio && (
            <TouchableOpacity
              style={styles.btnBio}
              onPress={handleBiometria}
              disabled={bioLoading}
              activeOpacity={0.8}>
              <Ionicons name="finger-print-outline" size={24} color="#111" />
              <Text style={styles.btnBioText}>
                {bioLoading ? 'Autenticando...' : 'Usar Face ID / Huella'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Recuperar */}
          <TouchableOpacity style={styles.recuperarBtn} onPress={() => navigation.navigate('RecuperarPassword')}>
            <Text style={styles.recuperarText}>
              ¿No recuerdas tu contraseña?{' '}
              <Text style={styles.recuperarLink}>Recupérala.</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#000' },
  header:            { flex: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 32, justifyContent: 'flex-end' },
  tagline:           { color: '#666', fontSize: 12, fontFamily: 'Gotham_400Regular', letterSpacing: 4, marginBottom: 12 },
  heroText:          { color: '#fff', fontSize: 56, fontFamily: 'Gotham_700Bold', lineHeight: 62 },
  heroAccent:        { color: '#7B9EFF' },
  card:              { backgroundColor: '#F2F2F2', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 48 },
  cardTitle:         { fontSize: 32, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  cardSub:           { fontSize: 15, color: '#888', textAlign: 'center', marginTop: 4, marginBottom: 28, fontFamily: 'Gotham_400Regular' },
  fieldContainer:    { marginBottom: 16 },
  fieldLabel:        { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#333', marginBottom: 8 },
  input:             { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, fontSize: 16, color: '#111', fontFamily: 'Gotham_400Regular' },
  passContainer:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingRight: 12 },
  eyeBtn:            { padding: 4 },
  errorText:         { color: '#ef4444', fontSize: 12, fontFamily: 'Gotham_400Regular', marginBottom: 12, textAlign: 'center' },
  btnEntrar:         { backgroundColor: '#111', borderRadius: 18, paddingVertical: 20, alignItems: 'center', marginTop: 12 },
  btnEntrarDisabled: { backgroundColor: '#ccc' },
  btnEntrarText:     { color: '#fff', fontSize: 18, fontFamily: 'Gotham_700Bold' },
  btnBio:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, marginTop: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  btnBioText:        { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111' },
  recuperarBtn:      { alignItems: 'center', marginTop: 16 },
  recuperarText:     { fontSize: 13, color: '#888', fontFamily: 'Gotham_400Regular' },
  recuperarLink:     { color: '#111', fontFamily: 'Gotham_700Bold', textDecorationLine: 'underline' },
})