import os
import requests
import time
from urllib.parse import urljoin, urlparse
from pathlib import Path

# Base URL for relative links
BASE_URL = "https://baconpez.se/band/"

# All href links found in tempo.html
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

def create_temp_directory():
    """Create the temp directory if it doesn't exist"""
    temp_dir = Path("temp")
    temp_dir.mkdir(exist_ok=True)
    return temp_dir

def get_filename_from_url(url):
    """Extract filename from URL"""
    parsed = urlparse(url)
    filename = os.path.basename(parsed.path)
    if not filename or filename == '/':
        # If no filename in path, create one from the URL
        filename = parsed.netloc.replace('.', '_') + '_' + parsed.path.replace('/', '_').strip('_') + '.html'
    return filename

def download_file(url, filepath, max_retries=3, delay=1):
    """Download a file with retry mechanism"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    for attempt in range(max_retries):
        try:
            print(f"Downloading {url} (attempt {attempt + 1}/{max_retries})")
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ Successfully downloaded: {filepath.name}")
            return True
            
        except requests.exceptions.RequestException as e:
            print(f"✗ Attempt {attempt + 1} failed for {url}: {str(e)}")
            if attempt < max_retries - 1:
                print(f"Waiting {delay} seconds before retry...")
                time.sleep(delay)
                delay *= 2  # Exponential backoff
            
    print(f"✗ Failed to download {url} after {max_retries} attempts")
    return False

def main():
    print(f"Total number of links: {len(hrefs)}")
    
    # Create temp directory
    temp_dir = create_temp_directory()
    print(f"Created/using directory: {temp_dir.absolute()}")
    
    successful_downloads = 0
    failed_downloads = 0
    
    for i, (filename, base_url) in enumerate(hrefs, 1):
        print(f"\n[{i}/{len(hrefs)}] Processing: {filename}")
        
        # Construct the full URL
        url = urljoin(base_url, filename)
        
        # Get filename
        final_filename = get_filename_from_url(url)
        filepath = temp_dir / final_filename
        
        # Skip if file already exists
        if filepath.exists():
            print(f"⚠ File already exists, skipping: {final_filename}")
            successful_downloads += 1
            continue
        
        # Download the file
        if download_file(url, filepath):
            successful_downloads += 1
        else:
            failed_downloads += 1
        
        # Small delay between downloads to be respectful
        time.sleep(0.5)
    
    print(f"\n{'='*50}")
    print(f"Download Summary:")
    print(f"Successful: {successful_downloads}")
    print(f"Failed: {failed_downloads}")
    print(f"Total: {len(hrefs)}")
    print(f"Files saved to: {temp_dir.absolute()}")

if __name__ == "__main__":
    main()