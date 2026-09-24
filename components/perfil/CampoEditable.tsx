import { View, Text, StyleSheet, TextInput } from 'react-native'

interface Props {
  label:       string
  value:       string
  onChange:    (v: string) => void
  placeholder?: string
  keyboardType?: any
  secureTextEntry?: boolean
  editable?:   boolean
}

export default function CampoEditable({ label, value, onChange, placeholder, keyboardType, secureTextEntry, editable = true }: Props) {
  return (
    <View style={s.container}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, !editable && s.inputDisabled]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || label}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secureTextEntry}
        editable={editable}
        autoCapitalize="none"
      />
    </View>
  )
}

const s = StyleSheet.create({
  container:    { gap: 6 },
  label:        { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#374151' },
  input:        { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111', fontFamily: 'Gotham_400Regular', borderWidth: 1, borderColor: '#f3f4f6' },
  inputDisabled:{ backgroundColor: '#f9fafb', color: '#9ca3af' },
})