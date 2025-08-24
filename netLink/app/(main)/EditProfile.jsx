import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";
import { Image } from "expo-image";
import { useAuth } from "../../context/AuthContext";
import { getUserImageSrc, uploadFile } from "../../services/ImageService";
import Icon from "../../assets/icons";
import Put from "../../components/Put";
import Button from "../../components/Button";
import { updateUser } from "../../services/UserService";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const EditProfile = () => {
  const { user: currentUser, setUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [user, setUser] = useState({
    name: "",
    phoneNumber: "",
    image: "",
    bio: "",
    address: "",
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || "",
        phoneNumber: currentUser.phoneNumber || "",
        image: currentUser.image || "",
        address: currentUser.address || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser]);

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUser({ ...user, image: result.assets[0] });
    }
  };

  const onSubmit = async () => {
    let userData = { ...user };
    let { name, phoneNumber, address, image, bio } = userData;
    if (!name || !phoneNumber || !address || !bio) {
      Alert.alert("Profile", "Remplissez tous les champs");
      return;
    }

    setLoading(true);

    if (typeof image == "object") {
      let imageRes = await uploadFile("profiles", image?.uri, true);
      if (imageRes.success) userData.image = imageRes.data;
      else userData.image = null;
    }

    const res = await updateUser(currentUser?.id, userData);

    setLoading(false);

    if (res.success) {
      setUserData({ ...currentUser, ...userData });
      router.back();
    }
  };

  let imageSource =
    user.image && typeof user.image == "object"
      ? user.image.uri
      : getUserImageSrc(user.image);

  return (
    <ScreenWrapper bg="#F3F8FF">
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <Header title="Modifier Profil" />

          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image source={imageSource} style={styles.avatar} />
              <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                <Icon name="camera" strokeWidth={2.5} size={20} />
              </Pressable>
            </View>
            <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
              Veuilles saisir vos inofrmations
            </Text>
            <Put
              icon={<Icon name="user" />}
              placeholder="Entrez votre noms"
              value={user.name}
              onChangeText={(value) => setUser({ ...user, name: value })}
            />

            <Put
              icon={<Icon name="call" />}
              placeholder="Entrez votre numéro de téléphone"
              value={user.phoneNumber}
              onChangeText={(value) => setUser({ ...user, phoneNumber: value })}
            />

            <Put
              icon={<Icon name="location" />}
              placeholder="Entrez votre address"
              value={user.address}
              onChangeText={(value) => setUser({ ...user, address: value })}
            />

            <Put
              placeholder="Entrez votre bio"
              value={user.bio}
              multiline={true}
              containerStyles={styles.bio}
              onChangeText={(value) => setUser({ ...user, bio: value })}
            />

            <Button
              title="Mettre à jour"
              loading={loading}
              onPress={onSubmit}
            />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },

  avatarContainer: {
    height: hp(14),
    width: hp(14),
    alignSelf: "center",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: theme.radius.xxl * 1.8,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.darkLight,
  },

  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: -10,
    padding: 8,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },

  form: {
    gap: 18,
    marginTop: 20,
  },

  input: {
    flexDirection: "row",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
    padding: 17,
    paddingHorizontal: 20,
    gap: 15,
  },

  bio: {
    flexDirection: "row",
    height: hp(15),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
});
