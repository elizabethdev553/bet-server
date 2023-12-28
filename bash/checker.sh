#!/bin/bash

export DISPLAY=:10.0

check_timestamp_and_nodejs_process() {
url="https://api.playcasinos.stream/checking/running/?&security=off"

# Make the HTTP request and store the response
response=$(curl -s "$url")

# Extract the timestamp value from the response using jq
timestamp=$(echo "$response" | jq -r '.timestamp')

# Get the current timestamp
current_timestamp=$(date +%s)

# Calculate the time difference in seconds
time_diff=$((current_timestamp - timestamp))

# Define your commands
command_past="echo 'The timestamp difference is $time_diff seconds, Firefox is Restarting...'"
command_not_past="echo 'The timestamp difference is $time_diff seconds, nothing to do.'"

# Compare the time difference to 120 seconds (2 minutes) and 300 seconds (5 minutes)
if ((time_diff >= 120 && time_diff <= 86400)); then
  # Execute the command for timestamp difference between 120 to 86400 seconds past
  eval "$command_past"
  killall firefox-esr; sleep 3; firefox-esr -url http://d247.com/?$(date "+%Y-%m-%d-%T") &
else
  # Execute the command for timestamp difference not between 120 to 86400 seconds past
  eval "$command_not_past"
fi
}
check_timestamp_and_nodejs_process
