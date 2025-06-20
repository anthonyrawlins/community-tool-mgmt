# Ballarat Tool Library Data Migration Plan

## Overview
Migrate existing Ballarat Tool Library data from https://ballarattoollibrary.org/ to our new alpha-1 system, leveraging our development cluster for comprehensive data scraping and import operations.

## Phase 1: Data Discovery & Scraping Strategy

### 1.1 Assign Scraping Task to Development Cluster
- **Target Machines**: WALNUT (primary), IRONWOOD (secondary), ROSEWOOD (validation)
- **Tool**: Deploy web scraping agents using Ollama models specialized for content extraction
- **Coordination**: Use n8n workflows for distributed scraping tasks

### 1.2 Website Analysis & Content Mapping
**Primary Targets Identified:**
- **Home Page**: Mission, overview, tool count (1000+ tools)
- **Membership Structure**: 3 tiers ($33/$55/$77 annually)
- **Operational Data**: Hours (Tue 4-6pm, Sat 10am-12pm), location
- **FAQ**: Detailed policies, loan periods, late fees, procedures

**Missing/Limited Data:**
- No public tool inventory/catalog found
- Tool database likely private/member-only
- External membership system (myturn.com)

### 1.3 Scraping Architecture
```
WALNUT (Coordinator):
├── Main scraping orchestration
├── Content parsing with qwen2.5-coder
└── Data normalization

IRONWOOD (Processing):
├── Deep content analysis
├── Image processing (if tool photos found)
└── Data validation with deepseek-coder-v2

ROSEWOOD (Validation):
├── QA testing of scraped data
├── Data integrity checks
└── Format validation
```

## Phase 2: Data Import Strategy

### 2.1 Importable Content Categories

**High Priority (Ready for Import):**
1. **Organizational Data**
   - Mission statement and community focus
   - Location: "25-39 Barkly St, Ballarat East VIC 3350" 
   - Operating hours and contact information
   
2. **Membership Structure**
   - Concession: $33/year → Map to Basic ($55)
   - Individual: $55/year → Map to Basic ($55)
   - Couple: $77/year → Map to Premium ($70)
   
3. **Policies & Procedures**
   - Loan periods (1 week standard)
   - Late fee structure ($1/day hand tools, $5/day power tools)
   - Age requirements (18+) and ID verification
   - Geographic restrictions (Ballarat area)

4. **Tool Categories** (mentioned but not detailed):
   - Woodworking tools
   - Metalworking tools  
   - Gardening tools
   - Power tools
   - Kitchen tools
   - Artist tools

**Medium Priority (Requires Investigation):**
1. **External System Integration**
   - MyTurn.com membership system analysis
   - Potential API access or data export
   - Member migration strategy

2. **Tool Inventory Discovery**
   - Member portal investigation
   - Contact organization for data export
   - Manual inventory documentation

### 2.2 Database Mapping Strategy

**Our Alpha-1 Schema → Ballarat Data:**
```sql
-- User/Member mapping
Users table:
  - Import member data (if accessible)
  - Map membership tiers
  - Update pricing to match our structure

-- Tool Categories
ToolCategory table:
  - Create categories based on mentioned types
  - Establish hierarchy (hand tools → subcategories)

-- System Configuration  
SystemConfig table:
  - Operating hours
  - Late fee policies ($1/$5 per day)
  - Loan periods (7 days default)
  - Geographic restrictions
```

## Phase 3: Implementation Approach

### 3.1 Automated Scraping (Development Cluster)
```python
# Distributed scraping workflow
WALNUT_TASKS = [
    "scrape_main_content",
    "extract_membership_data", 
    "parse_policies_procedures"
]

IRONWOOD_TASKS = [
    "deep_content_analysis",
    "validate_scraped_data",
    "format_for_import"
]

ROSEWOOD_TASKS = [
    "qa_testing",
    "data_integrity_checks", 
    "import_validation"
]
```

### 3.2 Manual Data Collection
1. **Contact Ballarat Tool Library directly**
   - Request tool inventory export
   - Discuss member data migration (privacy compliant)
   - Establish partnership for system transition

2. **MyTurn.com Integration Research**
   - Investigate API access
   - Export capabilities
   - Data format compatibility

### 3.3 Import Pipeline
```
Raw Data → Validation → Transformation → Database Import
    ↓           ↓            ↓              ↓
  Scraped    Schema       Our Alpha-1     Production
  Content    Mapping      Format         Database
```

## Phase 4: Data Validation & Testing

### 4.1 Import Validation Checklist
- [ ] Membership tiers correctly mapped
- [ ] Operating hours and policies imported
- [ ] Tool categories established
- [ ] Contact information accurate
- [ ] Pricing structure validated
- [ ] Geographic settings configured

### 4.2 Testing Strategy
1. **Staging Environment**: Test imports on development cluster
2. **Data Integrity**: Verify imported vs. source data
3. **Functional Testing**: Ensure our system handles imported data
4. **User Acceptance**: Validate against real Ballarat procedures

## Expected Outcomes

### Immediate (Scrapable Data):
- Complete organizational profile setup
- Accurate membership pricing and policies  
- Proper operating hours and location data
- Tool category structure established

### Potential (With Cooperation):
- Full member database migration
- Complete tool inventory (1000+ tools)
- Historical loan/reservation data
- Existing member preferences and data

### System Benefits:
- Real-world data validation of our alpha-1 system
- Immediate production-ready content
- Community-tested policies and procedures
- Existing member base for system adoption

## Timeline: 3-5 Days
- **Day 1-2**: Cluster scraping and content extraction
- **Day 3**: Data transformation and validation  
- **Day 4**: Database import and testing
- **Day 5**: Validation and refinement

## Implementation Notes

### Cluster Task Assignment
This migration will leverage our distributed AI infrastructure:

- **WALNUT (192.168.1.27)**: Primary coordination node with 28 Ollama models
- **IRONWOOD (192.168.1.113)**: Content processing with 12 specialized models  
- **ROSEWOOD (192.168.1.22)**: QA validation with 9 focused models

### Data Privacy & Ethics
- Respect robots.txt and rate limiting
- Only scrape publicly available information
- Contact organization for private data requests
- Ensure GDPR/privacy compliance for any personal data

### Integration with Alpha-1 System
- Use existing database schema and API endpoints
- Validate imported data against current system constraints
- Update system configuration through admin interface
- Test imported data with frontend application

This plan leverages our distributed AI infrastructure to efficiently migrate real-world tool library data into our new system.