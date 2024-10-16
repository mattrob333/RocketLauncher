declare module '@/firebase' {
  import { FirebaseApp } from 'firebase/app';
  import { Firestore } from 'firebase/firestore';
  import { FirebaseStorage } from 'firebase/storage';

  const firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  const app: FirebaseApp;
  const db: Firestore;
  const storage: FirebaseStorage;

  export { firebaseConfig, app, db, storage };
}
