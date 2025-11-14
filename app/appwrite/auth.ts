import { ID, OAuthProvider, Query } from "appwrite"
import { account, appwriteConfig, database } from "./client"
import { redirect } from "react-router"


export const loginWithGoogle = async () => {
     try {
      account.createOAuth2Session({
        provider: OAuthProvider.Google,
        success: "http://localhost:5173/dashboard",
        failure: "http://localhost:5173/sign-up",
        scopes: [
          "openid",
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile",
        ], 
      });
    } catch (err) {
      console.error("Google login failed:", err);
    }
}



export const logoutUser = async () => {
  try {
    await account.deleteSession("current");
    await new Promise(res => setTimeout(res, 300));
    const user = await account.get().catch(() => null);
    if (!user) {
      console.warn("Session not ready yet — retrying...");
      // redirect back to login or refresh
    }
    console.log("✅ User logged out");
    window.location.href = "/sign-in";
  } catch (e) {
    console.error("logout user error:", e);
  }
};


export const getUser = async (userId: string) => {
    try{
        const user = await account.get();
        
        if(!user) return redirect("/sign-in"); //need to change back to "/sign-in"
        const userId = user.$id

        const res = await database.listDocuments({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.userCollectionId,
            queries: [Query.equal("accountId", userId)],
        })

        return res.documents.length > 0 ? res.documents[0] : null;
    } catch (e){
        console.log(e)
    }
}


export const getGooglePic = async (): Promise<string | null> => {
  try {
    const session = await account.getSession("current");
    const oAuthToken = session?.providerAccessToken;

    if (!oAuthToken) {
      console.log("No Auth Token Available");
      return null;
    }

    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${oAuthToken}` },
    });

    if (!response.ok) {
      console.log("Failed to fetch profile photo", response);
      return null;
    }

    const data = await response.json();

    // ✅ Correct property name
    const photoUrl = data.picture || null;
    return photoUrl;
  } catch (e) {
    console.log("getGooglePic error:", e);
    return null;
  }
};


export const storageUserData = async () => {
  try {
    // 1️⃣ Get the currently logged-in Appwrite user
    const user = await account.get();
    if (!user) return null

    // 2️⃣ Check if this user already exists in your collection
    const { documents } = await database.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      queries: [Query.equal("accountId", user.$id)],  
    });


    if (documents.length > 0) {
      console.log("User already exists in collection ✅");
      return documents[0];
    }

    const imageUrl = await getGooglePic();

    const newUser = await database.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      documentId: ID.unique(),
      data: {
        accountId: user.$id,
        email: user.email,
        name: user.name,
        imageUrl: imageUrl || "",
        $createdAt: new Date().toISOString()
      },
    });

    console.log("✅ New user created:", newUser);
    return newUser;

  } catch (e) {
    console.error("storageUserData error:", e);
    return null;
  }
};


export const getExistingUser = async () => {
  try {
    // 1️⃣ Get current user session
    const user = await account.get().catch(() => null);
    if (!user) {
      console.log("⚠️ No active Appwrite user session found.");
      return null;
    }

    // 2️⃣ Sanity check for config values
    if (!appwriteConfig.databaseId || !appwriteConfig.userCollectionId) {
      throw new Error("Missing database or collection ID in config");
    }

    // 3️⃣ Query the collection for this user's record
    const { documents } = await database.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      queries: [Query.equal("accountId", user.$id)],
    });

    // 4️⃣ Return normalized result
    if (documents.length > 0) {
      const doc = documents[0];
      return {
        $id: doc.$id,
        accountId: doc.accountId,
        email: doc.email,
        name: doc.name,
        imageUrl: doc.imageUrl || "",
        createdAt: doc.joinedAt || "",
      };
    }

    console.log("ℹ️ No stored user record found, returning basic user info.");
    return {
      $id: "",
      accountId: user.$id,
      email: user.email,
      name: user.name,
    };
  } catch (e) {
    console.error("getExistingUser error:", e);
    return null;
  }
};

 
export const getAllUsers =  async (limit: number, offset: number) => {
  try {
    const {documents: users, total} = await database.listDocuments({
      databaseId : appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      queries: [Query.limit(limit), Query.offset(offset)]
    })

    if(total === 0) return {users: [], total}

    return {users, total}
  } catch (e){
    console.log("error fetching users")
    return {users: [], total: 0}
  }
}