import re

# Open the HTML file
def extract_links(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Find all href links using regex
    links = re.findall(r'href=["\'](.*?)["\']', content)
    return links

# Specify the file path
html_file_path = 'tempo.html'

# Extract links
if __name__ == "__main__":
    extracted_links = extract_links(html_file_path)
    print("Extracted Links:")
    for link in extracted_links:
        print(link)
