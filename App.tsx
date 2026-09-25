import { useEffect, useState, useRef } from 'react'
import { NavigationContainer }         from '@react-navigation/native'
import { createNativeStackNavigator }  from '@react-navigation/native-stack'
import { createBottomTabNavigator }    from '@react-navigation/bottom-tabs'
import { NavigationContainerRef }      from '@react-navigation/native'
import * as SplashScreen               from 'expo-splash-screen'
import * as SecureStore                from 'expo-secure-store'
import * as Application                from 'expo-application'
import * as Font                       from 'expo-font'
import { Text, Linking }               from 'react-native'
import { supabase }                    from './lib/supabase'
import { createContext, useContext }    from 'react'
import { SafeAreaProvider }            from 'react-native-safe-area-context'
import { Ionicons }                    from '@expo/vector-icons'
import ModalNoShow                     from './components/shared/ModalNoShow'

import WelcomeScreen           from './app/(auth)/index'
import LoginScreen             from './app/(auth)/login'
import BienvenidoScreen        from './app/(auth)/bienvenido'
import CrearCuentaScreen       from './app/(auth)/crear-cuenta'
import RecuperarPasswordScreen from './app/(auth)/recuperar-password'
import NuevaPasswordScreen     from './app/(auth)/nueva-password'
import HomeScreen              from './app/(tabs)/home'
import ReservarScreen          from './app/(tabs)/reservar'
import AgendaScreen            from './app/(tabs)/agenda'
import PerfilScreen            from './app/(tabs)/perfil'
import ProgresoScreen          from './app/(tabs)/progreso'

SplashScreen.preventAutoHideAsync()

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()

const PenalizacionContext = createContext<any>(null)
export const usePenalizacion = () => useContext(PenalizacionContext)

function MainTabsWrapper() {
  const [penalizacion, setPenalizacion] = useState<any>(null)
  const [cliente,      setCliente]      = useState<any>(null)
  const [checado,      setChecado]      = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setChecado(true); return }

      const { data: cli } = await supabase
        .from('clientes').select('id').eq('email', session.user.email).single()
      if (!cli) { setChecado(true); return }

      setCliente(cli)

      const { data: pen } = await supabase
        .from('penalizaciones_noshow')
        .select(`*, clases(nombre_clase, horario, duracion_minutos, rooms(nombre), sucursales(nombre), staff(nombre, primer_apellido))`)
        .eq('cliente_id', cli.id)
        .eq('estatus', 'Pendiente')
        .limit(1)
        .maybeSingle()

      setPenalizacion(pen || null)
      setChecado(true)
    }
    check()
  }, [])

  if (!checado) return null
  if (penalizacion) return (
    <ModalNoShow
      penalizacion={penalizacion}
      clienteId={cliente?.id}
      onPagado={() => setPenalizacion(null)}
    />
  )
  return <MainTabs />
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color }) => {
        const icons: Record<string, any> = {
          Home:     focused ? 'home'       : 'home-outline',
          Agenda:   focused ? 'calendar'   : 'calendar-outline',
          Reservar: focused ? 'add-circle' : 'add-circle-outline',
          Progreso: focused ? 'bar-chart'  : 'bar-chart-outline',
          Perfil:   focused ? 'person'     : 'person-outline',
        }
        return <Ionicons name={icons[route.name]} size={22} color={color} />
      },
      tabBarLabel: ({ focused }) => (
        <Text style={{
          fontSize:   10,
          fontFamily: 'Gotham_700Bold',
          color:      focused ? '#171B24' : '#9ca3af',
          marginBottom: 4,
        }}>
          {route.name}
        </Text>
      ),
      tabBarActiveTintColor:   '#171B24',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth:  1,
        borderTopColor:  '#f3f4f6',
        height:          80,
        paddingBottom:   8,
      },
    })}>
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Agenda"   component={AgendaScreen} />
      <Tab.Screen name="Reservar" component={ReservarScreen} />
      <Tab.Screen name="Progreso" component={ProgresoScreen} />
      <Tab.Screen name="Perfil"   component={PerfilScreen} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [session,        setSession]        = useState<any>(null)
  const [ready,          setReady]          = useState(false)
  const [showBienvenido, setShowBienvenido] = useState(false)
  const navigationRef = useRef<NavigationContainerRef<any>>(null)

  const [fontsLoaded] = Font.useFonts({
    'Gotham_300Light':   require('./assets/fonts/Gotham-Light.otf'),
    'Gotham_400Regular': require('./assets/fonts/Gotham-Book.otf'),
    'Gotham_500Medium':  require('./assets/fonts/Gotham-Medium.otf'),
    'Gotham_700Bold':    require('./assets/fonts/Gotham-Bold.otf'),
    'Gotham_900Black':   require('./assets/fonts/Gotham-Black.otf'),
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const buildGuardado = await SecureStore.getItemAsync('navy_build_version').catch(() => null)
      const buildActual   = Application.nativeBuildVersion

      if (buildGuardado !== buildActual) {
        await supabase.auth.signOut().catch(() => {})
        await SecureStore.setItemAsync('navy_build_version', buildActual || '').catch(() => {})
        setSession(null)
        setReady(true)
        return
      }

      setSession(session)
      setReady(true)
    })

    supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN')  setShowBienvenido(true)
      if (event === 'SIGNED_OUT') setShowBienvenido(false)
    })
  }, [])

  useEffect(() => {
    if (ready && fontsLoaded) SplashScreen.hideAsync()
  }, [ready, fontsLoaded])

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url.includes('nueva-password')) navigationRef.current?.navigate('NuevaPassword')
    })
    Linking.getInitialURL().then(url => {
      if (url && url.includes('nueva-password')) navigationRef.current?.navigate('NuevaPassword')
    })
    return () => subscription.remove()
  }, [])

  if (!ready || !fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {session ? (
            <>
              {showBienvenido ? (
                <Stack.Screen name="Bienvenido">
                  {() => <BienvenidoScreen onContinuar={() => setShowBienvenido(false)} />}
                </Stack.Screen>
              ) : (
                <Stack.Screen name="Main" component={MainTabsWrapper} />
              )}
            </>
          ) : (
            <>
              <Stack.Screen name="Welcome"           component={WelcomeScreen} />
              <Stack.Screen name="Login"             component={LoginScreen} />
              <Stack.Screen name="CrearCuenta"       component={CrearCuentaScreen} />
              <Stack.Screen name="RecuperarPassword" component={RecuperarPasswordScreen} />
              <Stack.Screen name="NuevaPassword"     component={NuevaPasswordScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}