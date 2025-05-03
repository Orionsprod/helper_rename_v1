import { DEBUG } from "./rename_config.ts";
import { getAccessTokenFromServiceAccount } from "./rename_google_auth.ts";

export async function renameDriveFolder(folderId: string, newName: string): Promise<void> {
  const accessToken = await getAccessTokenFromServiceAccount();

  const url = "https://www.googleapis.com/drive/v3/files/" + folderId;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name: newName })
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("❌ Failed to rename folder:", error);
    throw new Error("Drive API Error: " + error);
  }

  if (DEBUG) console.log("✅ Folder renamed successfully:", folderId);
}
