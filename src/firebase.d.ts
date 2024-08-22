declare module '@/firebase.js' {
    import { FirebaseApp, FirebaseOptions } from 'firebase/app';
    import { Firestore } from 'firebase/firestore';
  
    const firebaseConfig: FirebaseOptions;
    const app: FirebaseApp;
    const db: Firestore;
  
    export { firebaseConfig, app, db };
  }