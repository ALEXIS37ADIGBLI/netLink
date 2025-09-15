import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { fetchNotifications } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useRouter } from "expo-router";
import NotificationnsItem from "../../components/NotificationnsItem";
import Header from "../../components/Header";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    let res = await fetchNotifications(user?.id);
    if(res.success) setNotifications(res.data);
    setLoading(false);
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title='Notifications' />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listStyle}>
          {notifications.length > 0 ? (
            notifications.map(item => (
              <NotificationnsItem 
                item={item}
                key={item.id}
                router={router}
              />
            ))
          ) : (
            !loading && (
              <Text style={styles.noData}>Aucune notification pour le moment</Text>
            )
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10,
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: "center",
    marginTop: 50,
  },
});