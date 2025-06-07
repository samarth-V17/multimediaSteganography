
// Follow this setup guide to integrate the Deno runtime into your project:
// https://deno.land/manual/getting_started/javascript_typescript

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decode as decodeBase64, encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Safe byte offsets to avoid corrupting headers
const OFFSETS = {
  image: 10240, // Increased from 8192 to 10240 to avoid header corruption
  audio: {
    mp3: 10240, // Larger offset for MP3 files
    wav: 4096    // Standard offset for WAV files 
  },
  video: 32768  // Significantly increased from 16384 to 32768 to avoid video corruption
};

// Maximum message size (bytes)
const MAX_MESSAGE_SIZE = 65536; // 64KB

function embedMessageInImage(imageData: Uint8Array, message: string): Uint8Array {
  // Convert message to binary string
  const messageBinary = Array.from(message).map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
  
  const messageLength = message.length;
  const messageBitsLength = messageBinary.length;
  
  // Get appropriate offset
  const headerOffset = OFFSETS.image;
  
  console.log(`Image size: ${imageData.length} bytes, message length: ${messageLength} chars, bits: ${messageBitsLength}`);
  
  // Check if the message can fit within the image
  if (headerOffset + 32 + messageBitsLength > imageData.length) {
    throw new Error(`Message too large for this image. Need ${headerOffset + 32 + messageBitsLength} bytes, have ${imageData.length} bytes.`);
  }

  // Clone the image data
  const resultData = new Uint8Array(imageData);
  
  // First, embed the message length (32 bits for length)
  for (let i = 0; i < 32; i++) {
    const lengthBit = (messageLength >> i) & 1;
    const position = headerOffset + i;
    
    // Modified LSB setting to reduce visual distortion
    // Only change the bit if necessary
    if ((resultData[position] & 1) !== lengthBit) {
      resultData[position] = (resultData[position] & 0xFE) | lengthBit; 
    }
  }
  
  // Then embed the actual message bits with reduced visual impact
  for (let i = 0; i < messageBitsLength; i++) {
    const bit = parseInt(messageBinary[i]);
    const position = headerOffset + 32 + i; // Position after the length
    
    if (position >= resultData.length) {
      throw new Error("Message embedding exceeded file size");
    }
    
    // Only change the LSB if it's different from what we want to store
    // This reduces unnecessary modifications that cause visual artifacts
    if ((resultData[position] & 1) !== bit) {
      resultData[position] = (resultData[position] & 0xFE) | bit;
    }
  }
  
  console.log(`Image steganography completed. Modified ${messageBitsLength} bits starting at offset ${headerOffset}`);
  return resultData;
}

function embedMessageInAudio(audioData: Uint8Array, message: string, fileType: string): Uint8Array {
  // Convert message to binary
  const messageBinary = Array.from(message).map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
  
  const messageLength = message.length;
  
  // Determine header offset based on file type
  const headerOffset = fileType.includes("mp3") ? 
    OFFSETS.audio.mp3 : OFFSETS.audio.wav;
  
  console.log(`Audio size: ${audioData.length} bytes, message length: ${messageLength} chars, using offset: ${headerOffset}`);
  
  // For audio, we'll use every 4th byte to reduce audio distortion
  const stepSize = 4;
  const requiredBytes = headerOffset + (32 * stepSize) + (messageBinary.length * stepSize);
  
  if (requiredBytes > audioData.length) {
    throw new Error(`Message too large for this audio file. Need ${requiredBytes} bytes, have ${audioData.length} bytes.`);
  }

  // Clone the audio data
  const resultData = new Uint8Array(audioData);
  
  // First, embed the message length (32 bits for length)
  for (let i = 0; i < 32; i++) {
    const lengthBit = (messageLength >> i) & 1;
    const position = headerOffset + (i * stepSize);
    
    // Set the LSB according to our bit
    if (lengthBit === 1) {
      resultData[position] = (resultData[position] & 0xFE) | 1;
    } else {
      resultData[position] = resultData[position] & 0xFE;
    }
  }
  
  // Then embed the message bits
  for (let i = 0; i < messageBinary.length; i++) {
    const bit = parseInt(messageBinary[i]);
    const position = headerOffset + (32 * stepSize) + (i * stepSize);
    
    if (position >= resultData.length) {
      throw new Error("Message embedding exceeded file size");
    }
    
    if (bit === 1) {
      resultData[position] = (resultData[position] & 0xFE) | 1;
    } else {
      resultData[position] = resultData[position] & 0xFE;
    }
  }
  
  console.log(`Audio steganography completed. Modified bytes with step size ${stepSize} starting at offset ${headerOffset}`);
  return resultData;
}

function embedMessageInVideo(videoData: Uint8Array, message: string): Uint8Array {
  // Convert message to binary
  const messageBinary = Array.from(message).map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
  
  const messageLength = message.length;
  const headerOffset = OFFSETS.video;
  
  console.log(`Video size: ${videoData.length} bytes, message length: ${messageLength} chars`);
  
  if (headerOffset + 32 + messageBinary.length > videoData.length) {
    throw new Error(`Message too large for this video. Need ${headerOffset + 32 + messageBinary.length} bytes, have ${videoData.length} bytes.`);
  }

  // Clone the video data
  const resultData = new Uint8Array(videoData);
  
  // First, embed the message length (32 bits)
  for (let i = 0; i < 32; i++) {
    const lengthBit = (messageLength >> i) & 1;
    const position = headerOffset + i;
    
    // Only modify the LSB if necessary to reduce file corruption
    if ((resultData[position] & 1) !== lengthBit) {
      resultData[position] = (resultData[position] & 0xFE) | lengthBit;
    }
  }
  
  // Then embed the message bits using a step size to reduce visual distortion
  const stepSize = 4; // Use a step size to reduce file corruption
  
  for (let i = 0; i < messageBinary.length; i++) {
    const bit = parseInt(messageBinary[i]);
    const position = headerOffset + 32 + (i * stepSize);
    
    if (position >= resultData.length) {
      throw new Error("Message embedding exceeded file size");
    }
    
    // Only modify the LSB if necessary to reduce file corruption
    if ((resultData[position] & 1) !== bit) {
      resultData[position] = (resultData[position] & 0xFE) | bit;
    }
  }
  
  console.log(`Video steganography completed. Modified ${messageBinary.length} bits with step size ${stepSize} after ${headerOffset} offset`);
  return resultData;
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
    const { file, message, fileType } = await req.json();
    
    if (!file || !message) {
      return new Response(
        JSON.stringify({ error: "Missing file or message" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (message.length > MAX_MESSAGE_SIZE) {
      return new Response(
        JSON.stringify({ error: `Message too large. Maximum size is ${MAX_MESSAGE_SIZE} bytes.` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log(`Processing file of type: ${fileType}`);
    console.log(`Message length: ${message.length} characters (${message.length * 8} bits)`);
    
    // Decode base64 file data
    const binaryData = decodeBase64(file);
    console.log(`File size: ${binaryData.length} bytes`);
    
    // Process based on file type
    let resultData: Uint8Array;
    
    if (fileType.startsWith("image/")) {
      console.log("Using image steganography algorithm");
      try {
        resultData = embedMessageInImage(binaryData, message);
      } catch (err) {
        console.error("Image embedding error:", err.message);
        return new Response(
          JSON.stringify({ error: `Image embedding error: ${err.message}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else if (fileType.startsWith("audio/")) {
      console.log("Using audio steganography algorithm");
      try {
        resultData = embedMessageInAudio(binaryData, message, fileType);
      } catch (err) {
        console.error("Audio embedding error:", err.message);
        return new Response(
          JSON.stringify({ error: `Audio embedding error: ${err.message}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else if (fileType.startsWith("video/")) {
      console.log("Using video steganography algorithm");
      try {
        resultData = embedMessageInVideo(binaryData, message);
      } catch (err) {
        console.error("Video embedding error:", err.message);
        return new Response(
          JSON.stringify({ error: `Video embedding error: ${err.message}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported file type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Convert result back to base64
    const resultBase64 = encodeBase64(resultData);
    
    return new Response(
      JSON.stringify({ encryptedFile: resultBase64 }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in embed-message function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
