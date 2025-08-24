import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { Button } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";
import { fetchPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import { getUserData } from "../../services/UserService";

const Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(5); // Commence à 5
  const [hasMore, setHasMore] = useState(true);
  const POSTS_PER_PAGE = 5;

  const handlePostEvent = async (payload) => {
    console.log("Real-time event:", payload);
    if (payload.eventType === "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.user = res.success ? res.data : {};

      setPosts((prevPosts) => {
        const exists = prevPosts.find((post) => post.id === newPost.id);
        if (exists) {
          return prevPosts;
        }
        return [newPost, ...prevPosts];
      });
    }
  };

  useEffect(() => {
    let postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        handlePostEvent
      )
      .subscribe();

    getPosts();

    return () => {
      supabase.removeChannel(postChannel);
    };
  }, []);

  const getPosts = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const limitToFetch = loadMore
        ? currentLimit + POSTS_PER_PAGE
        : POSTS_PER_PAGE;

      console.log("Fetching posts:", {
        loadMore,
        limitToFetch,
        currentLimit,
      });

      // Récupérer tous les posts jusqu'à la nouvelle limite
      let res = await fetchPosts(limitToFetch);

      console.log("Posts response:", {
        success: res.success,
        dataLength: res.data?.length,
        limitToFetch,
      });

      if (res.success) {
        // Simuler un délai de chargement pour l'effet visuel
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (loadMore) {
          // Afficher seulement les nouveaux posts (pagination côté client)
          const startIndex = currentLimit;
          const newPosts = res.data.slice(startIndex);

          console.log("New posts to add:", newPosts.length);

          setPosts((prevPosts) => {
            // Filtrer les doublons au cas où
            const filteredNewPosts = newPosts.filter(
              (newPost) =>
                !prevPosts.find(
                  (existingPost) => existingPost.id === newPost.id
                )
            );
            return [...prevPosts, ...filteredNewPosts];
          });
          setCurrentLimit(limitToFetch);
        } else {
          setPosts(res.data);
          setCurrentLimit(POSTS_PER_PAGE);
        }

        // Vérifier s'il y a plus de posts à charger
        setHasMore(res.data.length === limitToFetch);
        console.log("Has more posts:", res.data.length === limitToFetch);
      } else {
        console.error("Error fetching posts:", res.msg);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error in getPosts:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasMore && posts.length >= POSTS_PER_PAGE) {
      console.log("Loading more posts triggered");
      getPosts(true);
    }
  };

  const renderFooter = () => {
    if (posts.length === 0 && !loading) {
      return (
        <View style={styles.noPostsContainer}>
          <Text style={styles.noPosts}>Aucun post disponible</Text>
        </View>
      );
    }

    if (loading && posts.length === 0) {
      return (
        <View style={{ marginVertical: 30 }}>
          <Loading />
        </View>
      );
    }

    if (loadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <Loading />
          <Text style={styles.loadingMoreText}>
            Chargement de plus de posts...
          </Text>
        </View>
      );
    }

    if (!hasMore && posts.length > 0) {
      return (
        <View style={styles.endContainer}>
          <Text style={styles.endText}>Vous avez vu tous les posts</Text>
        </View>
      );
    }

    return <View style={{ height: 30 }} />;
  };

  const onRefresh = () => {
    setCurrentLimit(POSTS_PER_PAGE);
    setHasMore(true);
    getPosts(false);
  };

  return (
    <ScreenWrapper bg="#F3F8FF">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>netLink</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => router.push("Notifications")}>
              <Icon
                name="heart"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => router.push("NewPost")}>
              <Icon
                name="plus"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => router.push("Profile")}>
              <Avatar
                uri={user?.image}
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{ borderWidth: 2 }}
              />
            </Pressable>
          </View>
        </View>

        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item, index) => `post-${item.id}-${index}`}
          renderItem={({ item }) => (
            <PostCard item={item} currentUser={user} router={router} />
          )}
          ListFooterComponent={renderFooter}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.3}
          refreshing={loading}
          onRefresh={onRefresh}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },

  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },

  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },

  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },

  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },

  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },

  noPostsContainer: {
    marginVertical: 50,
    alignItems: "center",
  },

  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },

  loadingMoreText: {
    marginTop: 10,
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: "center",
  },

  endContainer: {
    paddingVertical: 30,
    alignItems: "center",
  },

  endText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: "center",
    fontStyle: "italic",
  },

  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: hp(2.2),
    width: wp(2.2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
  },

  pillText: {
    color: "white",
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
});
