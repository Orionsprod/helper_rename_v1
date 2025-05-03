import { NOTION_TOKEN, DEBUG } from "./rename_config.ts";

export async function getPageTitle(pageId: string): Promise<string> {
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
  if (titleProp?.title?.[0]?.text?.content) {
    const title = titleProp.title[0].text.content;
    if (DEBUG) console.log("✅ Page title fetched:", title);
    return title;
  } else {
    throw new Error("❌ Could not extract title from Notion page.");
  }
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
    throw new Error("❌ Master Folder URL is empty or missing.");
  }

  const match = folderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (!match || !match[1]) {
    throw new Error("❌ Failed to extract folder ID from Master Folder URL.");
  }

  if (DEBUG) console.log("✅ Extracted folderId from URL:", match[1]);
  return match[1];
}
