/**
 * Google Workspace — read AND write access to the system's connected Google
 * account (Gmail, Drive, Calendar) from the dashboard. Backed by the
 * /api/google/* workspace endpoints; the connection itself is the same one
 * the AI knowledge index uses.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_API_URL } from "./api";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export interface GoogleStatus {
  configured: boolean;
  connected: boolean;
  hasWriteScopes: boolean;
  email: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  lastError: string | null;
  driveSynced: number;
  gmailSynced: number;
  indexedChunks: number;
}

export interface GmailMessageMeta {
  id: string;
  threadId: string;
  from: string | null;
  to: string | null;
  subject: string;
  date: string | null;
  snippet: string;
  unread: boolean;
}

export interface GmailMessageFull extends GmailMessageMeta {
  cc: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  parents?: string[];
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string | null;
  location?: string | null;
  start: string;
  end: string;
  allDay: boolean;
  htmlLink?: string;
}

export const googleWorkspaceApi = createApi({
  reducerPath: "googleWorkspaceApi",
  baseQuery,
  tagTypes: ["GoogleStatus", "Gmail", "Drive", "Calendar"],
  endpoints: (b) => ({
    getGoogleStatus: b.query<GoogleStatus, void>({
      query: () => "/api/google/status",
      providesTags: ["GoogleStatus"],
    }),

    // ── Gmail ────────────────────────────────────────────────────────────
    listGmail: b.query<
      { messages: GmailMessageMeta[]; nextPageToken?: string },
      { q?: string; label?: string; pageToken?: string }
    >({
      query: ({ q, label, pageToken }) => ({
        url: "/api/google/gmail/messages",
        params: {
          ...(q ? { q } : {}),
          ...(label ? { label } : {}),
          ...(pageToken ? { pageToken } : {}),
        },
      }),
      providesTags: ["Gmail"],
    }),
    getGmailMessage: b.query<{ message: GmailMessageFull }, string>({
      query: (id) => `/api/google/gmail/messages/${id}`,
    }),
    sendGmail: b.mutation<
      { success: boolean; message: string },
      { to: string; subject: string; body: string; cc?: string; bcc?: string }
    >({
      query: (body) => ({ url: "/api/google/gmail/send", method: "POST", body }),
      invalidatesTags: ["Gmail"],
    }),

    // ── Drive ────────────────────────────────────────────────────────────
    listDrive: b.query<
      { files: DriveFile[]; nextPageToken?: string },
      { folderId?: string; q?: string; pageToken?: string }
    >({
      query: ({ folderId, q, pageToken }) => ({
        url: "/api/google/drive/files",
        params: {
          ...(folderId ? { folderId } : {}),
          ...(q ? { q } : {}),
          ...(pageToken ? { pageToken } : {}),
        },
      }),
      providesTags: ["Drive"],
    }),
    uploadDriveFile: b.mutation<
      { success: boolean; file: DriveFile; message: string },
      { file: File; folderId: string }
    >({
      query: ({ file, folderId }) => {
        const form = new FormData();
        form.append("file", file);
        form.append("folderId", folderId);
        return { url: "/api/google/drive/upload", method: "POST", body: form };
      },
      invalidatesTags: ["Drive"],
    }),
    createDriveFolder: b.mutation<
      { success: boolean; file: DriveFile; message: string },
      { name: string; parentId: string }
    >({
      query: (body) => ({ url: "/api/google/drive/folders", method: "POST", body }),
      invalidatesTags: ["Drive"],
    }),
    createDriveDoc: b.mutation<
      { success: boolean; file: DriveFile; message: string },
      { type: "doc" | "sheet"; name: string; parentId: string }
    >({
      query: (body) => ({ url: "/api/google/drive/create", method: "POST", body }),
      invalidatesTags: ["Drive"],
    }),

    // ── Calendar ─────────────────────────────────────────────────────────
    listCalendar: b.query<{ events: CalendarEvent[] }, { days?: number }>({
      query: ({ days }) => ({
        url: "/api/google/calendar/events",
        params: days ? { days } : undefined,
      }),
      providesTags: ["Calendar"],
    }),
    createCalendarEvent: b.mutation<
      { success: boolean; message: string },
      { summary: string; description?: string; location?: string; start: string; end: string; allDay?: boolean }
    >({
      query: (body) => ({ url: "/api/google/calendar/events", method: "POST", body }),
      invalidatesTags: ["Calendar"],
    }),
  }),
});

/** Download a Drive file through the backend proxy (handles auth + Google-doc
 * export) and hand it to the browser as a normal file download. */
export async function downloadDriveFile(fileId: string, fallbackName: string) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  const r = await fetch(`${BASE_API_URL}/api/google/drive/files/${fileId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) {
    let detail = "Download failed";
    try { detail = (await r.json()).detail || detail; } catch { /* keep default */ }
    throw new Error(typeof detail === "string" ? detail : "Download failed");
  }
  const dispo = r.headers.get("Content-Disposition") || "";
  const nameMatch = dispo.match(/filename="([^"]+)"/);
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nameMatch?.[1] || fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const {
  useGetGoogleStatusQuery,
  useListGmailQuery,
  useGetGmailMessageQuery,
  useSendGmailMutation,
  useListDriveQuery,
  useUploadDriveFileMutation,
  useCreateDriveFolderMutation,
  useCreateDriveDocMutation,
  useListCalendarQuery,
  useCreateCalendarEventMutation,
} = googleWorkspaceApi;
