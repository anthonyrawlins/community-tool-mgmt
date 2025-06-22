#!/bin/bash

# Data Migration Preparation Script
# Prepares the environment and analyzes source data for migration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
DATA_DIR="$PROJECT_ROOT/data"
MIGRATION_DIR="$SCRIPT_DIR"
LOG_FILE="$MIGRATION_DIR/migration-prep.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

echo -e "${BLUE}🗄️  Data Migration Preparation${NC}"
echo "================================="
echo "Project: Ballarat Tool Library"
echo "Timestamp: $(date)"
echo ""

# Create necessary directories
log "Creating migration directories..."
mkdir -p "$DATA_DIR"/{source,processed,backup,reports}
mkdir -p "$MIGRATION_DIR"/{scripts,sql,validation}

# Check for source data
echo -e "${YELLOW}📋 Checking for source data...${NC}"

SOURCE_DATA_FOUND=false
SUPPORTED_FORMATS=("*.json" "*.csv" "*.xlsx" "*.xml")

for format in "${SUPPORTED_FORMATS[@]}"; do
    if ls "$DATA_DIR"/source/$format 1> /dev/null 2>&1; then
        SOURCE_DATA_FOUND=true
        break
    fi
done

if [ "$SOURCE_DATA_FOUND" = false ]; then
    echo -e "${YELLOW}⚠️  No source data found in $DATA_DIR/source/${NC}"
    echo ""
    echo "Please place your scraped data files in: $DATA_DIR/source/"
    echo "Supported formats: JSON, CSV, XLSX, XML"
    echo ""
    echo "Expected data structure:"
    echo "- tools.json (or tools.csv): Tool inventory data"
    echo "- categories.json: Tool categories and subcategories"
    echo "- members.json: Member information (optional)"
    echo "- images/: Tool images directory"
    echo ""
    
    # Create sample data structure
    echo -e "${BLUE}📝 Creating sample data templates...${NC}"
    
    cat > "$DATA_DIR/source/tools.json.template" << 'EOF'
{
  "tools": [
    {
      "id": "unique-tool-id",
      "name": "Tool Name",
      "brand": "Brand Name",
      "model": "Model Number",
      "category": "Category Name",
      "subcategory": "Subcategory",
      "description": "Detailed tool description",
      "specifications": "Technical specifications",
      "condition": "excellent|good|fair|maintenance",
      "acquisition_date": "2024-01-01",
      "purchase_price": 99.99,
      "replacement_cost": 149.99,
      "location": "Storage location",
      "barcode": "123456789",
      "serial_number": "SN123456",
      "images": ["image1.jpg", "image2.jpg"],
      "safety_notes": "Safety instructions",
      "usage_instructions": "How to use this tool",
      "maintenance_notes": "Maintenance requirements",
      "tags": ["tag1", "tag2"],
      "availability": true,
      "loan_duration_days": 7
    }
  ]
}
EOF

    cat > "$DATA_DIR/source/categories.json.template" << 'EOF'
{
  "categories": [
    {
      "id": "power-tools",
      "name": "Power Tools",
      "description": "Electric and battery-powered tools",
      "parent_id": null,
      "sort_order": 1,
      "subcategories": [
        {
          "id": "drills",
          "name": "Drills & Drivers",
          "description": "Drilling and driving tools",
          "sort_order": 1
        }
      ]
    }
  ]
}
EOF

    log "Sample templates created"
    echo -e "${GREEN}✅ Sample data templates created in $DATA_DIR/source/${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Place your actual data files in $DATA_DIR/source/"
    echo "2. Run this script again to analyze the data"
    echo "3. Review the migration plan and execute migration"
    
    exit 0
fi

# Analyze source data
echo -e "${BLUE}🔍 Analyzing source data...${NC}"
log "Starting data analysis..."

ANALYSIS_REPORT="$DATA_DIR/reports/data-analysis-$(date +%Y%m%d_%H%M%S).md"

cat > "$ANALYSIS_REPORT" << EOF
# Data Migration Analysis Report

**Generated**: $(date)  
**Source Directory**: $DATA_DIR/source/  

## Source Files Found

EOF

echo "Files found:" | tee -a "$ANALYSIS_REPORT"
find "$DATA_DIR/source" -type f \( -name "*.json" -o -name "*.csv" -o -name "*.xlsx" -o -name "*.xml" \) -exec basename {} \; | sort | tee -a "$ANALYSIS_REPORT"

# Analyze JSON files
if ls "$DATA_DIR"/source/*.json 1> /dev/null 2>&1; then
    echo "" | tee -a "$ANALYSIS_REPORT"
    echo "## JSON File Analysis" | tee -a "$ANALYSIS_REPORT"
    echo "" | tee -a "$ANALYSIS_REPORT"
    
    for json_file in "$DATA_DIR"/source/*.json; do
        filename=$(basename "$json_file")
        echo "### $filename" | tee -a "$ANALYSIS_REPORT"
        
        if command -v jq >/dev/null 2>&1; then
            echo "- File size: $(du -h "$json_file" | cut -f1)" | tee -a "$ANALYSIS_REPORT"
            
            # Try to get record count
            record_count=$(jq -r '. | if type == "array" then length elif type == "object" then (if has("tools") then .tools | length elif has("data") then .data | length else "1 object" end) else "Unknown structure" end' "$json_file" 2>/dev/null || echo "Parse error")
            echo "- Records: $record_count" | tee -a "$ANALYSIS_REPORT"
            
            # Get structure sample
            echo "- Structure sample:" | tee -a "$ANALYSIS_REPORT"
            jq -r '. | if type == "array" then .[0] elif type == "object" then (if has("tools") then .tools[0] elif has("data") then .data[0] else . end) else . end | keys | "  Fields: " + (. | join(", "))' "$json_file" 2>/dev/null | tee -a "$ANALYSIS_REPORT" || echo "  Unable to parse structure" | tee -a "$ANALYSIS_REPORT"
        else
            echo "- File size: $(du -h "$json_file" | cut -f1)" | tee -a "$ANALYSIS_REPORT"
            echo "- Install 'jq' for detailed JSON analysis" | tee -a "$ANALYSIS_REPORT"
        fi
        echo "" | tee -a "$ANALYSIS_REPORT"
    done
fi

# Check for images
if [ -d "$DATA_DIR/source/images" ]; then
    image_count=$(find "$DATA_DIR/source/images" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" \) | wc -l)
    echo "## Images Directory" | tee -a "$ANALYSIS_REPORT"
    echo "- Image files found: $image_count" | tee -a "$ANALYSIS_REPORT"
    echo "- Total size: $(du -sh "$DATA_DIR/source/images" | cut -f1)" | tee -a "$ANALYSIS_REPORT"
    echo "" | tee -a "$ANALYSIS_REPORT"
fi

# Generate migration recommendations
cat >> "$ANALYSIS_REPORT" << 'EOF'
## Migration Recommendations

### Database Schema Updates Needed
- [ ] Review tool fields against current Prisma schema
- [ ] Add any missing columns (barcode, serial_number, etc.)
- [ ] Create categories table if not exists
- [ ] Set up proper relationships (tool -> category)
- [ ] Add indexes for search performance

### Data Cleaning Tasks
- [ ] Validate required fields (name, category)
- [ ] Normalize category names
- [ ] Clean up price fields (remove currency symbols)
- [ ] Validate date formats
- [ ] Handle duplicate tools
- [ ] Compress and optimize images

### Migration Steps
1. **Backup current database**
2. **Update database schema**
3. **Process and validate source data**
4. **Import categories first**
5. **Import tools with category references**
6. **Import and resize images**
7. **Validate data integrity**
8. **Update search indexes**

### Estimated Migration Time
- Data processing: 1-2 hours
- Database import: 30 minutes - 2 hours (depending on data size)
- Image processing: 1-4 hours (depending on image count)
- Validation and testing: 2-4 hours

**Total estimated time: 4-12 hours**

### Rollback Plan
- Database backup before migration
- Source data preserved in original format
- Migration scripts support rollback operations
- Docker volume snapshots for quick recovery
EOF

echo -e "${GREEN}✅ Data analysis completed${NC}"
echo "Analysis report: $ANALYSIS_REPORT"

# Check database connection
echo -e "${YELLOW}🔌 Testing database connection...${NC}"
cd "$PROJECT_ROOT"

if [ -f ".env" ] && [ -f "backend/package.json" ]; then
    echo "Checking database connectivity..."
    
    # Try to connect to database
    if command -v docker >/dev/null 2>&1; then
        if docker ps | grep -q postgres; then
            echo -e "${GREEN}✅ PostgreSQL container is running${NC}"
        else
            echo -e "${YELLOW}⚠️  PostgreSQL container not found. Start with: docker-compose up -d${NC}"
        fi
    fi
    
    # Check if Prisma is available
    if [ -f "backend/node_modules/.bin/prisma" ]; then
        cd backend
        echo "Testing Prisma connection..."
        if npx prisma db pull --print 2>/dev/null | head -5; then
            echo -e "${GREEN}✅ Database connection successful${NC}"
        else
            echo -e "${YELLOW}⚠️  Database connection failed. Check environment variables.${NC}"
        fi
        cd "$PROJECT_ROOT"
    else
        echo -e "${YELLOW}⚠️  Prisma not installed. Run: cd backend && npm install${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Backend environment not set up${NC}"
fi

# Generate next steps
echo ""
echo -e "${BLUE}📋 Next Steps${NC}"
echo "=============="
echo "1. Review the data analysis report: $ANALYSIS_REPORT"
echo "2. Update database schema if needed"
echo "3. Run data validation: ./validate-source-data.js"
echo "4. Execute migration: ./run-migration.js"
echo "5. Test data integrity: ./verify-migration.js"
echo ""
echo "Migration directory: $MIGRATION_DIR"
echo "Log file: $LOG_FILE"

log "Migration preparation completed"

echo -e "${GREEN}🎉 Migration preparation completed!${NC}"