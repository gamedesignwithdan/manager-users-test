import { Injectable, OnDestroy } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

interface DeleteUserResponse {
  success: boolean;
  message: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  private app = getApps().length === 0 ? initializeApp(environment) : getApp();
  private db = getFirestore(this.app, 'manage-users-db');
  private functions = getFunctions(this.app, 'us-central1');
  private usersCol = collection(this.db, 'users');
  private snapshotUnsubscribe: Unsubscribe | null = null;

  /**
   * Listen to real-time updates of users.
   * Stores the Firestore unsubscribe handle so it is cleaned up on service destroy.
   */
  getUsers(): Observable<User[]> {
    return new Observable<User[]>((observer) => {
      const q = query(this.usersCol, orderBy('createdAt', 'desc'));
      this.snapshotUnsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: User[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              username: data['username'] || '',
              role: data['role'] || 'Viewer',
              status: data['status'] || 'active',
              createdAt: data['createdAt']?.toDate?.() ?? null,
              updatedAt: data['updatedAt']?.toDate?.() ?? null
            };
          });
          observer.next(list);
        },
        (error) => observer.error(error)
      );

      return () => {
        this.snapshotUnsubscribe?.();
        this.snapshotUnsubscribe = null;
      };
    });
  }

  /**
   * Add a new user with creation timestamp.
   */
  async addUser(username: string, role: string): Promise<string> {
    const docRef = await addDoc(this.usersCol, {
      username: username.trim(),
      role,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  /**
   * Update existing user fields.
   */
  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(this.db, 'users', id);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Delete user via Firebase Cloud Function (Admin SDK).
   */
  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    const deleteCallable = httpsCallable<{ userId: string }, DeleteUserResponse>(
      this.functions,
      'deleteUser'
    );
    const res = await deleteCallable({ userId });
    return res.data;
  }

  ngOnDestroy(): void {
    this.snapshotUnsubscribe?.();
  }
}
