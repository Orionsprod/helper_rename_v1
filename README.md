# 🔁 Notion + Google Drive: Auto-Rename Folders

This automation updates the name of a Google Drive folder to match the current title of a Notion page.

---

## ✅ How It Works

1. Notion page is edited (title changes)
2. Webhook fires to Deno Deploy (this script)
3. Script:
   - Extracts `pageId` from payload
   - Looks up the current page title (`Project Name`)
   - Reads the existing folder URL from `Master Folder`
   - Extracts the Drive `folderId`
   - Sends a `PATCH` to update folder name

---

## 🧱 Environment Variables

| Key                         | Description                              |
|-----------------------------|------------------------------------------|
| `NOTION_TOKEN`              | Notion integration token                 |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Raw service account JSON               |
| `DEBUG`                     | Set `true` to see logs                   |

---

## 🔄 Webhook Format

Send a webhook with this body:

```json
{
  "data": {
    "id": "<pageId>"
  }
}
```

---

## 💡 Tip

Make sure your service account has **Editor access** to the Drive folder, and that `Master Folder` is correctly filled in the Notion page.
