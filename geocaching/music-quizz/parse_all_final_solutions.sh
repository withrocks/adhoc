#!/bin/bash

for file in htm-pages/*.htm; do
    # Check if file exists (in case no .htm files are found)
    if [ ! -f "$file" ]; then
        continue
    fi
    python3 parse_html.py "$file" | tail -n 1
done
