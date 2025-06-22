#!/bin/bash

# Sprint 2 Cluster Kickoff Script
# Coordinates all agents for Sprint 2 development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Sprint 2 Cluster Kickoff - Ballarat Tool Library${NC}"
echo "================================================================="
echo "Sprint Goal: Data migration and core tool management features"
echo "Duration: 2 weeks (June 22 - July 5, 2025)"
echo "Cluster: 4-agent distributed development system"
echo ""

# Check current status
echo -e "${YELLOW}📋 Checking cluster readiness...${NC}"

# Verify all status files exist
AGENTS=("WALNUT" "IRONWOOD" "ACACIA" "ROSEWOOD")
MISSING_FILES=()

for agent in "${AGENTS[@]}"; do
    if [ ! -f "${agent}_STATUS.md" ]; then
        MISSING_FILES+=("${agent}_STATUS.md")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All agent status files present${NC}"
else
    echo -e "${RED}❌ Missing status files: ${MISSING_FILES[*]}${NC}"
    echo "Please create missing status files before proceeding."
    exit 1
fi

# Display agent assignments
echo ""
echo -e "${BLUE}👥 Agent Task Assignments${NC}"
echo "=========================="

echo -e "${GREEN}🌰 WALNUT (192.168.1.27)${NC} - Primary Coordinator & Data Migration"
echo "   Model: starcoder2:15b"
echo "   Focus: Data migration from scraped source (5 days)"
echo "   Status: Ready to start data analysis and migration scripts"
echo ""

echo -e "${GREEN}🌳 IRONWOOD (192.168.1.113)${NC} - Tool Catalog Enhancement"  
echo "   Model: deepseek-coder-v2"
echo "   Focus: Advanced search and filtering system (7 days)"
echo "   Status: Ready to start search implementation and catalog features"
echo ""

echo -e "${GREEN}🌿 ACACIA (192.168.1.72)${NC} - Security & User Experience"
echo "   Model: deepseek-r1:7b"  
echo "   Focus: User authentication and member management (6 days)"
echo "   Status: Ready to start security audit and auth system"
echo ""

echo -e "${GREEN}🌹 ROSEWOOD (192.168.1.132)${NC} - QA & Performance Testing"
echo "   Model: deepseek-r1:7b"
echo "   Focus: Test automation and quality assurance (6 days)"
echo "   Status: Ready to start testing infrastructure setup"
echo ""

# Show critical dependencies
echo -e "${YELLOW}🔗 Critical Dependencies${NC}"
echo "========================"
echo "• IRONWOOD needs WALNUT's migrated data for search indexing"
echo "• ACACIA needs WALNUT's backend infrastructure for auth endpoints"  
echo "• ROSEWOOD needs completed features from all agents for testing"
echo "• All agents coordinate on API contracts and database schema"
echo ""

# Display communication protocols
echo -e "${PURPLE}📡 Communication Protocols${NC}"
echo "============================"
echo "• Daily Status Updates: 09:00 local time in individual status files"
echo "• Integration Sync: Before making API or schema changes"
echo "• Blocker Escalation: Immediate update to SPRINT_2_COORDINATION.md"
echo "• Weekly Review: Friday summary of progress and next week planning"
echo ""

# Show immediate next steps
echo -e "${BLUE}🎯 Immediate Next Steps (Today)${NC}"
echo "================================="
echo ""
echo -e "${GREEN}WALNUT:${NC}"
echo "  1. Run data migration preparation script"
echo "  2. Analyze scraped data structure and quality"
echo "  3. Plan database schema updates"
echo ""
echo -e "${GREEN}IRONWOOD:${NC}"
echo "  1. Set up development environment"
echo "  2. Research PostgreSQL full-text search"
echo "  3. Design search and filtering architecture"
echo ""
echo -e "${GREEN}ACACIA:${NC}"
echo "  1. Security audit of current authentication"
echo "  2. Design secure JWT token management"
echo "  3. Plan user management system architecture"
echo ""
echo -e "${GREEN}ROSEWOOD:${NC}"
echo "  1. Set up testing frameworks (Jest, Playwright)"
echo "  2. Establish performance baselines with Lighthouse"
echo "  3. Create visual regression testing infrastructure"
echo ""

# Success metrics
echo -e "${PURPLE}🎉 Sprint Success Criteria${NC}"
echo "==========================="
echo "• Data Migration: >500 tools migrated with <1% data loss"
echo "• Search: Users can find tools by name, category, availability"  
echo "• Authentication: Secure login/logout with session management"
echo "• Performance: 95th percentile load time <3 seconds"
echo "• Testing: >80% automated test coverage"
echo "• Quality: Zero high-severity security vulnerabilities"
echo ""

# Final instructions
echo -e "${YELLOW}📋 Getting Started${NC}"
echo "=================="
echo "1. Each agent should update their status file before starting work"
echo "2. Run data migration prep: ./scripts/data-migration/prepare-migration.sh (WALNUT)"
echo "3. Set up development environments on respective nodes"
echo "4. Begin daily coordination through status file updates"
echo "5. Escalate blockers immediately to coordination file"
echo ""

echo -e "${GREEN}🚀 Sprint 2 is now ACTIVE!${NC}"
echo "All agents ready for distributed development execution."
echo ""
echo "Monitor progress: cat *_STATUS.md"
echo "Coordination: cat SPRINT_2_COORDINATION.md"
echo "Issues: cat CLUSTER_ISSUES.md"
echo ""

# Log the kickoff
echo "$(date): Sprint 2 kickoff completed - All agents ready" >> sprint-2.log

echo -e "${BLUE}Happy coding! 🎯${NC}"