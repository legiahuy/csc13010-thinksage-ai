'use client';
import React, { useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/configs/firebaseConfig';
import { AuthContext } from './_context/AuthContext';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import PropTypes from 'prop-types';

function Provider({ children }) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState();
  const CreateUser = useMutation(api.users.CreateNewUser);

  // Only render contents when mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(user);
      setUser(user);
      if (user) {
        const result = await CreateUser({
          name: user?.displayName,
          email: user?.email,
          pictureURL: user?.photoURL,
        });
        console.log(result);
        setUser(result);
      }
    });
    return () => unsubscribe();
  }, [CreateUser]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Prevent hydration mismatch by only rendering after mounting
  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </AuthContext.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  return context;
};

export default Provider;
