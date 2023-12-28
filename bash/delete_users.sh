#!/bin/bash

for ((i=1; i<=20; i++)); do
    username="worker$i"

    # Check if the user exists
    if id "$username" &>/dev/null; then
        # Get the user's processes
        user_processes=$(ps -o pid -U "$username" | awk 'NR>1')

        if [ -n "$user_processes" ]; then
            # Automatically terminate processes
            sudo kill -9 $user_processes
            echo "Processes of user '$username' terminated automatically."
        fi

        # Delete the user and their home directory
        sudo userdel -r "$username"
        echo "User '$username' deleted."
    else
        echo "User '$username' does not exist."
    fi
done
