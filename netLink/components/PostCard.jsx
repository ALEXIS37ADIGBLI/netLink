import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { theme } from "../constants/theme";
import Avatar from "./Avatar";
import { hp, stripHtmlTags, wp } from "../helpers/common";
import moment from "moment";
import Icon from "../assets/icons";
import { RenderHTML } from "react-native-render-html";
import { Image } from "expo-image";
import { downloadFile, getSupabaseFileUrl } from "../services/ImageService";
import { Video } from "expo-av";
import { createPostLike, removePostLike } from "../services/postService";

const testStyle = {
  color: theme.colors.darkGray,
  fontSize: hp(1.75),
};

const tagsStyles = {
  div: testStyle,
  p: testStyle,
  ol: testStyle,
  h1: {
    color: theme.colors.darkGray,
  },
  h4: {
    color: theme.colors.darkGray,
  },
};

const PostCard = ({ item, currentUser, router, hasShadow = true, showMoreIcon = true }) => {
  // Vérifications de sécurité
  if (!item || !currentUser) {
    console.warn("PostCard: item ou currentUser manquant");
    return null;
  }

  const [loading, setLoading] = useState(false);

  // État avec initialisation sécurisée
  const [likes, setLikes] = useState(() => {
    return Array.isArray(item?.postLikes) ? item.postLikes : [];
  });

  // useEffect avec dépendances correctes - CORRIGÉ
  useEffect(() => {
    if (Array.isArray(item?.postLikes)) {
      setLikes(item.postLikes);
    }
  }, [item?.id]); // Dépend uniquement de l'ID du post

  // Calcul mémorisé pour éviter les re-calculs inutiles
  const liked = useMemo(() => {
    return likes.some((like) => like.userId === currentUser?.id);
  }, [likes, currentUser?.id]);

  // Fonction onLike optimisée avec useCallback
  const onLike = useCallback(async () => {
    if (!currentUser?.id || !item?.id) {
      console.warn("onLike: currentUser.id ou item.id manquant");
      return;
    }

    const isCurrentlyLiked = likes.some(
      (like) => like.userId === currentUser.id
    );

    try {
      if (isCurrentlyLiked) {
        // Optimistic update - retirer le like
        const updatedLikes = likes.filter(
          (like) => like.userId !== currentUser.id
        );
        setLikes(updatedLikes);

        const res = await removePostLike(item.id, currentUser.id);

        if (!res.success) {
          // Revertir en cas d'erreur
          setLikes(likes);
          Alert.alert("Oups,", "Problème lors de la suppression du like");
        }
      } else {
        // Optimistic update - ajouter le like
        const newLike = {
          userId: currentUser.id,
          postId: item.id,
        };
        setLikes([...likes, newLike]);

        const res = await createPostLike(newLike);

        if (!res.success) {
          // Revertir en cas d'erreur
          setLikes(likes);
          Alert.alert("Oups,", "Problème lors de l'ajout du like");
        }
      }
    } catch (error) {
      console.error("Erreur dans onLike:", error);
      // Revertir à l'état précédent en cas d'erreur
      setLikes(likes);
      Alert.alert("Erreur", "Impossible de traiter le like");
    }
  }, [likes, currentUser?.id, item?.id]);

  // Fonction onShare optimisée
  const onShare = useCallback(async () => {
    try {
      let content = { message: stripHtmlTags(item?.body) || "" };

      // Vérifier s'il y a un fichier image
      if (item?.file && item?.file?.includes("postImages")) {
        console.log("🖼️ Téléchargement image pour partage...");

        const supabaseUrl = getSupabaseFileUrl(item.file);
        if (supabaseUrl && supabaseUrl.uri) {
          const localUri = await downloadFile(supabaseUrl.uri);

          if (localUri) {
            content.url = localUri;
            console.log("✅ Image téléchargée pour partage");
          } else {
            console.log("❌ Échec téléchargement image");
            Alert.alert(
              "Information",
              "L'image n'a pas pu être téléchargée, mais le texte sera partagé."
            );
          }
        }
      }

      await Share.share(content);
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      Alert.alert("Erreur", "Impossible de partager le contenu");
    }
  }, [item?.body, item?.file]);

  // Calculs mémorisés
  const createdAt = useMemo(() => {
    return moment(item?.created_at).format("MMM D");
  }, [item?.created_at]);

  const shadowStyles = useMemo(
    () => ({
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 1,
    }),
    []
  );

  const openPostDetails = () => {
    if(!showMoreIcon) return null;
    router.push({pathname: 'PostDetails', params: {postId: item?.id}})
  };

  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{createdAt}</Text>
          </View>
        </View>
        {
          showMoreIcon && (
            <TouchableOpacity onPress={openPostDetails}>
          <Icon
            name="threeDotsHorizontal"
            size={hp(4)}
            color={theme.colors.darkGray}
          />
        </TouchableOpacity>
          )
        }
        
      </View>

      <View style={styles.content}>
        <View style={styles.postBody}>
          {item?.body && (
            <RenderHTML
              contentWidth={wp(100)}
              source={{ html: item.body }}
              tagsStyles={tagsStyles}
            />
          )}
        </View>

        {item?.file?.includes("postImages") && (
          <Image
            source={getSupabaseFileUrl(item.file)}
            transition={100}
            style={styles.postMedia}
            contentFit="cover"
          />
        )}

        {item?.file && item?.file?.includes("postVideos") && (
          <Video
            style={[styles.postMedia, { height: hp(30) }]}
            source={getSupabaseFileUrl(item.file)}
            useNativeControls
            resizeMode="cover"
            isLooping
          />
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onLike}>
            <Icon
              name="heart"
              size={24}
              fill={liked ? "red" : "transparent"}
              color={liked ? "red" : theme.colors.textLight}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes?.length || 0}</Text>
        </View>

        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="comment" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>{
              item?.comments[0]?.count
            }</Text>
        </View>

        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onShare}>
            <Icon name="share" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 20,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    padding: 14,
    paddingVertical: 18,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.mediumGray,
    ...theme.shadows.medium,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  username: {
    fontSize: hp(1.9),
    color: theme.colors.text,
    fontWeight: theme.fonts.semibold,
  },

  postTime: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },

  content: {
    gap: 14,
  },

  postMedia: {
    height: hp(36),
    width: "100%",
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    overflow: "hidden",
  },

  postBody: {
    marginLeft: 6,
    lineHeight: 22,
    color: theme.colors.text,
    fontSize: hp(1.8),
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: theme.colors.mediumGray,
  },

  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  count: {
    color: theme.colors.text,
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
  },
});
