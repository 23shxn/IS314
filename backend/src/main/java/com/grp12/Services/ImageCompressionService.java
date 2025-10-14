package com.grp12.Services;

import org.springframework.stereotype.Service;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class ImageCompressionService {
    
    private static final int MAX_WIDTH = 800;
    private static final int MAX_HEIGHT = 600;
    private static final float COMPRESSION_QUALITY = 0.7f;
    
    public String compressBase64Image(String base64Image) {
        try {
            if (base64Image == null || base64Image.trim().isEmpty()) {
                return null;
            }
            
            // Remove data URL prefix if present
            String imageData = base64Image;
            if (base64Image.startsWith("data:")) {
                imageData = base64Image.substring(base64Image.indexOf(",") + 1);
            }
            
            // Decode base64 to bytes
            byte[] imageBytes = Base64.getDecoder().decode(imageData);
            
            // Check original size
            System.out.println("Original image size: " + imageBytes.length + " bytes");
            
            // If image is larger than 500KB, compress it
            if (imageBytes.length > 500 * 1024) {
                byte[] compressedBytes = compressImage(imageBytes);
                String compressedBase64 = Base64.getEncoder().encodeToString(compressedBytes);
                System.out.println("Compressed image size: " + compressedBytes.length + " bytes");
                return compressedBase64;
            }
            
            return imageData;
            
        } catch (Exception e) {
            System.err.println("Error compressing image: " + e.getMessage());
            return null; // Return null if compression fails
        }
    }
    
    private byte[] compressImage(byte[] originalImageBytes) throws IOException {
        // Convert bytes to BufferedImage
        ByteArrayInputStream bis = new ByteArrayInputStream(originalImageBytes);
        BufferedImage originalImage = ImageIO.read(bis);
        
        if (originalImage == null) {
            throw new IOException("Unable to read image data");
        }
        
        // Calculate new dimensions while maintaining aspect ratio
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        int newWidth = originalWidth;
        int newHeight = originalHeight;
        
        if (originalWidth > MAX_WIDTH || originalHeight > MAX_HEIGHT) {
            double widthRatio = (double) MAX_WIDTH / originalWidth;
            double heightRatio = (double) MAX_HEIGHT / originalHeight;
            double ratio = Math.min(widthRatio, heightRatio);
            
            newWidth = (int) (originalWidth * ratio);
            newHeight = (int) (originalHeight * ratio);
        }
        
        // Create compressed image
        BufferedImage compressedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = compressedImage.createGraphics();
        
        // Set rendering hints for better quality
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Draw the scaled image
        g2d.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        g2d.dispose();
        
        // Convert back to bytes with compression
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(compressedImage, "jpg", baos);
        
        return baos.toByteArray();
    }
}
