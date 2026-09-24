import { View, Text, StyleSheet, TextInput } from 'react-native'

interface Props {
  form:   { nombre: string; telefono: string; email: string }
  onChange: (k: string, v: string) => void
}

export default function StepDatos({ form, onChange }: Props) {
  return (
    <View style={s.container}>
      <Text style={s.titulo}>Cuéntanos de ti</Text>

      <View style={s.fieldGroup}>
        <Text style={s.label}>Nombre completo <Text style={s.req}>*</Text></Text>
        <TextInput style={s.input} placeholder="Nombre completo"
          placeholderTextColor="#aaa" value={form.nombre}
          onChangeText={t => onChange('nombre', t)} />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.label}>Teléfono <Text style={s.req}>*</Text></Text>
        <TextInput style={s.input} placeholder="Celular"
          placeholderTextColor="#aaa" keyboardType="phone-pad"
          value={form.telefono} onChangeText={t => onChange('telefono', t)} />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.label}>Correo electrónico <Text style={s.req}>*</Text></Text>
        <TextInput style={s.input} placeholder="nombre@email.com"
          placeholderTextColor="#aaa" keyboardType="email-address"
          autoCapitalize="none" value={form.email}
          onChangeText={t => onChange('email', t)} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container:  { paddingHorizontal: 20, paddingTop: 24, gap: 20 },
  titulo:     { fontSize: 28, fontFamily: 'Gotham_700Bold', color: '#111' },
  fieldGroup: { gap: 6 },
  label:      { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#111' },
  req:        { color: '#ef4444' },
  input:      { backgroundColor: '#f3f4f6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111', fontFamily: 'Gotham_400Regular' },
})