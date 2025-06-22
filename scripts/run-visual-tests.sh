#!/bin/bash

# Visual Testing Suite for Ballarat Tool Library
# Automated screenshot and performance analysis

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_ROOT/visual-tests"
SITE_URL="https://ballarat-tool-library.home.deepblack.cloud"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="$OUTPUT_DIR/$TIMESTAMP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎬 Ballarat Tool Library Visual Testing Suite${NC}"
echo "======================================================="
echo "Site URL: $SITE_URL"
echo "Output: $REPORT_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

# Check dependencies
echo -e "${YELLOW}📋 Checking dependencies...${NC}"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm packages are installed
cd "$PROJECT_ROOT"
if [ ! -d "node_modules" ] || [ ! -f "node_modules/puppeteer/package.json" ]; then
    echo -e "${YELLOW}📦 Installing required npm packages...${NC}"
    npm install puppeteer lighthouse axe-core --save-dev
fi

# Create output directory
mkdir -p "$REPORT_DIR"

# Test site accessibility first
echo -e "${YELLOW}🌐 Testing site accessibility...${NC}"
if ! curl -f -s -I "$SITE_URL" > /dev/null; then
    echo -e "${RED}❌ Site not accessible at $SITE_URL${NC}"
    echo "Please ensure the site is running and accessible."
    exit 1
fi
echo -e "${GREEN}✅ Site is accessible${NC}"

# Run the visual analysis
echo -e "${YELLOW}📸 Running visual analysis...${NC}"
cd "$PROJECT_ROOT"
node scripts/screenshot-analysis.js "$SITE_URL" "$REPORT_DIR"

# Check if analysis completed successfully
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Visual analysis completed successfully!${NC}"
    
    # Display results summary
    echo ""
    echo -e "${BLUE}📊 Results Summary:${NC}"
    echo "==================="
    
    if [ -f "$REPORT_DIR/visual-analysis-report.json" ]; then
        # Extract summary from JSON report
        SCREENSHOTS=$(jq -r '.screenshots | length' "$REPORT_DIR/visual-analysis-report.json" 2>/dev/null || echo "N/A")
        PERFORMANCE_TESTS=$(jq -r '.performance | length' "$REPORT_DIR/visual-analysis-report.json" 2>/dev/null || echo "N/A")
        ERRORS=$(jq -r '.errors | length' "$REPORT_DIR/visual-analysis-report.json" 2>/dev/null || echo "N/A")
        
        echo "Screenshots taken: $SCREENSHOTS"
        echo "Performance tests: $PERFORMANCE_TESTS"
        echo "Errors encountered: $ERRORS"
        
        # Show performance scores if available
        if command -v jq &> /dev/null && [ -f "$REPORT_DIR/visual-analysis-report.json" ]; then
            echo ""
            echo -e "${BLUE}🚀 Performance Scores:${NC}"
            jq -r '.performance[] | "\(.page): Performance \(.scores.performance)%, Accessibility \(.scores.accessibility)%"' "$REPORT_DIR/visual-analysis-report.json" 2>/dev/null || echo "Performance data not available"
        fi
    fi
    
    echo ""
    echo -e "${BLUE}📁 Generated Files:${NC}"
    echo "==================="
    find "$REPORT_DIR" -type f -name "*.png" | wc -l | xargs echo "Screenshots:"
    find "$REPORT_DIR" -type f -name "*.html" | wc -l | xargs echo "HTML reports:"
    echo "JSON report: visual-analysis-report.json"
    echo "HTML summary: visual-analysis-report.html"
    
    echo ""
    echo -e "${GREEN}🎉 All tests completed!${NC}"
    echo "View the HTML report at: file://$REPORT_DIR/visual-analysis-report.html"
    
    # Open report if on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo ""
        echo -e "${YELLOW}🖥️  Opening report in browser...${NC}"
        open "$REPORT_DIR/visual-analysis-report.html"
    fi
    
else
    echo -e "${RED}❌ Visual analysis failed!${NC}"
    exit 1
fi

# Archive older reports (keep last 10)
echo -e "${YELLOW}🗄️  Archiving old reports...${NC}"
cd "$OUTPUT_DIR"
ls -t | tail -n +11 | xargs -r rm -rf
echo -e "${GREEN}✅ Cleanup completed${NC}"

echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "=============="
echo "1. Review the generated HTML report"
echo "2. Check lighthouse reports for detailed performance analysis"
echo "3. Address any accessibility issues found"
echo "4. Compare screenshots across different viewports"
echo "5. Run this script regularly for regression testing"
echo ""
echo "Report location: $REPORT_DIR"