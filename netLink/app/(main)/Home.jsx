import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { useRouter, useFocusEffect } from "expo-router";
import Avatar from "../../components/Avatar";
import { fetchPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import { getUserData } from "../../services/UserService";

const Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const channelsRef = useRef({ posts: null, notifications: null });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);      // ← conserve pour le premier chargement
const [refreshing, setRefreshing] = useState(false);  // ← nouveau pour RefreshControl

  const POSTS_PER_PAGE = 5;

  // Réinitialiser le compteur de notifications quand l'utilisateur revient sur la page
  // useFocusEffect(
  //   useCallback(() => {
  //     console.log("🏠 Page Home focus - Réinitialisation des notifications");
  //     setNotificationCount(0);
  //   }, [])
  // );

  const handlePostEvent = useCallback(async (payload) => {
    console.log("Real-time post event:", payload);
    
    if (!payload || !payload.eventType) {
      console.warn("Invalid payload received for post event");
      return;
    }
    
    try {
      if (payload.eventType === "INSERT" && payload?.new?.id) {
        let newPost = { ...payload.new };
        let res = await getUserData(newPost.userId);
        newPost.user = res.success ? res.data : {};

        setPosts((prevPosts) => {
          if (!Array.isArray(prevPosts)) return [newPost];
          
          const exists = prevPosts.find((post) => post.id === newPost.id);
          if (exists) {
            return prevPosts;
          }
          return [newPost, ...prevPosts];
        });
        
        setCurrentLimit(prev => prev + 1);
      }

      if (payload.eventType === "DELETE" && payload?.old?.id) {
        setPosts((prevPosts) => {
          if (!Array.isArray(prevPosts)) return [];
          
          const filteredPosts = prevPosts.filter(post => post.id !== payload.old.id);
          setCurrentLimit(prev => Math.max(POSTS_PER_PAGE, prev - 1));
          return filteredPosts;
        });
      }

      if (payload.eventType === "UPDATE" && payload?.new?.id) {
        let updatedPost = { ...payload.new };
        let res = await getUserData(updatedPost.userId);
        updatedPost.user = res.success ? res.data : {};

        setPosts((prevPosts) => {
          if (!Array.isArray(prevPosts)) return [updatedPost];
          
          return prevPosts.map(post => 
            post.id === updatedPost.id ? { ...updatedPost } : { ...post }
          );
        });
      }
    } catch (error) {
      console.error("Error in handlePostEvent:", error);
    }
  }, []);

  const handleNotificationEvent = useCallback((payload) => {
    console.log("Real-time notification event:", payload);
    
    if (!payload || !payload.eventType || !user?.id) {
      console.warn("Invalid payload or user not available for notification event");
      return;
    }
    
    try {
      if (payload.eventType === "INSERT" && payload?.new) {
        const notification = payload.new;
        
        // Vérifier que la notification est bien pour l'utilisateur actuel
        if (notification.receiveId === user.id) {
          console.log("✅ Notification reçue pour l'utilisateur actuel:", notification);
          
          // Mettre à jour le compteur de notifications
          setNotificationCount(prev => prev + 1);
        } else {
          console.log("Notification pour un autre utilisateur, ignorée");
        }
      }
    } catch (error) {
      console.error("Error in handleNotificationEvent:", error);
    }
  }, [user?.id]);

  const setupRealtimeSubscriptions = useCallback(async () => {
    if (!user?.id) {
      console.log("❌ Utilisateur non connecté, impossible de s'abonner");
      return;
    }

    // Nettoyer les anciens canaux
    if (channelsRef.current.posts) {
      await supabase.removeChannel(channelsRef.current.posts);
    }
    if (channelsRef.current.notifications) {
      await supabase.removeChannel(channelsRef.current.notifications);
    }

    console.log("🚀 Configuration des abonnements temps réel pour:", user.id);

    try {
      // Canal pour les posts
      const postChannel = supabase
        .channel(`posts-${Date.now()}`)
        .on(
          "postgres_changes",
          { 
            event: "*", 
            schema: "public", 
            table: "posts" 
          },
          handlePostEvent
        )
        .subscribe((status) => {
          console.log("📡 Statut du canal posts:", status);
        });

      channelsRef.current.posts = postChannel;

      // Canal pour les notifications
      const notificationChannel = supabase
        .channel(`notifications-${user.id}-${Date.now()}`)
        .on(
          "postgres_changes",
          { 
            event: "INSERT", 
            schema: "public", 
            table: "notifications",
            filter: `receiveId=eq.${user.id}`
          },
          handleNotificationEvent
        )
        .subscribe((status) => {
          console.log("🔔 Statut du canal notifications:", status);
          if (status === 'SUBSCRIBED') {
            console.log("✅ Abonnement aux notifications réussi");
          } else if (status === 'CHANNEL_ERROR') {
            console.error("❌ Erreur d'abonnement aux notifications");
          }
        });

      channelsRef.current.notifications = notificationChannel;

    } catch (error) {
      console.error("❌ Erreur lors de la configuration des canaux:", error);
    }
  }, [user?.id, handlePostEvent, handleNotificationEvent]);

 const getPosts = useCallback(async (loadMore = false, isRefresh = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      if (loadMore) {
        setLoadingMore(true);
      } else if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const limitToFetch = loadMore
        ? currentLimit + POSTS_PER_PAGE
        : POSTS_PER_PAGE;

      let res = await fetchPosts(limitToFetch);

      if (res.success && Array.isArray(res.data)) {
        if (loadMore) {
          setPosts((prevPosts) => {
            const currentPosts = Array.isArray(prevPosts) ? prevPosts : [];
            const existingIds = new Set(currentPosts.map(post => post?.id).filter(Boolean));
            const newPosts = res.data.filter(post => post?.id && !existingIds.has(post.id));
            
            const allPosts = [...currentPosts, ...newPosts].sort((a, b) => 
              new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
            );
            
            return allPosts;
          });
          setCurrentLimit(limitToFetch);
        } else {
          const sortedPosts = res.data
            .filter(post => post && post.id)
            .sort((a, b) => 
              new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
            );
          setPosts(sortedPosts);
          setCurrentLimit(POSTS_PER_PAGE);
        }

        setHasMore(res.data.length === limitToFetch);
      } else {
        console.error("Error fetching posts:", res.msg);
        setHasMore(false);
        setPosts([]);
      }
    } catch (error) {
      console.error("Error in getPosts:", error);
      setHasMore(false);
      setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setLoading(false);
      setLoadingMore(false);
     setRefreshing(false);
    }
  }, [currentLimit]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (mounted && user?.id) {
        await setupRealtimeSubscriptions();
        await getPosts();
      }
    };

    initialize();

    return () => {
      mounted = false;
      console.log("🧹 Nettoyage des canaux temps réel");
      
      if (channelsRef.current.posts) {
        supabase.removeChannel(channelsRef.current.posts);
        channelsRef.current.posts = null;
      }
      if (channelsRef.current.notifications) {
        supabase.removeChannel(channelsRef.current.notifications);
        channelsRef.current.notifications = null;
      }
    };
  }, [user?.id, setupRealtimeSubscriptions, getPosts]);

  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMore && Array.isArray(posts) && posts.length >= POSTS_PER_PAGE) {
      getPosts(true);
    }
  }, [loadingMore, hasMore, posts, getPosts]);

  const onRefresh = useCallback(() => {
    setCurrentLimit(POSTS_PER_PAGE);
    setHasMore(true);
    getPosts(false, true);
  }, [getPosts]);

  const renderFooter = useCallback(() => {
    const postsArray = Array.isArray(posts) ? posts : [];
    
    if (postsArray.length === 0 && !loading) {
      return (
        <View style={styles.noPostsContainer}>
          <Text style={styles.noPosts}>Aucun post disponible</Text>
        </View>
      );
    }

    if (loading && postsArray.length === 0) {
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

    if (!hasMore && postsArray.length > 0) {
      return (
        <View style={styles.endContainer}>
          <Text style={styles.endText}>Vous avez vu tous les posts</Text>
        </View>
      );
    }

    return <View style={{ height: 30 }} />;
  }, [posts, loading, loadingMore, hasMore]);

  const renderPostItem = useCallback(({ item, index }) => {
    if (!item || typeof item !== 'object' || !item.id) {
      console.warn(`Invalid post item at index ${index}:`, item);
      return null;
    }

    return (
      <PostCard 
        item={item} 
        currentUser={user} 
        router={router} 
      />
    );
  }, [user, router]);

  const keyExtractor = useCallback((item, index) => {
    return item?.id ? `post-${item.id}` : `post-index-${index}`;
  }, []);

  // Vérification de sécurité pour les props
  const safeUser = user || {};
  const safePosts = Array.isArray(posts) ? posts : [];
  
  // Vérifications de sécurité pour theme
  const safeTheme = {
    colors: {
      primary: theme?.colors?.primary || '#007AFF',
      text: theme?.colors?.text || '#000000',
      textLight: theme?.colors?.textLight || '#666666',
      ...theme?.colors
    },
    radius: {
      sm: theme?.radius?.sm || 8,
      ...theme?.radius
    },
    fonts: {
      bold: theme?.fonts?.bold || 'bold',
      ...theme?.fonts
    }
  };

  // Valeurs par défaut sécurisées pour les dimensions
  const safeHp = (value) => hp(value) || 24;
  const safeWp = (value) => wp(value) || 16;

  return (
    <ScreenWrapper bg="#F3F8FF">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>netLink</Text>
          <View style={styles.icons}>
            <Pressable 
              onPress={() => {
                setNotificationCount(0); // Réinitialiser le compteur quand on clique
                router?.push && router.push("Notifications");
              }}
            >
              <View style={styles.notificationContainer}>
                <Icon
                  name="heart"
                  size={safeHp(3.2)}
                  strokeWidth={2}
                  color={safeTheme.colors.text}
                />
                {notificationCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
            <Pressable onPress={() => router?.push && router.push("NewPost")}>
              <Icon
                name="plus"
                size={safeHp(3.2)}
                strokeWidth={2}
                color={safeTheme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => router?.push && router.push("Profile")}>
              <Avatar
                uri={safeUser?.image}
                size={safeHp(4.3)}
                rounded={safeTheme.radius.sm}
                style={{ borderWidth: 2 }}
              />
            </Pressable>
          </View>
        </View>

        <FlatList
          data={safePosts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listStyle, { flexGrow: 1 }]}
          keyExtractor={keyExtractor}
          renderItem={renderPostItem}
          ListFooterComponent={renderFooter}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[safeTheme.colors.primary]}
              tintColor={safeTheme.colors.primary}
            />
          }
          removeClippedSubviews={false}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
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
    marginHorizontal: wp(4) || 16,
  },
  title: {
    color: theme?.colors?.text || '#000000',
    fontSize: hp(3.2) || 24,
    fontWeight: theme?.fonts?.bold || 'bold',
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4) || 16,
    flexGrow: 1,
    minHeight: 100,
  },
  noPosts: {
    fontSize: hp(2) || 16,
    textAlign: "center",
    color: theme?.colors?.text || '#000000',
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
    fontSize: hp(1.8) || 14,
    color: theme?.colors?.textLight || '#666666',
    textAlign: "center",
  },
  endContainer: {
    paddingVertical: 30,
    alignItems: "center",
  },
  endText: {
    fontSize: hp(1.8) || 14,
    color: theme?.colors?.textLight || '#666666',
    textAlign: "center",
    fontStyle: "italic",
  },
});