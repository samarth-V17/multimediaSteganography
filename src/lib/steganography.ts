
import { supabase } from "@/integrations/supabase/client";

// Function to encrypt a message into a file
export async function encryptMessageIntoFile(file: File, message: string): Promise<Blob | null> {
  try {
    console.log(`Starting encryption process for ${file.type} with message length: ${message.length} characters`);
    
    // Convert file to base64
    const base64File = await fileToBase64(file);
    
    // Call the edge function to embed the message
    const { data, error } = await supabase.functions.invoke('embed-message', {
      body: { 
        file: base64File, 
        message: message,
        fileType: file.type
      }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    if (!data || !data.encryptedFile) {
      throw new Error("No encrypted file returned from server");
    }
    
    console.log("Message embedded successfully");
    
    // Convert the returned base64 data back to a Blob
    const encryptedBlob = base64ToBlob(data.encryptedFile, file.type);
    return encryptedBlob;
  } catch (err) {
    console.error('Failed to encrypt message:', err);
    throw err;
  }
}

// Function to decrypt a message from a file
export async function decryptMessageFromFile(file: File): Promise<string | null> {
  try {
    console.log(`Starting decryption process for ${file.type}`);
    
    // Convert file to base64
    const base64File = await fileToBase64(file);
    
    // Call the edge function to extract the message
    const { data, error } = await supabase.functions.invoke('extract-message', {
      body: { 
        file: base64File,
        fileType: file.type
      }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error("No data returned from server");
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data.message) {
      console.log("Message extracted successfully");
      return data.message.trim();
    }
    
    return null;
  } catch (err) {
    console.error('Failed to decrypt message:', err);
    throw err;
  }
}

// Helper function to convert a File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}
