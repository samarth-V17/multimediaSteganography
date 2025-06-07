
// Follow this setup guide to integrate the Deno runtime into your project:
// https://deno.land/manual/getting_started/javascript_typescript

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decode as decodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Safe byte offsets to avoid corrupting headers
const OFFSETS = {
  image: 10240, // Increased to match embed-message offset
  audio: {
    mp3: 10240, // Larger offset for MP3 files
    wav: 4096    // Standard offset for WAV files 
  },
  video: 32768  // Increased to match embed-message offset
};

// Maximum message size (bytes)
const MAX_MESSAGE_SIZE = 65536; // 64KB

function extractMessageFromImage(imageData: Uint8Array): string {
  const headerOffset = OFFSETS.image;
  
  if (imageData.length <= headerOffset + 32) {
    throw new Error("Image too small to contain a hidden message");
  }
  
  // Extract the message length (32 bits = 4 bytes)
  let messageLength = 0;
  for (let i = 0; i < 32; i++) {
    const position = headerOffset + i;
    const bit = imageData[position] & 1;
    if (bit === 1) {
      messageLength |= (1 << i);
    }
  }
  
  console.log(`Extracted message length from image: ${messageLength} characters`);
  
  // Validate message length - ensure it's positive and reasonable
  if (messageLength <= 0 || messageLength > MAX_MESSAGE_SIZE) {
    throw new Error(`Invalid message length detected: ${messageLength}`);
  }
  
  const messageBitsLength = messageLength * 8;
  if (headerOffset + 32 + messageBitsLength > imageData.length) {
    throw new Error(`Message length exceeds file size. Needs ${headerOffset + 32 + messageBitsLength} bytes, have ${imageData.length} bytes.`);
  }
  
  // Extract the message bits
  let messageBinary = "";
  for (let i = 0; i < messageBitsLength; i++) {
    const position = headerOffset + 32 + i;
    if (position >= imageData.length) {
      console.warn(`Reached end of file at bit ${i} of ${messageBitsLength}`);
      break;
    }
    const bit = imageData[position] & 1;
    messageBinary += bit.toString();
  }
  
  // Convert binary to text
  let message = "";
  for (let i = 0; i < messageBinary.length; i += 8) {
    if (i + 8 > messageBinary.length) break;
    const byte = messageBinary.substring(i, i + 8);
    const charCode = parseInt(byte, 2);
    message += String.fromCharCode(charCode);
  }
  
  return message;
}

function extractMessageFromAudio(audioData: Uint8Array, fileType: string): string {
  // Determine header offset based on file type
  const headerOffset = fileType.includes("mp3") ? 
    OFFSETS.audio.mp3 : OFFSETS.audio.wav;
  
  if (audioData.length <= headerOffset + 128) {
    throw new Error("Audio file too small to contain hidden message");
  }
  
  // For audio, we used every 4th byte
  const stepSize = 4;
  
  // Extract the message length (32 bits)
  let messageLength = 0;
  for (let i = 0; i < 32; i++) {
    const position = headerOffset + (i * stepSize);
    if (position >= audioData.length) {
      throw new Error("Audio file truncated, can't read message length");
    }
    
    const bit = audioData[position] & 1;
    if (bit === 1) {
      messageLength |= (1 << i);
    }
  }
  
  console.log(`Extracted message length from audio: ${messageLength} characters`);
  
  // Validate message length
  if (messageLength <= 0 || messageLength > MAX_MESSAGE_SIZE) {
    throw new Error(`Invalid message length detected: ${messageLength}`);
  }
  
  const requiredBytes = headerOffset + (32 * stepSize) + (messageLength * 8 * stepSize);
  if (requiredBytes > audioData.length) {
    throw new Error(`Message length exceeds file size. Needs ${requiredBytes} bytes, have ${audioData.length} bytes.`);
  }
  
  // Extract the message bits
  let messageBinary = "";
  for (let i = 0; i < messageLength * 8; i++) {
    const position = headerOffset + (32 * stepSize) + (i * stepSize);
    if (position >= audioData.length) {
      console.warn(`Reached end of file at bit ${i} of ${messageLength * 8}`);
      break;
    }
    const bit = audioData[position] & 1;
    messageBinary += bit.toString();
  }
  
  // Convert binary to text
  let message = "";
  for (let i = 0; i < messageBinary.length; i += 8) {
    if (i + 8 > messageBinary.length) break;
    const byte = messageBinary.substring(i, i + 8);
    const charCode = parseInt(byte, 2);
    message += String.fromCharCode(charCode);
  }
  
  return message;
}

function extractMessageFromVideo(videoData: Uint8Array): string {
  const headerOffset = OFFSETS.video;
  
  if (videoData.length <= headerOffset + 32) {
    throw new Error("Video file too small to contain hidden message");
  }
  
  // Extract the message length
  let messageLength = 0;
  for (let i = 0; i < 32; i++) {
    const position = headerOffset + i;
    if (position >= videoData.length) {
      throw new Error("Video file truncated, can't read message length");
    }
    
    const bit = videoData[position] & 1;
    if (bit === 1) {
      messageLength |= (1 << i);
    }
  }
  
  console.log(`Extracted message length from video: ${messageLength} characters`);
  
  // Validate message length
  if (messageLength <= 0 || messageLength > MAX_MESSAGE_SIZE) {
    throw new Error(`Invalid message length detected: ${messageLength}`);
  }
  
  // For videos, we used a step size like we did for audio
  const stepSize = 4;
  const requiredBytes = headerOffset + 32 + (messageLength * 8 * stepSize);
  
  if (requiredBytes > videoData.length) {
    throw new Error(`Message length exceeds file size. Needs ${requiredBytes} bytes, have ${videoData.length} bytes.`);
  }
  
  // Extract the message bits
  let messageBinary = "";
  for (let i = 0; i < messageLength * 8; i++) {
    const position = headerOffset + 32 + (i * stepSize);
    if (position >= videoData.length) {
      console.warn(`Reached end of file at bit ${i} of ${messageLength * 8}`);
      break;
    }
    
    const bit = videoData[position] & 1;
    messageBinary += bit.toString();
  }
  
  // Convert binary to text
  let message = "";
  for (let i = 0; i < messageBinary.length; i += 8) {
    if (i + 8 > messageBinary.length) break;
    const byte = messageBinary.substring(i, i + 8);
    const charCode = parseInt(byte, 2);
    message += String.fromCharCode(charCode);
  }
  
  return message;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No content
      headers: corsHeaders,
    });
  }
  
  try {
    const { file, fileType } = await req.json();
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: "Missing file" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log(`Extracting from file of type: ${fileType}`);
    
    // Decode base64 file data
    const binaryData = decodeBase64(file);
    console.log(`File size: ${binaryData.length} bytes`);
    
    // Process based on file type
    let message: string;
    
    try {
      if (fileType.startsWith("image/")) {
        console.log("Using image steganography extraction algorithm");
        message = extractMessageFromImage(binaryData);
      } else if (fileType.startsWith("audio/")) {
        console.log("Using audio steganography extraction algorithm");
        message = extractMessageFromAudio(binaryData, fileType);
      } else if (fileType.startsWith("video/")) {
        console.log("Using video steganography extraction algorithm");
        message = extractMessageFromVideo(binaryData);
      } else {
        return new Response(
          JSON.stringify({ error: "Unsupported file type" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verify that we have a valid message
      if (!message || message.trim() === '') {
        return new Response(
          JSON.stringify({ error: "No hidden message found in file" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (err) {
      console.error("Extraction error:", err.message);
      return new Response(
        JSON.stringify({ error: err.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ message }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in extract-message function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
