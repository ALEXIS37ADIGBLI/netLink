import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ⚡️ le layout racine
export default function RootLayout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

function MainLayout() {
  const { setAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('session user:', session?.user?.id);
        setAuth(session?.user || null); // <-- important: mettre à jour ton contexte
        if(session){
          //dirigé vers la page home
          setAuth(session?.user)
          //mettre le auth
          router.replace('/Home');
        } else {
          //mettre auth à null
          setAuth(null)
          // rediriger vers la page d'acceuil
          router.replace('/Welcome');
        }
      }
    );

    return () => subscription?.unsubscribe(); // cleanup
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="Welcome" />
      </Stack>
    </SafeAreaProvider>
  );
}
