import { findById } from "../models/userModel.js";

const ZOOM_AUTH_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE = "https://api.zoom.us/v2";

/**
 * Récupère un token d'accès Zoom pour un enseignant
 * @param {number} teacherId 
 */
async function getZoomAccessToken(teacherId) {
  const teacher = await findById(teacherId);
  if (!teacher || !teacher.zoom_api_key || !teacher.zoom_api_secret || !teacher.zoom_account_id) {
    return null;
  }

  const auth = Buffer.from(`${teacher.zoom_api_key}:${teacher.zoom_api_secret}`).toString("base64");
  
  try {
    const res = await fetch(`${ZOOM_AUTH_URL}?grant_type=account_credentials&account_id=${teacher.zoom_account_id}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Zoom Auth Error Details (Text):", errText);
      try {
        const errJson = JSON.parse(errText);
        console.error("Zoom Auth Error Details (JSON):", JSON.stringify(errJson, null, 2));
      } catch (e) {
        // Not JSON
      }
      return null;
    }

    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error("Zoom Auth Exception:", error);
    return null;
  }
}

/**
 * Crée une réunion Zoom pour un cours
 * @param {number} teacherId 
 * @param {object} courseData 
 */
export async function createZoomMeeting(teacherId, { title, description, start_time, duration }) {
  const token = await getZoomAccessToken(teacherId);
  if (!token) return null;

  // S'assurer que la date est au format ISO 8601 (UTC)
  let isoStartTime = start_time;
  if (start_time instanceof Date) {
    isoStartTime = start_time.toISOString();
  } else if (typeof start_time === "string") {
    isoStartTime = new Date(start_time).toISOString();
  }

  try {
    const res = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: title,
        type: 2, // Réunion planifiée
        start_time: isoStartTime,
        duration: duration || 60,
        agenda: description,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Zoom Meeting Creation Error Details (Text):", errText);
      try {
        const errJson = JSON.parse(errText);
        console.error("Zoom Meeting Creation Error Details (JSON):", JSON.stringify(errJson, null, 2));
      } catch (e) {
        // Not JSON
      }
      return null;
    }

    const data = await res.json();
    return {
      meeting_id: data.id.toString(),
      join_url: data.join_url,
      start_url: data.start_url,
    };
  } catch (error) {
    console.error("Zoom Meeting Creation Exception:", error);
    return null;
  }
}

/**
 * Supprime une réunion Zoom
 * @param {number} teacherId 
 * @param {string} meetingId 
 */
export async function deleteZoomMeeting(teacherId, meetingId) {
  if (!meetingId) return false;
  
  const token = await getZoomAccessToken(teacherId);
  if (!token) return false;

  try {
    const res = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Zoom Meeting Deletion Error (${meetingId}):`, errText);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Zoom Meeting Deletion Exception (${meetingId}):`, error);
    return false;
  }
}
