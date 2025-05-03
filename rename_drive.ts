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

export async function folderExistsUnderRoots(folderId: string, roots: string[]): Promise<boolean> {
  const accessToken = await getAccessTokenFromServiceAccount();

  for (const rootId of roots) {
    if (DEBUG) console.log("🔍 Searching under root:", rootId);
    const found = await findFolderRecursively(folderId, rootId, accessToken);
    if (found) return true;
  }

  return false;
}

async function findFolderRecursively(targetId: string, parentId: string, token: string): Promise<boolean> {
  const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=1000`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("❌ Failed to list folders:", error);
    return false;
  }

  const data = await res.json();
  for (const file of data.files) {
    if (file.id === targetId) {
      if (DEBUG) console.log("✅ Folder found:", file.name);
      return true;
    }
    // Recurse into subfolder
    const foundInChild = await findFolderRecursively(targetId, file.id, token);
    if (foundInChild) return true;
  }

  return false;
}
