import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'
import Avatar from './Avatar'
import moment from 'moment'

const NotificationnsItem = ({
    item,
    router
}) => {

    const handleClick = () => {
        // ouvrir le post commenté

        let { postId, commentId} = JSON.parse(item?.data || '{}');
        router.push({ pathname: '/(main)/PostDetails', params: { postId, commentId } });
    }

    const formatDate = (date) => {
        const now = moment();
        const notificationDate = moment(date);
        const diffInMinutes = now.diff(notificationDate, 'minutes');
        const diffInHours = now.diff(notificationDate, 'hours');
        const diffInDays = now.diff(notificationDate, 'days');
        
        if (diffInMinutes < 1) {
            return 'À l\'instant';
        } else if (diffInMinutes < 60) {
            return `Il y a ${diffInMinutes} min`;
        } else if (diffInHours < 24) {
            return `Il y a ${diffInHours} h`;
        } else if (diffInDays === 1) {
            return 'Hier';
        } else if (diffInDays < 7) {
            return `Il y a ${diffInDays} j`;
        } else if (diffInDays < 30) {
            const weeks = Math.floor(diffInDays / 7);
            return `Il y a ${weeks} sem`;
        } else if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return `Il y a ${months} mois`;
        } else {
            const years = Math.floor(diffInDays / 365);
            return `Il y a ${years} an${years > 1 ? 's' : ''}`;
        }
    }

    const createdAt = formatDate(item?.created_at);

    return (
        <TouchableOpacity style={styles.container} onPress={handleClick}>
            <Avatar 
                uri={item?.sender?.image}
                size={hp(5)}
            />

            <View style={styles.nameTitle}>
                <Text style={styles.nameText}>
                    {item?.sender?.name}
                </Text>
                <Text style={styles.titleText}>
                    {item?.title}
                </Text>
            </View>

            <Text style={styles.timeText}>
                {createdAt}
            </Text>
        </TouchableOpacity>
    )
}

export default NotificationnsItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        backgroundColor: 'white',
        borderColor: theme.colors.gray,
        borderWidth: 1,
        padding: 15,
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        marginBottom: 10,
    },

    nameTitle: {
        flex: 1,
        gap: 3,
    },

    nameText: {
        fontSize: hp(1.7),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text,
    },

    titleText: {
        fontSize: hp(1.6),
        fontWeight: theme.fonts.regular,
        color: theme.colors.text,
        lineHeight: hp(2),
    },

    timeText: {
        fontSize: hp(1.4),
        fontWeight: theme.fonts.regular,
        color: theme.colors.textLight,
        minWidth: 60,
        textAlign: 'right',
    }
})