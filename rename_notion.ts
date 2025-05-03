import { NOTION_TOKEN, DEBUG } from "./rename_config.ts";

export async function getTitleWithPreservedPrefix(pageId: string): Promise<string> {
  const url = `https://api.notion.com/v1/pages/${pageId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Failed to fetch Notion page:", JSON.stringify(data));
    throw new Error("Notion API Error");
  }

  const titleProp = data.properties["Project Name"];
  if (!titleProp?.title?.[0]?.text?.content) {
    throw new Error("Project Name is missing.");
  }

  const fullTitle = titleProp.title[0].text.content;
  const match = fullTitle.match(/^(\d{3}_)(.*)$/);
  const prefix = match ? match[1] : null;
  const rawTitle = match ? match[2] : fullTitle;

  if (!prefix) {
    console.warn("⚠️ No prefix found in title. Skipping rename.");
    return fullTitle;
  }

  const cleanedTitle = rawTitle.trim().replace(/^\d{3}_/, "").trim();
  const rebuiltTitle = `${prefix}${cleanedTitle}`;

  if (DEBUG) console.log("✅ Rebuilt title:", rebuiltTitle);

  return rebuiltTitle;
}

export async function updateProjectTitle(pageId: string, newTitle: string): Promise<void> {
  const url = `https://api.notion.com/v1/pages/${pageId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      properties: {
        "Project Name": {
          title: [{ text: { content: newTitle } }],
        },
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("❌ Failed to update Project Name title:", error);
    throw new Error("Could not update Project Name title.");
  }

  if (DEBUG) console.log("✅ Project Name title updated in Notion.");
}

export async function getFolderIdFromPage(pageId: string): Promise<string> {
  const url = `https://api.notion.com/v1/pages/${pageId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Failed to fetch Notion page:", JSON.stringify(data));
    throw new Error("Notion API Error");
  }

  const folderUrl = data.properties["Project Folder"]?.url;

  if (!folderUrl) {
    if (DEBUG) console.log("⚠️ Project Folder URL is missing — skipping.");
    return "";
  }

  const match = folderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (!match || !match[1]) {
    throw new Error("❌ Failed to extract folder ID from Project Folder URL.");
  }

  if (DEBUG) console.log("✅ Extracted folderId from URL:", match[1]);
  return match[1];
}
