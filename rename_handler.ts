import { getPageTitle, getFolderIdFromPage } from "./rename_notion.ts";
import { renameDriveFolder } from "./rename_drive.ts";
import { DEBUG } from "./rename_config.ts";

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const pageId = body.data?.id;

    if (!pageId) {
      console.error("❌ Missing pageId in webhook payload:", JSON.stringify(body, null, 2));
      return new Response("Bad Request: Missing pageId", { status: 400 });
    }

    if (DEBUG) console.log("📩 Webhook received to rename folder for page ID:", pageId);

    const newName = await getPageTitle(pageId);
    const folderId = await getFolderIdFromPage(pageId);
    await renameDriveFolder(folderId, newName);

    return new Response("✅ Folder rename successful", { status: 200 });
  } catch (e) {
    console.error("🔥 Error in rename webhook handler:");
    console.error(e?.message || e);
    if (e?.stack) console.error(e.stack);
    return new Response("Internal Server Error", { status: 500 });
  }
});
