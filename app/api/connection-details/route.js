import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

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

    const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10000)}`;
    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10000)}`;

    // Await the token generation
    const participantToken = await createParticipantToken({ identity: participantIdentity }, roomName);

    const data = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken, // Now a valid string
      participantName: participantIdentity,
    };

    const headers = new Headers({
      "Cache-Control": "no-store",
    });
    console.log("Generated token:", participantToken);
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error(error);
    return new NextResponse(error.message, { status: 500 });
  }
}


async function createParticipantToken(userInfo, roomName) {
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
  // Await the token if toJwt() returns a promise
  const token = await at.toJwt();
  return token;
}

