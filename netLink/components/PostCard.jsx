import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import Avatar from './Avatar'
import { hp } from '../helpers/common'
import moment from 'moment'
import Icon from '../assets/icons'

const PostCard = ({
    item,
    currentUser,
    router,
    hasShadow = true,
}) => {


    const shadowStyles = {
        shadowOffset: {
            with: 0,
            height: 2
        },

        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1
    }

    const createdAt = moment(item?.created_at).format('MMM D');

    const openPostDetails = () => {

    }

  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      <View style={styles.header}>
        <View style={styles.userInfo}> 
            <Avatar 
                size={hp(4.5)}
                uri={item?.user?.image}
                rounded={theme.radius.md}
            />
            <View style={{gap: 2}}>
                <Text style={styles.username}>
                    {item?.user?.name}
                </Text>
                <Text style={styles.postTime}>
                    {createdAt}
                </Text>
            </View>
        </View>
        <TouchableOpacity onPress={openPostDetails}>
            <Icon name="threeDotsHorizontal" size={hp(4)} color={theme.colors.darkGray}/>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        
      </View>
    </View>
  )
}

export default PostCard

const styles = StyleSheet.create({
    container: {
        gap: 10,
        marginBottom: 15,
        borderRadius: theme.radius.xxl*1.1,
        borderCurve: 'continuous',
        padding: 10,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderWidth: 0.5,
        borderColor: theme.colors.darkGray,
        shadowColor: '#000'
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
})