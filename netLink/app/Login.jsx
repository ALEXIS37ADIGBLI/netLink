import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { theme } from "../constants/theme";
import Icon from "../assets/icons";
import { StatusBar } from "expo-status-bar";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import Put from "../components/Put";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Login", "Svp entrez tous les champs");
      return;
    }

    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    console.log("error:", error);

    if (error) {
      Alert.alert("Login", error.message);
    }
  };

  return (
    <ScreenWrapper bg="#F3F8FF">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />
        {/*Text de bienvenue */}
        <View>
          <Text style={styles.welcomeText}>Salut,</Text>
          <Text style={styles.welcomeText}>bienvenue de nouveau</Text>
        </View>

        {/*Formulaire */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Veuillez vous connecter pour continuer
          </Text>
          <Put
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Entrez votre email"
            onChangeText={(value) => (emailRef.current = value)}
          />

          <Put
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder="Entrez votre Mot de passe"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />

          <Text style={styles.forgotPassword}>Mot de passe oublié?</Text>

          {/*bouttons */}
          <Button title={"Se connecter"} loading={loading} onPress={onSubmit} />
        </View>

        {/*footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas de compte ?</Text>
          <Pressable onPress={() => router.push("SignUp")}>
            <Text
              style={[
                styles.footerText,
                {
                  color: theme.colors.primaryDark,
                  fontWeight: theme.fonts.semibold,
                },
              ]}
            >
              S'inscrire
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },

  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },

  form: {
    gap: 25,
  },

  forgotPassword: {
    textAlign: "right",
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },

  footerText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
});
