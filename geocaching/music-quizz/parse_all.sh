#!/bin/bash

# Script to parse all HTML files in the temp directory
# and save each output to a separate JavaScript file

for file in htm-pages/*.htm; do
    # Check if file exists (in case no .htm files are found)
    if [ ! -f "$file" ]; then
        continue
    fi
    
    # Get the base filename without extension
    basename=$(basename "$file" .htm)
    
    # Run the parser and save output to JS file
    python parse_html.py "$file"
done
