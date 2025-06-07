
/**
 * Utility functions for handling files
 */

/**
 * Extracts the file extension from a filename
 * @param fileName - The name of the file
 * @returns The file extension (including the dot)
 */
export const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex !== -1 ? fileName.slice(lastDotIndex) : '';
};

/**
 * Creates a downloadable file name with the original extension
 * @param originalFileName - The original file name
 * @param prefix - Optional prefix to add to the file name
 * @returns A new file name with the original extension
 */
export const createDownloadFileName = (originalFileName: string, prefix: string = 'encrypted-'): string => {
  const extension = getFileExtension(originalFileName);
  const baseName = originalFileName.slice(0, originalFileName.length - extension.length);
  
  return `${prefix}${baseName}${extension}`;
};
