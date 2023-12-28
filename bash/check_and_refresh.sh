#!/bin/bash

# Find the Firefox window using its title (adjust as needed)
window_id=$(xdotool search --name "Mozilla Firefox")

# Activate the Firefox window
xdotool windowactivate $window_id

# Capture the current page content
page_content=$(xdotool key --delay 500ms ctrl+u)

# Check if the page content contains an error message (adjust as needed)
if [[ "$page_content" == *"Error"* ]]; then
    # Send the F5 key to refresh the page
    xdotool key F5
fi
