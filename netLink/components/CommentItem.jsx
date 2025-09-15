import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'
import Avatar from './Avatar'
import moment from 'moment'
import Icon from '../assets/icons'

const CommentItem = (
    {item,
        canDelete = false,
        highlight = false,
        onDelete = () => {
        
        }
        
    }
) => {

    let createdAt;
const date = moment(item?.created_at);

if (moment().diff(date, 'days') < 1) {
  // Aujourd'hui → affiche juste l'heure
  createdAt = date.format("HH:mm"); // exemple: 18:32
} else if (moment().diff(date, 'days') === 1) {
  // Hier → "Hier à 18:32"
  createdAt = `Hier à ${date.format("HH:mm")}`;
} else if (moment().diff(date, 'days') < 7) {
  // Dans la semaine → "Lundi à 18:32"
  createdAt = date.format("dddd [à] HH:mm");
} else {
  // Sinon → "23 août à 18:32"
  createdAt = date.format("D MMM [à] HH:mm");
}


    const handleDelete = () => {
        Alert.alert("confirmez", "Voulez-vous supprimer ce commentaire  ?", [
              {
                text: "Retour",
                onPress: () => console.log("modal cancelled"),
                style: "cancel",
              },
              {
                text: "Supprimer",
                onPress: () => onDelete(item),
                style: "destructive",
              },
            ]);
    }
  return (
    <View style={styles.container}>
        <Avatar 
            uri={item?.user?.image}
        />

        <View style={[styles.content, highlight ? styles.highlight : null]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={styles.nameContainer}>
                    <Text style={[styles.text, {color: theme.colors.textLight}]}>
                        {
                            item?.user?.name
                        }
                    </Text>
                    <Text>.</Text>
                    <Text style={[styles.text, ]}>
                        {
                            createdAt
                        }
                    </Text>
                </View>
                {
                    canDelete && (
                        <TouchableOpacity onPress={handleDelete}>
                    <Icon name='delete' size={20} color={theme.colors.error}/>
                </TouchableOpacity>
                    )
                }
                
            </View>
                <Text style={[styles.text, {fontWeight: 'normal'}]}>
                    {item?.text}
                </Text>
        </View>
    </View>
  )
}

export default CommentItem

const styles = StyleSheet.create({

    container: {
        flex: 1,
        flexDirection: 'row',
        gap: 7,
    },

    content: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    flex: 1,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
  },

  highlight: {
    borderWidth: 0.2,
    backgroundColor: 'white',
    borderColor: theme.colors.dark,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.darkGray
  },
})