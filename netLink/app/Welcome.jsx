import { StyleSheet, Text, View, Image, Pressable } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'

const Welcome = () => {
    const router = useRouter();
  return (
    <ScreenWrapper bg='#F3F8FF'>
        <StatusBar style='dark' />
        <View style={styles.container}>
            {/*Image */}
            <Image style={styles.welcomeImage} resizeMode='contain' source={require('../assets/images/wl.png')}/>

            {/*Titre */}
            <View style={{gap: 20}}>
                <Text style={styles.title}>netLink 🔗</Text>
                <Text style={styles.slogant}>
                    Publiez vos moments forts
                </Text>
            </View>

            {/*footer */}
            <View style={styles.footer}>
                <Button 
                    title='Getting Started'
                    buttonStyle={{marginHorizontal: wp(3)}}
                    onPress={()=> router.push('SignUp')}
                />
                <View style={styles.bottomTextContainer}>
                    <Text style={styles.loginText}>
                        Un des notres ?  
                    </Text>
                    <Pressable onPress={()=> router.push('Login')}>
                        <Text style={[styles.loginText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>
                            Se connecter
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    </ScreenWrapper>
  )
}

export default Welcome

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        paddingHorizontal: wp(4)
    },

    welcomeImage: {
        height: hp(30),
        width: wp(100),
        textAlign: 'center'
    },

    title: {
        color: theme.colors.dark,
        fontSize: hp(4),
        textAlign: 'center',
        fontWeight: theme.fonts.extraBold
    },

    slogant: {
        textAlign: 'center',
        paddingHorizontal: wp(10),
        fontSize: hp(1.7),
        color: theme.colors.dark

    },

    footer: {
        gap: 30,
        width: '100%',

    },

    bottomTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },

    loginText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6)
    }
})