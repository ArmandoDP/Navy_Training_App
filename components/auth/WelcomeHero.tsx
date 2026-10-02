import { Animated, StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import LogoNavy from '../../assets/images/logo-navy.svg'

interface Props {
  scaleAnim:    Animated.Value
  contentY:     Animated.Value
  bioActivada:  boolean
  bioDisponible:boolean
  bioTipo:      string
  onCrearCuenta:() => void
  onLogin:      () => void
  onLoginBio:   () => void
}

export default function WelcomeHero({ scaleAnim, contentY, bioActivada, bioDisponible, bioTipo, onCrearCuenta, onLogin, onLoginBio }: Props) {
  return (
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
            <TouchableOpacity style={s.btnPrimary} onPress={onCrearCuenta} activeOpacity={0.85}>
              <Text style={s.btnPrimaryText}>Crear cuenta</Text>
            </TouchableOpacity>
            {bioActivada && bioDisponible && (
              <TouchableOpacity style={s.btnBioHero} onPress={onLoginBio} activeOpacity={0.85}>
                <Ionicons name={bioTipo === 'Face ID' ? 'scan-outline' : 'finger-print-outline'} size={20} color="#fff" />
                <Text style={s.btnBioHeroText}>Acceder con {bioTipo}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.btnSecondary} onPress={onLogin} activeOpacity={0.85}>
              <Text style={s.btnSecondaryText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  )
}

const s = StyleSheet.create({
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
})