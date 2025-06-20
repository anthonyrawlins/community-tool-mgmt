#!/bin/bash

# Deploy Ballarat Tool Library Data Migration Scripts to Development Cluster
# Based on CLAUDE.md network configuration and DATA_MIGRATION_PLAN.md

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Cluster configuration from CLAUDE.md
WALNUT_HOST="192.168.1.27"
IRONWOOD_HOST="192.168.1.113" 
ROSEWOOD_HOST="192.168.1.22"
SSH_USER="tony"
SHARED_DIR="/rust/containers/ballarat-scraping"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Ballarat Tool Library - Cluster Deployment${NC}"
echo "=============================================="
echo "Deploying scraping scripts to development cluster"
echo ""

# Function to check host connectivity
check_host() {
    local host=$1
    local name=$2
    
    echo -n "Checking connectivity to $name ($host)... "
    if ping -c 1 -W 3 "$host" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        return 1
    fi
}

# Function to deploy to a host
deploy_to_host() {
    local host=$1
    local script_name=$2
    local host_name=$3
    
    echo ""
    echo -e "${BLUE}Deploying to $host_name ($host)${NC}"
    echo "----------------------------------------"
    
    # Create directory structure
    echo "Creating directory structure..."
    ssh "$SSH_USER@$host" "mkdir -p $SHARED_DIR/scripts $SHARED_DIR/logs"
    
    # Copy the script
    echo "Copying $script_name..."
    scp "$SCRIPT_DIR/$script_name" "$SSH_USER@$host:$SHARED_DIR/scripts/"
    
    # Make executable
    ssh "$SSH_USER@$host" "chmod +x $SHARED_DIR/scripts/$script_name"
    
    # Install Python dependencies
    echo "Installing Python dependencies..."
    ssh "$SSH_USER@$host" "cd $SHARED_DIR && python3 -m pip install --user aiohttp requests pillow"
    
    echo -e "${GREEN}✓ Deployment to $host_name completed${NC}"
}

# Function to setup systemd services
setup_service() {
    local host=$1
    local script_name=$2
    local service_name=$3
    local host_name=$4
    
    echo "Setting up systemd service for $service_name on $host_name..."
    
    # Create systemd service file
    cat > "/tmp/${service_name}.service" << EOF
[Unit]
Description=Ballarat Tool Library $service_name
After=network.target

[Service]
Type=simple
User=$SSH_USER
WorkingDirectory=$SHARED_DIR
ExecStart=/usr/bin/python3 $SHARED_DIR/scripts/$script_name
Restart=on-failure
RestartSec=30
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    # Copy service file to host
    scp "/tmp/${service_name}.service" "$SSH_USER@$host:/tmp/"
    
    # Install and enable service (requires sudo)
    ssh "$SSH_USER@$host" "sudo mv /tmp/${service_name}.service /etc/systemd/system/ && \
                           sudo systemctl daemon-reload && \
                           sudo systemctl enable ${service_name}.service"
    
    # Clean up
    rm "/tmp/${service_name}.service"
    
    echo -e "${GREEN}✓ Service $service_name configured on $host_name${NC}"
}

# Main deployment
echo "Checking cluster connectivity..."
echo ""

# Check all hosts
WALNUT_OK=false
IRONWOOD_OK=false
ROSEWOOD_OK=false

if check_host "$WALNUT_HOST" "WALNUT"; then
    WALNUT_OK=true
fi

if check_host "$IRONWOOD_HOST" "IRONWOOD"; then
    IRONWOOD_OK=true
fi

if check_host "$ROSEWOOD_HOST" "ROSEWOOD"; then
    ROSEWOOD_OK=true
fi

echo ""

# Verify at least one host is available
if ! $WALNUT_OK && ! $IRONWOOD_OK && ! $ROSEWOOD_OK; then
    echo -e "${RED}ERROR: No cluster hosts are reachable${NC}"
    echo "Please check network connectivity and host availability"
    exit 1
fi

# Deploy scripts
echo -e "${YELLOW}Starting deployment to available hosts...${NC}"

# Deploy to WALNUT (coordinator)
if $WALNUT_OK; then
    deploy_to_host "$WALNUT_HOST" "walnut-coordinator.py" "WALNUT"
    setup_service "$WALNUT_HOST" "walnut-coordinator.py" "ballarat-walnut-coordinator" "WALNUT"
else
    echo -e "${YELLOW}⚠ WALNUT unavailable - skipping coordinator deployment${NC}"
fi

# Deploy to IRONWOOD (processor)
if $IRONWOOD_OK; then
    deploy_to_host "$IRONWOOD_HOST" "ironwood-processor.py" "IRONWOOD"  
    setup_service "$IRONWOOD_HOST" "ironwood-processor.py" "ballarat-ironwood-processor" "IRONWOOD"
else
    echo -e "${YELLOW}⚠ IRONWOOD unavailable - skipping processor deployment${NC}"
fi

# Deploy to ROSEWOOD (QA)
if $ROSEWOOD_OK; then
    deploy_to_host "$ROSEWOOD_HOST" "rosewood-qa.py" "ROSEWOOD"
    setup_service "$ROSEWOOD_HOST" "rosewood-qa.py" "ballarat-rosewood-qa" "ROSEWOOD"
else
    echo -e "${YELLOW}⚠ ROSEWOOD unavailable - skipping QA deployment${NC}"
fi

# Create cluster status script
echo ""
echo "Creating cluster management scripts..."

# Status script
cat > "$SCRIPT_DIR/cluster-status.sh" << 'EOF'
#!/bin/bash

# Check status of all cluster services

WALNUT_HOST="192.168.1.27"
IRONWOOD_HOST="192.168.1.113"
ROSEWOOD_HOST="192.168.1.22"
SSH_USER="tony"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    local host=$1
    local service=$2
    local name=$3
    
    echo -n "$name: "
    if ssh "$SSH_USER@$host" "systemctl is-active $service" >/dev/null 2>&1; then
        echo -e "${GREEN}Running${NC}"
    else
        echo -e "${RED}Stopped${NC}"
    fi
}

echo "Ballarat Tool Library - Cluster Status"
echo "======================================"

if ping -c 1 -W 3 "$WALNUT_HOST" >/dev/null 2>&1; then
    check_service "$WALNUT_HOST" "ballarat-walnut-coordinator" "WALNUT Coordinator"
else
    echo -e "WALNUT Coordinator: ${YELLOW}Host unreachable${NC}"
fi

if ping -c 1 -W 3 "$IRONWOOD_HOST" >/dev/null 2>&1; then
    check_service "$IRONWOOD_HOST" "ballarat-ironwood-processor" "IRONWOOD Processor"
else
    echo -e "IRONWOOD Processor: ${YELLOW}Host unreachable${NC}"
fi

if ping -c 1 -W 3 "$ROSEWOOD_HOST" >/dev/null 2>&1; then
    check_service "$ROSEWOOD_HOST" "ballarat-rosewood-qa" "ROSEWOOD QA"
else
    echo -e "ROSEWOOD QA: ${YELLOW}Host unreachable${NC}"
fi
EOF

chmod +x "$SCRIPT_DIR/cluster-status.sh"

# Start script
cat > "$SCRIPT_DIR/start-migration.sh" << 'EOF'
#!/bin/bash

# Start the data migration process

WALNUT_HOST="192.168.1.27"
SSH_USER="tony"

echo "Starting Ballarat Tool Library Data Migration..."
echo "==============================================="

# Start on WALNUT (others will follow automatically via signal files)
if ping -c 1 -W 3 "$WALNUT_HOST" >/dev/null 2>&1; then
    echo "Starting WALNUT coordinator..."
    ssh "$SSH_USER@$WALNUT_HOST" "sudo systemctl start ballarat-walnut-coordinator"
    echo "Migration started! Use cluster-status.sh to monitor progress."
    echo ""
    echo "Process flow:"
    echo "1. WALNUT will coordinate catalog scraping (1,209 tools)"
    echo "2. IRONWOOD will process tool details and images automatically"
    echo "3. ROSEWOOD will perform QA validation and generate import files"
    echo ""
    echo "Check /rust/containers/ballarat-scraping/ for progress files."
else
    echo "ERROR: Cannot reach WALNUT coordinator host"
    exit 1
fi
EOF

chmod +x "$SCRIPT_DIR/start-migration.sh"

echo ""
echo -e "${GREEN}✓ Cluster deployment completed successfully!${NC}"
echo ""
echo "Management scripts created:"
echo "  • cluster-status.sh  - Check service status across cluster"
echo "  • start-migration.sh - Start the data migration process"
echo ""
echo "Next steps:"
echo "1. Run ./start-migration.sh to begin scraping 1,209 tools"
echo "2. Monitor progress with ./cluster-status.sh"
echo "3. Check $SHARED_DIR for output files and reports"
echo ""
echo "Expected timeline: 3-5 days for complete migration"
echo "Data will be ready for import into alpha-1 system upon completion."