import {
    AccessToken,
    VideoGrant,
  } from "livekit-server-sdk";
  import { NextResponse } from "next/server";
  
  const API_KEY = process.env.LIVEKIT_API_KEY;
  const API_SECRET = process.env.LIVEKIT_API_SECRET;
  const LIVEKIT_URL = process.env.LIVEKIT_URL;
  
  export const revalidate = 0;
  
  export async function GET() {
    try {
      if (!LIVEKIT_URL) throw new Error("LIVEKIT_URL is not defined");
      if (!API_KEY) throw new Error("LIVEKIT_API_KEY is not defined");
      if (!API_SECRET) throw new Error("LIVEKIT_API_SECRET is not defined");
  
      const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10000)}`;
      const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10000)}`;
      const participantToken = createParticipantToken(participantIdentity, roomName);
  
      const data = {
        serverUrl: LIVEKIT_URL,
        roomName,
        participantToken,
        participantName: participantIdentity,
      };
      
      return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
  
  function createParticipantToken(identity, roomName) {
    const at = new AccessToken(API_KEY, API_SECRET, { identity, ttl: "15m" });
    at.addGrant(new VideoGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    }));
    return at.toJwt();
  }
  