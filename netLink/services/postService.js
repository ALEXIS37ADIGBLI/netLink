import { supabase } from "../lib/supabase";
import { uploadFile } from "./ImageService";

export const createOrUpdatePost = async (post) => {
  try {
    if (post.file && typeof post.file === "object") {
      let isImage = post?.file?.type === "image";
      let folderName = isImage ? "postImages" : "postVideos";
      let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
      if (fileResult.success) post.file = fileResult.data;
      else {
        return fileResult;
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .upsert(post)
      .select()
      .single();

    if (error) {
      console.log("createPost error: ", error);
      return { success: false, msg: "Could not create your post" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("createPost error: ", error);
    return { success: false, msg: "Could not create your post" };
  }
};

export const fetchPosts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
                *,
                user: users (id, name, image),
                postLikes (*)
            `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.log("fetchPosts error: ", error);
      return { success: false, msg: "Could not fetch  posts" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.log("fetchPosts error: ", error);
    return { success: false, msg: "Could not fetch  posts" };
  }
};

export const createPostLike = async (postLike) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .insert(postLike)
      .select()
      .single();

    if (error) {
      console.log("Posts like error: ", error);
      return { success: false, msg: "Could not like the post" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.log("LikePosts error: ", error);
    return { success: false, msg: "Could not like posts" };
  }
};

export const removePostLike = async (postId, userId) => {
  try {
    const { error } = await supabase
      .from("postLikes")
      .delete()
      .eq("userId", userId)
      .eq("postId", postId);

    if (error) {
      console.log("Posts like error: ", error);
      return { success: false, msg: "Could not remove like the post" };
    }

    return { success: true };
  } catch (error) {
    console.log("LikePosts error: ", error);
    return { success: false, msg: "Could not remove like posts" };
  }
};
