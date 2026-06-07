import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');

const facebookProvider = new FacebookAuthProvider();

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory.
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      try {
        const token = cachedAccessToken || await user.getIdToken();
        cachedAccessToken = token;
        
        try {
          localStorage.setItem('pulse_cached_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }));
          localStorage.setItem('pulse_cached_token', token);
        } catch (storageErr) {
          console.error('Failed to write authentication cache:', storageErr);
        }

        if (onAuthSuccess) onAuthSuccess(user, token);
      } catch (e) {
        console.error('Failed to retrieve token during session restore', e);
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      try {
        localStorage.removeItem('pulse_cached_user');
        localStorage.removeItem('pulse_cached_token');
      } catch (storageErr) {
        console.error('Failed to clear authentication cache:', storageErr);
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    
    // Log user to Firestore
    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Failed to log user to Firestore:", e);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const facebookSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, facebookProvider);
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || (await result.user.getIdToken());

    cachedAccessToken = accessToken;
    
    // Log user to Firestore
    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Failed to log user to Firestore:", e);
    }

    return { user: result.user, accessToken };
  } catch (error: any) {
    console.error('Facebook sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const emailSignUp = async (email: string, password: string, displayName: string): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile display name inside Auth profile
    await updateProfile(result.user, { displayName });
    
    const token = await result.user.getIdToken();
    cachedAccessToken = token;

    // Log user to Firestore
    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName,
        photoURL: null,
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Failed to log user to Firestore:", e);
    }

    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Email sign up error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const emailSignIn = async (email: string, password: string): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();
    cachedAccessToken = token;

    // Log user to Firestore
    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Failed to log user to Firestore:", e);
    }

    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Email sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  try {
    localStorage.removeItem('pulse_cached_user');
    localStorage.removeItem('pulse_cached_token');
  } catch (e) {
    console.error('Failed to clear cached user items on logout:', e);
  }
};
