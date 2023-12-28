#!/bin/bash

# Define the proxy list
proxies=(
  "socks5://stream:x1708y2021@216.97.237.99:12324"
  "socks5://stream:x1708y2021@216.97.237.185:12324"
  "socks5://stream:x1708y2021@216.97.236.225:12324"
  "socks5://stream:x1708y2021@216.97.237.137:12324"
  "socks5://stream:x1708y2021@216.97.237.247:12324"
  "socks5://stream:x1708y2021@216.97.239.67:12324"
  "socks5://stream:x1708y2021@216.97.239.5:12324"
  "socks5://stream:x1708y2021@216.97.238.102:12324"
  "socks5://stream:x1708y2021@216.97.239.204:12324"
  "socks5://stream:x1708y2021@216.97.239.61:12324"
)

# Calculate the maximum number of tun interfaces based on the length of the proxies array
max_tun_interfaces=$(( ${#proxies[@]} ))
echo "Maximum number of tun interfaces to be configured: $max_tun_interfaces"

# Define the sessions for the root user
root_sessions=("SHELL")

# Define the initial sessions for the "stream" user
stream_sessions=("API" "NLOAD" "SHELL")

# Dynamically add TUN2SOCKS sessions based on the number of tun interfaces
for i in $(seq 0 $max_tun_interfaces); do
  stream_sessions+=("TUN2SOCKS$i")
done

# Change to the specified directory for the "stream" user
cd /home/stream/Desktop/stream

# Kill any existing tmux servers for both root and stream and wait for 3 seconds
echo "Killing existing tmux servers..."
sudo tmux kill-server && sleep 3
sudo -u stream tmux kill-server && sleep 3
echo "Existing tmux servers killed."

# Create new tmux sessions for the root user
echo "Creating tmux sessions for the root user..."
for session in "${root_sessions[@]}"; do
  sudo tmux new-session -d -s "$session"
done
echo "Tmux sessions for the root user created."

# Create new tmux sessions for the "stream" user
echo "Creating tmux sessions for the 'stream' user..."
for session in "${stream_sessions[@]}"; do
  sudo -u stream tmux new-session -d -s "$session"
  # Start the NLOAD session with the "nload" command
  if [ "$session" == "NLOAD" ]; then
    sudo -u stream tmux send-keys -t "$session" "nload" C-m
    echo "Started NLOAD session."
  fi
done
echo "Tmux sessions for the 'stream' user created."

# Loop to create and configure tun interfaces for tun1 to tun20
for i in $(seq 0 $max_tun_interfaces); do
  tun="tun$i"
  ip="198.18.$i.1/24"
  route="$i.7.7.7 via 198.18.$i.1"

  echo "Configuring $tun interface..."
  # Send commands to create and configure tun interfaces
  sudo tmux send-keys -t SHELL "sudo ip tuntap add mode tun dev $tun && sudo ip link set dev $tun up mtu 1500 && sudo ip addr add $ip dev $tun && sudo ip route add $route" C-m && sleep 1

  # Send commands to create and configure TUN2SOCKS sessions, excluding tun0
  if [ "$i" -gt 0 ]; then
    echo "Configuring TUN2SOCKS$i session..."
    sudo -u stream tmux send-keys -t "TUN2SOCKS$i" "bin/tun2socks -loglevel 'debug' -device $tun -proxy ${proxies[i-1]}" C-m && sleep 1
  fi
done

# Grant 'stream' user the capability to bind to privileged ports (e.g., port 443)
echo "Granting 'stream' user permission to bind to privileged ports with Node.js..."
# For Node.js
sudo tmux send-keys -t SHELL "sudo setcap 'cap_net_bind_service,cap_net_raw=+ep' /home/stream/Desktop/stream/bin/node" C-m

# Start the API session with the command "bin/node api.js"
sudo -u stream tmux send-keys -t API "export DISPLAY=:14.0 && bin/node api.js" C-m
echo "Started API session."

# Check and display the current value of the 'rp_filter' setting using sysctl
echo "Checking and displaying the current value of 'rp_filter' setting..."
sudo tmux send-keys -t SHELL "sudo sysctl -a | grep rp_filter" C-m && sleep 1
