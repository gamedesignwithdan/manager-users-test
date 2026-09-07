import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Connect to the named database to match the client
const db = getFirestore("manage-users-db");

/**
 * Cloud Function to delete a user from the 'users' collection in Firestore.
 * Expects a payload with { userId: string }.
 */
export const deleteUser = onCall({cors: true}, async (request) => {
  const {userId} = request.data || {};

  if (!userId || typeof userId !== "string") {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a valid 'userId' string."
    );
  }

  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new HttpsError(
        "not-found",
        `User with ID ${userId} does not exist.`
      );
    }

    await userRef.delete();

    return {
      success: true,
      message: `User ${userId} successfully removed.`,
      userId,
    };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      `Failed to remove user: ${(error as Error).message}`
    );
  }
});
