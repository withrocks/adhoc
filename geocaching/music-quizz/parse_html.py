#!/usr/bin/env python3
"""
HTML Parser Script

This script parses HTML files to extract:
1. Image source URLs from <img> tags
2. href URLs containing '/certitude?' from <a> tags

Both are added to a list maintaining their order in the file while ensuring uniqueness.
"""

from bs4 import BeautifulSoup
import sys
import os

hrefs = [
    ("band1.htm", "https://baconpez.se/band/"),
    ("band2.htm", "https://baconpez.se/band/"),
    ("band3.htm", "https://baconpez.se/band/"),
    ("band4.htm", "https://baconpez.se/band/"),
    ("band5.htm", "https://baconpez.se/band/"),
    ("band6.htm", "https://baconpez.se/band/"),
    ("band7.htm", "https://baconpez.se/band/"),
    ("band8.htm", "https://baconpez.se/band/"),
    ("band9.htm", "https://baconpez.se/band/"),
    ("band10.htm", "https://baconpez.se/band/"),
    ("band11.htm", "https://baconpez.se/band/"),
    ("band12.htm", "https://baconpez.se/band/"),
    ("band13.htm", "https://baconpez.se/band/"),
    ("band14.htm", "https://baconpez.se/band/"),
    ("band15.htm", "https://baconpez.se/band/"),
    ("band16.htm", "https://baconpez.se/band/"),
    ("band17.htm", "https://baconpez.se/band/"),
    ("band18.htm", "https://baconpez.se/band/"),
    ("band19.htm", "https://baconpez.se/band/"),
    ("band20.htm", "https://baconpez.se/band/"),
    ("band21.htm", "https://baconpez.se/band/"),
    ("band22.htm", "https://baconpez.se/band/"),
    ("band23.htm", "https://baconpez.se/band/"),
    ("band24.htm", "https://baconpez.se/band/"),
    ("band25.htm", "https://baconpez.se/band/"),
    ("band26.htm", "https://baconpez.se/band/"),
    ("band27.htm", "https://baconpez.se/band/"),
    ("band28.htm", "https://baconpez.se/band/"),
    ("band29.htm", "https://baconpez.se/band/"),
    ("band30.htm", "https://baconpez.se/band/"),
    ("band31.htm", "https://baconpez.se/band/"),
    ("band32.htm", "https://baconpez.se/band/"),
    ("band33.htm", "https://baconpez.se/band/"),
    ("band34.htm", "https://baconpez.se/band/"),
    ("band35.htm", "https://baconpez.se/band/"),
    ("band36.htm", "https://baconpez.se/band/"),
    ("band37.htm", "https://baconpez.se/band/"),
    ("band38.htm", "https://baconpez.se/band/"),
    ("band39.htm", "https://baconpez.se/band/"),
    ("band40.htm", "https://baconpez.se/band/"),
    ("band41.htm", "https://baconpez.se/band/"),
    ("band42.htm", "https://baconpez.se/band/"),
    ("band43.htm", "https://baconpez.se/band/"),
    ("band44.htm", "https://baconpez.se/band/"),
    ("band45.htm", "https://baconpez.se/band/"),
    ("band46.htm", "https://baconpez.se/band/"),
    ("band47.htm", "https://baconpez.se/band/"),
    ("band48.htm", "https://baconpez.se/band/"),
    ("band49.htm", "https://baconpez.se/band/"),
    ("band50.htm", "https://baconpez.se/band/"),
    ("band51.htm", "https://baconpez.se/band/"),
    ("band52.htm", "https://baconpez.se/band/"),
    ("band53.htm", "https://baconpez.se/band/"),
    ("band54.htm", "https://baconpez.se/band/"),
    ("band55.htm", "https://baconpez.se/band/"),
    ("band56.htm", "https://baconpez.se/band/"),
    ("band57.htm", "https://baconpez.se/band/"),
    ("band58.htm", "https://baconpez.se/band/"),
    ("band59.htm", "https://baconpez.se/band/"),
    ("band60.htm", "https://baconpez.se/band/"),
    ("band61.htm", "https://baconpez.se/band/"),
    ("band62.htm", "https://baconpez.se/band/"),
    ("band63.htm", "https://baconpez.se/band/"),
    ("band64.htm", "https://baconpez.se/band/"),
    ("band65.htm", "https://baconpez.se/band/"),
    ("band66.htm", "https://baconpez.se/band/"),
    ("band67.htm", "https://baconpez.se/band/"),
    ("band68.htm", "https://baconpez.se/band/"),
    ("band69.htm", "https://baconpez.se/band/"),
    ("band70.htm", "https://baconpez.se/band/"),
    ("band71.htm", "https://baconpez.se/band/"),
    ("band72.htm", "https://baconpez.se/band/"),
    ("band73.htm", "https://baconpez.se/band/"),
    ("band74.htm", "https://baconpez.se/band/"),
    ("band75.htm", "https://baconpez.se/band/"),
    ("band76.htm", "https://baconpez.se/band/"),
    ("band77.htm", "https://baconpez.se/band/"),
    ("band78.htm", "https://baconpez.se/band/"),
    ("band79.htm", "https://baconpez.se/band/"),
    ("band80.htm", "https://baconpez.se/band/"),
    ("band81.htm", "https://baconpez.se/band/"),
    ("band82.htm", "https://baconpez.se/band/"),
    ("band83.htm", "https://baconpez.se/band/"),
    ("band84.htm", "https://baconpez.se/band/"),
    ("band85.htm", "https://baconpez.se/band/"),
    ("band86.htm", "https://baconpez.se/band/"),
    ("band87.htm", "https://baconpez.se/band/"),
    ("band88.htm", "https://baconpez.se/band/"),
    ("band89.htm", "https://baconpez.se/band/"),
    ("band90.htm", "https://baconpez.se/band/"),
    ("band91.htm", "https://baconpez.se/band/"),
    ("band92.htm", "https://baconpez.se/band/"),
    ("band93.htm", "https://baconpez.se/band/"),
    ("band94.htm", "https://baconpez.se/band/"),
    ("band95.htm", "https://baconpez.se/band/"),
    ("band96.htm", "https://baconpez.se/band/"),
    ("bando1.htm", "https://baconpez.se/band/"),
    ("bando2.htm", "https://baconpez.se/band/"),
    ("bando3.htm", "https://baconpez.se/band/"),
    ("bando4.htm", "https://baconpez.se/band/"),
    ("bando5.htm", "https://baconpez.se/band/"),
    ("bando6.htm", "https://baconpez.se/band/"),
    ("band97.htm", "https://baconpez.se/band/"),
    ("bando7.htm", "https://baconpez.se/band/"),
    ("bando8.htm", "https://baconpez.se/band/"),
    ("band98.htm", "https://baconpez.se/band/"),
    ("bando9.htm", "https://baconpez.se/band/"),
    ("bando10.htm", "https://baconpez.se/band/"),
    ("bando11.htm", "https://baconpez.se/band/"),
    ("band99.htm", "https://baconpez.se/band/"),
    ("bando12.htm", "https://baconpez.se/band/"),
    ("bando13.htm", "https://baconpez.se/band/"),
    ("bando14.htm", "https://baconpez.se/band/"),
    ("bando15.htm", "https://baconpez.se/band/"),
    ("bando16.htm", "https://baconpez.se/band/"),
    ("bando17.htm", "https://baconpez.se/band/"),
    ("band100a.htm", "https://baconpez.se/kaboom/"),
    ("band100b.htm", "https://baconpez.se/kaboom/"),
    ("band100c.htm", "https://baconpez.se/kaboom/"),
    ("band100d.htm", "https://baconpez.se/kaboom/"),
    ("band100e.htm", "https://baconpez.se/kaboom/"),
    ("band100f.htm", "https://baconpez.se/kaboom/"),
    ("band100g.htm", "https://baconpez.se/kaboom/"),
    ("band100h.htm", "https://baconpez.se/kaboom/"),
    ("band100i.htm", "https://baconpez.se/kaboom/"),
    ("band100j.htm", "https://baconpez.se/kaboom/"),
    ("band100k.htm", "https://baconpez.se/kaboom/"),
    ("band100l.htm", "https://baconpez.se/kaboom/"),
    ("band100m.htm", "https://baconpez.se/kaboom/"),
    ("band100n.htm", "https://baconpez.se/kaboom/"),
    ("band100o.htm", "https://baconpez.se/kaboom/"),
    ("band100p.htm", "https://baconpez.se/kaboom/"),
    ("band100q.htm", "https://baconpez.se/kaboom/"),
    ("band100r.htm", "https://baconpez.se/kaboom/"),
    ("band100s.htm", "https://baconpez.se/kaboom/"),
    ("band100t.htm", "https://baconpez.se/kaboom/"),
    ("band100u.htm", "https://baconpez.se/kaboom/"),
    ("band100v.htm", "https://baconpez.se/kaboom/"),
    ("band100w.htm", "https://baconpez.se/kaboom/"),
    ("bando18.htm", "https://baconpez.se/band/"),
    ("bando19.htm", "https://baconpez.se/band/"),
    ("bando20.htm", "https://baconpez.se/band/"),
    ("bando21.htm", "https://baconpez.se/band/"),
    ("bando22.htm", "https://baconpez.se/band/desista/o22tolkien/"),
    ("bandx.htm", "https://baconpez.se/band/desista/xalbatross/"),
    ("bandy.htm", "https://baconpez.se/band/desista/yamager/"),
    ("bandz.htm", "https://baconpez.se/band/desista/zarise/"),
    ("bandaa.htm", "https://baconpez.se/band/desista/aaleonardo/"),
    ("bandae.htm", "https://baconpez.se/band/desista/aematrix/"),
    ("bandoo.htm", "https://baconpez.se/band/desista/oomercury/"),
]

def get_base_url_for_file(filename):
    """
    Get the base URL for a given HTML filename from the hrefs list
    """
    for href_filename, base_url in hrefs:
        if href_filename == filename:
            return base_url
    
    raise ValueError(f"No base URL found for filename: {filename}")


def parse_html_file(file_path):
    """
    Parse an HTML file and extract image sources and certitude links.
    
    Args:
        file_path (str): Path to the HTML file
        
    Returns:
        tuple: (list of image URLs, list of certitude URLs)
    """
    try:
        with open(file_path, 'r', encoding='windows-1252') as file:
            content = file.read()
    except UnicodeDecodeError:
        # Fallback to utf-8 if windows-1252 fails
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Get the base URL for this file
    filename = os.path.basename(file_path)
    base_url = get_base_url_for_file(filename)
    
    images = []
    certitudes = []
    seen_images = set()
    seen_certitudes = set()
    
    # Parse the HTML tree in document order
    for element in soup.find_all(['img', 'a']):
        if element.name == 'img' and element.get('src'):
            src = element.get('src')
            # Skip certitudes.org logo images
            if src not in seen_images and '/logo?' not in src:
                # Convert relative URLs to absolute
                if not src.startswith('http'):
                    absolute_src = base_url + src
                else:
                    absolute_src = src
                images.append(absolute_src)
                seen_images.add(src)  # Still use original src for uniqueness check
        
        elif element.name == 'a' and element.get('href'):
            href = element.get('href')
            if '/certitude?' in href and href not in seen_certitudes:
                certitudes.append(href)
                seen_certitudes.add(href)
    
    return images, certitudes


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python parse_html.py <html_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    images, certitudes = parse_html_file(file_path)
    certitude_solution = certitudes[-1] if certitudes else None
    certitudes = certitudes[:len(images)]  # Trim certitudes to match images count

    if len(images) != len(certitudes):
        print(f"Warning: Mismatch in counts - Images: {len(images)}, Certitudes: {len(certitudes)}", file=sys.stderr)
    
    # Output comma-separated values
    for image, certitude in zip(images, certitudes):
        print(f"{image},{certitude},{os.path.basename(file_path)}")
    
    filename = os.path.basename(file_path)
    print(f"{filename},{certitude_solution}")
