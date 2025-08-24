import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { theme } from "../constants/theme";
import Avatar from "./Avatar";
import { hp, wp } from "../helpers/common";
import moment from "moment";
import Icon from "../assets/icons";
import { RenderHTML } from "react-native-render-html";
import { Image } from "expo-image";
import { getSupabaseFileUrl } from "../services/ImageService";
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

const PostCard = ({ item, currentUser, router, hasShadow = true }) => {
  const onLike = async () => {
    if (liked) {
      let updatedLikes = likes.filter((like) => like.userId != currentUser?.id);
      setLikes([...updatedLikes]);

      let res = await removePostLike(item?.id, currentUser?.id);

      // console.log('res: ', res)

      if (!res.success) {
        Alert.alert("Oups,", "Quelque problème de notre coté");
      }
    } else {
      let data = {
        userId: currentUser?.id,
        postId: item?.id,
      };

      setLikes([...likes, data]);

      let res = await createPostLike(data);

      // console.log('res: ', res)

      if (!res.success) {
        Alert.alert("Oups,", "Quelque problème de notre coté");
      }
    }
  };

  const shadowStyles = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  };

  const [likes, setLikes] = useState([]);

  useEffect(() => {
    setLikes(item?.postLikes);
  }, []);

  const createdAt = moment(item?.created_at).format("MMM D");

  const openPostDetails = () => {
    // Votre logique ici
  };

  // const likes = [];
  const liked = likes.filter((likes) => likes.userId === currentUser?.id)[0]
    ? true
    : false;

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
        <TouchableOpacity onPress={openPostDetails}>
          <Icon
            name="threeDotsHorizontal"
            size={hp(4)}
            color={theme.colors.darkGray}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.postBody}>
          {item?.body && (
            <RenderHTML
              contentWidth={wp(100)}
              source={{ html: item?.body }}
              tagsStyles={tagsStyles}
            />
          )}
        </View>

        {item?.file?.includes("postImages") && (
          <Image
            source={getSupabaseFileUrl(item?.file)}
            transition={100}
            style={styles.postMedia}
            contentFit="cover"
          />
        )}

        {item?.file && item?.file?.includes("postVideos") && (
          <Video
            style={[styles.postMedia, { height: hp(30) }]}
            source={getSupabaseFileUrl(item?.file)}
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
          <Text style={styles.count}>{likes?.length}</Text>
        </View>

        <View style={styles.footerButton}>
          <TouchableOpacity>
            <Icon name="comment" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>{0}</Text>
        </View>

        <View style={styles.footerButton}>
          <TouchableOpacity>
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
