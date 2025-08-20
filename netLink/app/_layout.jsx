import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUserData } from '../services/UserService';

// ⚡️ le layout racine
export default function RootLayout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

function MainLayout() {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    console.log('session user:', session?.user?.id);
    setAuth(session?.user || null);

    if (session) {
      setAuth(session?.user)
      updateUserData(session?.user, session?.user?.email);
      router.replace('/Home');
    } else {
      setAuth(null);
      router.replace('/Welcome');
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

  const updateUserData = async (user, email)=> {
    let res = await getUserData(user?.id);
    // console.log('got user data: ', res)
    if(res.success) setUserData({...res.data, email});
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="Welcome" />
      </Stack>
    </SafeAreaProvider>
  );
}
