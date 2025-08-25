import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { creaComment, fetchPostDetails, removeComment } from '../../services/postService';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import PostCard from '../../components/PostCard';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import Put from "../../components/Put";
import Icon from '../../assets/icons';
import CommentItem from '../../components/CommentItem';
import { supabase } from '../../lib/supabase';
import { getUserData } from '../../services/UserService';

const PostDetails = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { postId } = useLocalSearchParams();
  console.log('got postId', postId);

  const [startLoading, setStartLoading] = useState(true);
  const inputRef = useRef(null);
  const commentRef = useRef('');
  const [loading, setLoading] = useState(false);

  const [post, setPost] = useState(null);

  // Gestion des events commentaires
  const handleCommentEvent = async (payload) => {
    console.log("Real-time comment event:", payload);

    if (payload.eventType === "INSERT" && payload?.new?.id) {
      let newComment = { ...payload.new };

      // Récupérer les infos user du commentaire
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};

      // Mettre à jour les commentaires dans le post
      setPost(prevPost => {
        if (!prevPost) return prevPost;
        
        const updatedPost = { ...prevPost };
        
        // Vérifier si le commentaire existe déjà
        const commentExists = updatedPost.comments?.find(c => c.id === newComment.id);
        if (commentExists) return prevPost;
        
        // Ajouter le nouveau commentaire en haut de la liste
        updatedPost.comments = [newComment, ...(updatedPost.comments || [])];
        
        return updatedPost;
      });
    }

    if (payload.eventType === "DELETE" && payload?.old?.id) {
      // Gérer la suppression en temps réel
      setPost(prevPost => {
        if (!prevPost) return prevPost;
        
        const updatedPost = { ...prevPost };
        updatedPost.comments = updatedPost.comments?.filter(c => c.id !== payload.old.id) || [];
        
        return updatedPost;
      });
    }
  };

  useEffect(() => {
    const commentChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "*", // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "comments",
          filter: `postId=eq.${postId}`,
        },
        handleCommentEvent
      )
      .subscribe();

    getPostDetails(); // Charger les commentaires existants

    return () => {
      supabase.removeChannel(commentChannel);
    };
  }, [postId]);

  const getPostDetails = async () => {
    // Trouver les détails du post
    let res = await fetchPostDetails(postId);
    if (res.success) setPost(res.data);
    setStartLoading(false);
  }

  const onDeleteComment = async (comment) => {
    let res = await removeComment(comment?.id);
    if (res.success) {
      // La suppression sera gérée par l'événement en temps réel
      // Mais on peut garder cette logique comme fallback
      setPost(prevPost => {
        if (!prevPost) return prevPost;
        let updatedPost = { ...prevPost };
        updatedPost.comments = updatedPost.comments.filter(c => c.id != comment.id);
        return updatedPost;
      });
    } else {
      Alert.alert('Commentaire:', res.msg);
    }
  }

  const onNewComment = async () => {
    if (!commentRef.current) return null;
    
    let data = {
      userId: user?.id,
      postId: post?.id,
      text: commentRef.current
    }

    // Créer un commentaire
    setLoading(true);
    let res = await creaComment(data);
    setLoading(false);

    if (res.success) {
      // Le nouveau commentaire sera ajouté automatiquement via l'événement temps réel
      // Logique pour envoyer une notification au créateur de post
      inputRef?.current?.clear();
      commentRef.current = "";
    } else {
      Alert.alert('Comment', res.msg);
    }
  }

  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    )
  }

  if (!post) {
    return (
      <View style={[styles.center, { justifyContent: 'flex-start', marginTop: 100 }]}>
        <Text style={styles.notFound}>
          Post non trouvé
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <PostCard 
          item={{ ...post, comments: [{ count: post?.comments?.length }] }}
          currentUser={user}
          router={router}
          hasShadow={false}
          showMoreIcon={false}
        />
        
        <View style={styles.inputContainer}>
          <Put
            inputRef={inputRef}
            placeholder="Écrivez quelque chose ..."
            onChangeText={value => commentRef.current = value}
            placeholderTextColor={theme.colors.textLight}
            containerStyle={{
              flex: 1,
              height: hp(6.2),
              borderRadius: theme.radius.xl,
            }}
            inputStyle={{
              fontSize: hp(1.8),
              color: theme.colors.text,
            }}
          />

          {
            loading ? (
              <View style={styles.loading}>
                <Loading size='small' />
              </View>
            ) : (
              <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
                <Icon name="send" color={theme.colors.primary} />
              </TouchableOpacity>
            )
          }
        </View>

        <View style={{ marginVertical: 15, gap: 17 }}>
          {
            post?.comments?.map(comment => 
              <CommentItem 
                key={comment?.id?.toString()}
                item={comment}
                onDelete={onDeleteComment}
                canDelete={user.id === comment.userId || user.id === post.userId}
              />
            )
          }

          {
            post?.comments?.length === 0 && (
              <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
                Soyez le premier à commenter
              </Text>
            )
          }
        </View>
      </ScrollView>
    </View>
  )
}

export default PostDetails

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F8FF',
    paddingVertical: wp(7),
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },

  list: {
    paddingHorizontal: wp(4),
  },

  sendIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    height: hp(5.8),
    width: hp(5.8),
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },

  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1.3 }],
  }
})