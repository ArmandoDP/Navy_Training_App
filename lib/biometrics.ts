import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore         from 'expo-secure-store'

const KEY_EMAIL    = 'navy_bio_email'
const KEY_PASSWORD = 'navy_bio_password'
const KEY_ENABLED  = 'navy_bio_enabled'

// Verificar si el dispositivo soporta biometría
export async function biometriaDisponible(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync()
  const enrolled   = await LocalAuthentication.isEnrolledAsync()
  console.log('Hardware:', compatible, 'Enrolled:', enrolled)
  return compatible && enrolled
}

// Obtener tipo de biometría disponible
export async function tipoBiometria(): Promise<string> {
  const tipos = await LocalAuthentication.supportedAuthenticationTypesAsync()
  if (tipos.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID'
  if (tipos.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Huella digital'
  return 'Biometría'
}

// Guardar credenciales para biometría
export async function guardarCredenciales(email: string, password: string) {
  await SecureStore.setItemAsync(KEY_EMAIL,    email)
  await SecureStore.setItemAsync(KEY_PASSWORD, password)
  await SecureStore.setItemAsync(KEY_ENABLED,  'true')
}

// Verificar si biometría está activada
export async function biometriaActivada(): Promise<boolean> {
  const enabled = await SecureStore.getItemAsync(KEY_ENABLED)
  return enabled === 'true'
}

// Obtener credenciales guardadas
export async function obtenerCredenciales(): Promise<{ email: string; password: string } | null> {
  const email    = await SecureStore.getItemAsync(KEY_EMAIL)
  const password = await SecureStore.getItemAsync(KEY_PASSWORD)
  if (!email || !password) return null
  return { email, password }
}

// Autenticar con biometría
export async function autenticarBiometria(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage:    'Inicia sesión en Navy',
    fallbackLabel:    'Usar contraseña',
    disableDeviceFallback: false,
  })
  return result.success
}

// Desactivar biometría
export async function desactivarBiometria() {
  await SecureStore.deleteItemAsync(KEY_EMAIL)
  await SecureStore.deleteItemAsync(KEY_PASSWORD)
  await SecureStore.setItemAsync(KEY_ENABLED, 'false')
}