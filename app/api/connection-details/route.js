import { AccessToken, VideoGrant } from "livekit-server-sdk";
import { NextResponse } from "next/server";

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// don't cache the results
export const revalidate = 0;

export async function GET() {
  try {
    if (!LIVEKIT_URL) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (!API_KEY) {
      throw new Error("LIVEKIT_API_KEY is not defined");
    }
    if (!API_SECRET) {
      throw new Error("LIVEKIT_API_SECRET is not defined");
    }

    // Generate participant token
    const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10000)}`;
    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10000)}`;
    const participantToken = createParticipantToken(
      { identity: participantIdentity },
      roomName
    );

    // Return connection details
    const data = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken,
      participantName: participantIdentity,
    };

    const headers = new Headers({
      "Cache-Control": "no-store",
    });
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error(error);
    return new NextResponse(error.message, { status: 500 });
  }
}

function createParticipantToken(userInfo, roomName) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: "15m",
  });
  const grant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
}