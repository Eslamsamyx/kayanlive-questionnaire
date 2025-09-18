#!/usr/bin/env python3
"""
Generate favicon files in various sizes for KayanLive
"""

import os
from PIL import Image, ImageDraw, ImageFont
import cairosvg
import io

# Define the sizes needed
SIZES = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'favicon-192x192.png': 192,
    'favicon-512x512.png': 512,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
}

def create_favicon_from_text():
    """Create a favicon with gradient background and K letter"""

    for filename, size in SIZES.items():
        # Create a new image with transparent background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Create rounded rectangle background
        padding = size // 10
        draw.rounded_rectangle(
            [padding, padding, size - padding, size - padding],
            radius=size // 6,
            fill=(44, 44, 43, 255)  # #2c2c2b
        )

        # Add gradient effect (simplified - using solid color)
        # For a true gradient, you'd need more complex drawing
        gradient_color = (122, 253, 214)  # #7afdd6

        # Draw K letter
        font_size = size // 2
        try:
            # Try to use a system font
            from PIL import ImageFont
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()

        # Center the K
        text = "K"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        position = ((size - text_width) // 2, (size - text_height) // 2 - size // 10)

        # Draw with gradient-like color
        draw.text(position, text, fill=gradient_color, font=font)

        # Save the image
        output_path = f'../public/{filename}'
        img.save(output_path, 'PNG')
        print(f'Generated {filename} ({size}x{size})')

    # Create ICO file with multiple sizes
    icon_sizes = [(16, 16), (32, 32), (48, 48)]
    icon_imgs = []

    for size in icon_sizes:
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Simple filled square with K
        padding = size[0] // 10
        draw.rounded_rectangle(
            [padding, padding, size[0] - padding, size[1] - padding],
            radius=size[0] // 6,
            fill=(44, 44, 43, 255)
        )

        # Draw K
        font_size = size[0] // 2
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            font = ImageFont.load_default()

        text = "K"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2 - size[0] // 10)
        draw.text(position, text, fill=(122, 253, 214), font=font)

        icon_imgs.append(img)

    # Save ICO file
    if icon_imgs:
        icon_imgs[0].save('../public/favicon.ico', format='ICO', sizes=icon_sizes, append_images=icon_imgs[1:])
        print(f'Generated favicon.ico with sizes: {icon_sizes}')

if __name__ == "__main__":
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    try:
        create_favicon_from_text()
        print("\nAll favicon files generated successfully!")
    except Exception as e:
        print(f"Error generating favicons: {e}")
        print("Make sure you have PIL/Pillow installed: pip install Pillow")