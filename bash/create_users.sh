#!/bin/bash

for ((i=1; i<=20; i++)); do
    username="worker$i"
    password="WorkerPass$i"
    home_directory="/home/$username"
    full_name="Worker$i"
    address="Worker$i Address"
    phone="Worker$i Phone"
    
    # Check if the user exists
    if id "$username" &>/dev/null; then
        echo "User '$username' already exists."
    else
        # Create the user with specified information and set the password
        sudo useradd -m -d "$home_directory" -c "$full_name,$address,$phone" "$username" && echo "$username:$password" | sudo chpasswd
        echo "User '$username' created."
    fi
done
