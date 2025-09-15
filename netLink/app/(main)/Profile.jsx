import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useEffect } from "react"; // Ajout de useEffect
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import Avatar from "../../components/Avatar";
import { fetchPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";

const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const POSTS_PER_PAGE = 5;

  // Charger les posts quand l'utilisateur est disponible
  useEffect(() => {
    if (user?.id) {
      getPosts(false);
    }
  }, [user?.id]);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout", "Error sign out");
    }
  };

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

      // Passer l'ID utilisateur pour récupérer seulement ses posts
      let res = await fetchPosts(limitToFetch, user?.id);

      if (res.success && Array.isArray(res.data)) {
        if (loadMore) {
          setPosts((prevPosts) => {
            const existingIds = new Set(prevPosts.map(post => post.id));
            const newPosts = res.data.filter(post => !existingIds.has(post.id));
            
            const allPosts = [...prevPosts, ...newPosts].sort((a, b) => 
              new Date(b.created_at || 0) - new Date(a.created_at || 0)
            );
            
            return allPosts;
          });
          setCurrentLimit(limitToFetch);
        } else {
          const sortedPosts = res.data.sort((a, b) => 
            new Date(b.created_at || 0) - new Date(a.created_at || 0)
          );
          setPosts(sortedPosts);
          setCurrentLimit(POSTS_PER_PAGE);
        }

        setHasMore(res.data.length === limitToFetch);
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

  const handleLogout = async () => {
    Alert.alert("confirmez", "Voulez-vous deconnecter ?", [
      {
        text: "Retour",
        onPress: () => console.log("modal cancelled"),
        style: "cancel",
      },
      {
        text: "Se deconnecter",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasMore && posts.length >= POSTS_PER_PAGE) {
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
          <Text style={styles.endText}>Vous avez vu tous vos posts</Text>
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

  const renderPostItem = ({ item }) => {
    if (!item || typeof item !== 'object') {
      return null;
    }

    return (
      <PostCard 
        item={item} 
        currentUser={user} 
        router={router}
        showDelte={true}
        onDelete={(post) => {
          // Fonction pour gérer la suppression d'un post
          setPosts(prev => prev.filter(p => p.id !== post.id));
        }}
      />
    );
  };

  return (
    <ScreenWrapper bg="white">
      <UserHeader user={user} router={router} handleLogout={handleLogout} />
      <FlatList
        data={posts}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item, index) => `post-${item?.id || index}-${index}`}
        renderItem={renderPostItem}
        ListFooterComponent={renderFooter}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </ScreenWrapper>
  );
};

const UserHeader = ({ user, router, handleLogout }) => {
  return (
    <View style={styles.headerBackground}>
      <View style={styles.headerContent}>
        <Header title="Profile" mb={30} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.userContainer}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            <Pressable
              style={styles.editIcon}
              onPress={() => router.push("EditProfile")}
            >
              <Icon name="edit" strokeWidth={2.5} size={20} />
            </Pressable>
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{user?.name || "Utilisateur"}</Text>
            <Text style={styles.userInfo}>{user?.address || ""}</Text>
          </View>

          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{user?.email || ""}</Text>
            </View>

            {user?.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>{user.phoneNumber}</Text>
              </View>
            )}

            {user?.bio && (
              <Text style={styles.bioText}>{user.bio}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  headerBackground: {
    backgroundColor: "#F3F8FF",
    paddingHorizontal: wp(4),
  },
  
  headerContent: {
    position: 'relative',
  },

  userContainer: {
    paddingBottom: 20,
  },

  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
    position: 'relative',
  },

  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },

  userInfoContainer: {
    alignItems: "center",
    gap: 4,
  },

  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
    textAlign: 'center',
  },

  userInfo: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
  },

  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: wp(4),
  },

  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },

  bioText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    fontStyle: 'italic',
    paddingHorizontal: wp(4),
    textAlign: 'center',
  },

  logoutButton: {
    position: "absolute",
    right: 0,
    top: 10,
    padding: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },

  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
    paddingTop: 20,
  },

  noPostsContainer: {
    paddingVertical: 50,
    alignItems: "center",
  },

  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
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
});