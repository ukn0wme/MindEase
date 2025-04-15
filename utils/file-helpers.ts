import { supabase } from "./supabase"

export const getFileUrl = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage.from("todo_attachments").createSignedUrl(filePath, 60) // 60 seconds expiry

    if (error) throw error
    return data.signedUrl
  } catch (error) {
    console.error("Error getting file URL:", error)
    return null
  }
}

export const getFileSize = (sizeInBytes: number) => {
  if (sizeInBytes < 1024) return `${sizeInBytes} B`
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
}

export const getFileIcon = (contentType: string) => {
  if (contentType.startsWith("image/")) return "image"
  if (contentType.startsWith("video/")) return "video"
  if (contentType.startsWith("audio/")) return "audio"
  if (contentType.includes("pdf")) return "file-text"
  if (contentType.includes("word") || contentType.includes("document")) return "file-text"
  if (contentType.includes("excel") || contentType.includes("spreadsheet")) return "file-spreadsheet"
  if (contentType.includes("presentation") || contentType.includes("powerpoint")) return "file-presentation"
  return "file"
}
