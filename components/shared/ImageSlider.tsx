import { useEffect, useRef } from 'react'
import {
  View, StyleSheet, Animated,
  StyleProp, ViewStyle
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const SLIDES = [
  require('../../assets/images/slide1.jpg'),
  require('../../assets/images/slide2.jpg'),
  require('../../assets/images/slide3.jpg'),
  require('../../assets/images/slide4.jpg'),
  require('../../assets/images/slide5.jpg'),
]

interface Props {
  height?:         number
  style?:          StyleProp<ViewStyle>
  interval?:       number
  gradientColors?: string[]
  gradientStart?:  { x: number; y: number }
  gradientEnd?:    { x: number; y: number }
}

export default function ImageSlider({
  height:       sliderHeight = 420,
  style,
  interval                   = 5000,
  gradientColors             = ['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.95)'],
  gradientStart              = { x: 0, y: 0 },
  gradientEnd                = { x: 0, y: 1 },
}: Props) {
  const anims = useRef(
    SLIDES.map((_, i) => ({
      opacity: new Animated.Value(i === 0 ? 1 : 0),
      scale:   new Animated.Value(i === 0 ? 1 : 1.08),
    }))
  ).current

  const currentRef = useRef(0)

  useEffect(() => {
    // Ken Burns en primer slide al iniciar
    Animated.timing(anims[0].scale, {
      toValue:         1.08,
      duration:        interval + 2000,
      useNativeDriver: true,
    }).start()

    const transition = () => {
      const curr    = currentRef.current
      const nextIdx = (curr + 1) % SLIDES.length

      // Reset siguiente
      anims[nextIdx].scale.setValue(1)

      Animated.parallel([
        // Fade out actual
        Animated.timing(anims[curr].opacity, {
          toValue:         0,
          duration:        1500,
          useNativeDriver: true,
        }),
        // Fade in siguiente
        Animated.timing(anims[nextIdx].opacity, {
          toValue:         1,
          duration:        1500,
          useNativeDriver: true,
        }),
        // Ken Burns siguiente
        Animated.timing(anims[nextIdx].scale, {
          toValue:         1.08,
          duration:        interval + 2000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        currentRef.current = nextIdx
        // Ken Burns continuo en nuevo actual
        Animated.timing(anims[nextIdx].scale, {
          toValue:         1.12,
          duration:        interval,
          useNativeDriver: true,
        }).start()
      })
    }

    const timer = setInterval(transition, interval)
    return () => clearInterval(timer)
  }, [])

  return (
    <View style={[{ height: sliderHeight, overflow: 'hidden', backgroundColor: '#000' }, style]}>
      {SLIDES.map((src, i) => (
        <Animated.Image
          key={i}
          source={src}
          style={[
            s.image,
            {
              height:    sliderHeight * 1.15,
              opacity:   anims[i].opacity,
              transform: [{ scale: anims[i].scale }],
            }
          ]}
          resizeMode="cover"
        />
      ))}
      <LinearGradient
        colors={gradientColors as any}
        start={gradientStart}
        end={gradientEnd}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.25)', 'transparent', 'rgba(0,0,0,0.25)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  )
}

const s = StyleSheet.create({
  image: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    width: '100%',
  },
})