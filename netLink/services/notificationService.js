import { supabase } from "../lib/supabase";

export const createNotification = async (notification) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.log("notification error: ", error);
      return { success: false, msg: "oups une erreur inconnu" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.log("notification error: ", error);
    return { success: false, msg: "oups une erreur inconnue" };
  }
};

export const fetchNotifications = async (receiverId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        sender: senderId (id, name, image)
      `)
      .eq('receiveId', receiverId) // Utilisez le bon nom de colonne
      .order("created_at", { ascending: false });

    if (error) {
      console.log("fetchNotification error: ", error);
      return { success: false, msg: "Could not fetch notifications" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.log("fetchNotification error: ", error);
    return { success: false, msg: "Could not fetch notifications" };
  }
};