#!/bin/bash

# Function to create or clone a user
create_or_clone_user() {
    local username="$1"
    local password="$2"
    local full_name="$3"
    local address="$4"
    local phone="$5"
    
    # Check if the user exists
    if id "$username" &>/dev/null; then
        echo "User '$username' already exists."
    else
        # Create the user with specified information and set the password
        sudo useradd -m -d "/home/$username" -c "$full_name,$address,$phone" "$username" && echo "$username:$password" | sudo chpasswd
        echo "User '$username' created."
        
    fi
        # Clone stream
    if [ "$username" != "stream" ]; then
        # Clone XFCE desktop configuration from stream (exclude for stream)
        sudo cp -r "/home/stream/.config/xfce4" "/home/$username/.config/"
        sudo chown -R "$username:$username" "/home/$username/.config/"

        # Clone Firefox ESR profile from stream (exclude for stream)
        sudo cp -r "/home/stream/.mozilla" "/home/$username/"
        sudo chown -R "$username:$username" "/home/$username/.mozilla"
    fi
}

# Check if stream exists
if id "stream" &>/dev/null; then
    # Create or clone worker1 to worker20
    for ((i=1; i<=20; i++)); do
        create_or_clone_user "worker$i" "WorkerPass$i" "Worker$i" "Worker$i Address" "Worker$i Phone"
    done
else
    # Create stream and exit
    create_or_clone_user "stream" "WorkerPass0" "stream" "stream Address" "stream Phone"
    exit 0
fi
