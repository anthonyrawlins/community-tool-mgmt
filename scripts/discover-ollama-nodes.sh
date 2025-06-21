#!/bin/bash

# Ollama Node Discovery Script
# Scans local subnet for Ollama instances on port 11434
# Updates agents configuration with discovered models and capabilities

set -e

# Configuration
OLLAMA_PORT=11434
SUBNET=$(ip route | grep -E "192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\." | head -1 | awk '{print $1}' || echo "192.168.1.0/24")
OUTPUT_FILE="config/agents.yaml"
TIMEOUT=3

echo "🔍 Discovering Ollama nodes on subnet: $SUBNET"
echo "================================================="

# Create output directory if it doesn't exist
mkdir -p $(dirname "$OUTPUT_FILE")

# Start YAML file
cat > "$OUTPUT_FILE" << 'EOF'
# Auto-generated Ollama Agents Configuration
# Generated on: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# 
# This file contains discovered Ollama instances and their capabilities
# Format: agents.yaml for distributed AI development system

agents:
EOF

# Function to check if Ollama is running on a host
check_ollama() {
    local host=$1
    echo "🔍 Checking $host:$OLLAMA_PORT..."
    
    # Check if port is open
    if timeout $TIMEOUT bash -c "echo >/dev/tcp/$host/$OLLAMA_PORT" 2>/dev/null; then
        echo "✅ Found Ollama service at $host:$OLLAMA_PORT"
        
        # Get API info
        local api_response=$(curl -s --connect-timeout $TIMEOUT "http://$host:$OLLAMA_PORT/api/tags" 2>/dev/null || echo "")
        
        if [ -n "$api_response" ]; then
            echo "📊 Querying models and capabilities..."
            
            # Parse hostname 
            local hostname=$(ssh "$host" hostname 2>/dev/null || echo "unknown-$(echo $host | tr '.' '-')")
            
            # Extract models from API response
            local models=$(echo "$api_response" | python3 -c "
import json
import sys
try:
    data = json.load(sys.stdin)
    models = data.get('models', [])
    for model in models:
        name = model.get('name', 'unknown')
        size = model.get('size', 0)
        modified = model.get('modified_at', '')
        print(f'    - name: \"{name}\"')
        print(f'      size: {size}')
        print(f'      modified: \"{modified}\"')
        print(f'      capabilities: [\"text-generation\", \"chat\", \"completion\"]')
except:
    pass
" 2>/dev/null)
            
            # Get system info
            local system_info=""
            if command -v ssh >/dev/null 2>&1; then
                system_info=$(ssh "$host" "
                    echo 'cpu_cores: '$(nproc 2>/dev/null || echo 'unknown')
                    echo 'memory_gb: '$(free -g 2>/dev/null | awk '/^Mem:/{print \$2}' || echo 'unknown')
                    echo 'gpu_info: \"'$(lspci 2>/dev/null | grep -i vga | head -1 | cut -d: -f3- | xargs || echo 'unknown')'\"'
                    echo 'os: \"'$(uname -s 2>/dev/null || echo 'unknown')'\"'
                    echo 'architecture: \"'$(uname -m 2>/dev/null || echo 'unknown')'\"'
                " 2>/dev/null || echo "")
            fi
            
            # Add agent to YAML
            cat >> "$OUTPUT_FILE" << EOF
  $hostname:
    host: "$host"
    port: $OLLAMA_PORT
    status: "active"
    type: "ollama"
    api_endpoint: "http://$host:$OLLAMA_PORT"
    discovered_at: "$(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    models:
$models
    system:
      $system_info
    capabilities:
      - "text-generation"
      - "chat-completion" 
      - "embeddings"
      - "code-generation"
    performance:
      priority: "medium"
      max_concurrent: 2
      timeout_seconds: 120
    health:
      endpoint: "/api/tags"
      interval_seconds: 300
      retries: 3

EOF
            
            echo "✅ Added $hostname ($host) to agents configuration"
            return 0
        else
            echo "⚠️  Port open but no valid Ollama API response from $host"
            return 1
        fi
    else
        return 1
    fi
}

# Function to scan subnet
scan_subnet() {
    local subnet=$1
    local base_ip=$(echo $subnet | cut -d'/' -f1 | cut -d'.' -f1-3)
    local start_ip=$(echo $subnet | cut -d'/' -f1 | cut -d'.' -f4)
    local cidr=$(echo $subnet | cut -d'/' -f2)
    
    # Calculate IP range based on CIDR
    local end_ip=254
    if [ "$cidr" -eq 24 ]; then
        end_ip=254
    elif [ "$cidr" -eq 16 ]; then
        end_ip=255
    fi
    
    local found_count=0
    
    # Scan known hosts first (common Ollama deployments)
    local known_hosts=("192.168.1.27" "192.168.1.28" "192.168.1.29" "localhost" "127.0.0.1")
    
    for host in "${known_hosts[@]}"; do
        if check_ollama "$host"; then
            ((found_count++))
        fi
    done
    
    # Full subnet scan if needed
    echo "🌐 Scanning subnet range: $base_ip.1-$end_ip"
    for i in $(seq 1 $end_ip); do
        local host="$base_ip.$i"
        # Skip known hosts already checked
        if [[ ! " ${known_hosts[@]} " =~ " ${host} " ]]; then
            check_ollama "$host" && ((found_count++))
        fi
    done
    
    echo "📊 Discovery complete. Found $found_count Ollama instances."
}

# Main execution
echo "🚀 Starting Ollama node discovery..."

# Ensure Python3 available for JSON parsing
if ! command -v python3 >/dev/null 2>&1; then
    echo "❌ Error: python3 required for JSON parsing"
    exit 1
fi

# Check if we can determine subnet
if [ "$SUBNET" = "192.168.1.0/24" ]; then
    echo "⚠️  Using default subnet $SUBNET - you may want to specify correct subnet"
fi

# Perform discovery
scan_subnet "$SUBNET"

# Add footer to YAML
cat >> "$OUTPUT_FILE" << 'EOF'

# Configuration metadata
metadata:
  generated_by: "ollama-discovery-script"
  last_updated: "$(date -u +"%Y-%m-%d %H:%M:%S UTC")"
  subnet_scanned: "$SUBNET"
  discovery_timeout: ${TIMEOUT}s
  
# Usage notes:
# - This file is auto-generated and will be overwritten on next discovery run
# - Modify agent priorities and capabilities as needed for your workload
# - Health checks run automatically based on interval_seconds setting
# - Add custom agents manually below this section if needed
EOF

echo ""
echo "✅ Discovery complete!"
echo "📄 Results saved to: $OUTPUT_FILE"
echo ""
echo "🔍 Next steps:"
echo "1. Review discovered agents in $OUTPUT_FILE"
echo "2. Adjust priorities and capabilities as needed"
echo "3. Test agent connectivity: ./scripts/test-agents.sh"
echo "4. Start distributed AI coordination"
echo ""
echo "🔄 To re-run discovery: $0"