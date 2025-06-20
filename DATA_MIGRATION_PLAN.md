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

**MyTurn Catalog Discovery:**
- ✅ **Direct Access Found**: https://ballarattoollibrary.myturn.com/library/inventory/browse
- ✅ **Complete Tool Database**: 1,209 total items available
- ✅ **Rich Data Structure**: Detailed specifications, images, categories
- ✅ **Public Access**: No authentication required for catalog browsing

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

4. **Tool Inventory** (1,209 items with full details):
   - **Categories**: Tools (1,009), Books & Media, Sports & Outdoors, Kitchen & Dining
   - **Detailed Structure**: Inventory > Tools > Hand Tools > [Subcategories]
   - **Rich Metadata**: Manufacturer, Product codes, Specifications, Weight, Size
   - **Visual Assets**: Multiple image sizes (200x150, 1024x768) hosted on AWS S3
   - **Descriptions**: Detailed usage instructions and safety information
   - **Availability**: Real-time stock status and location information

**Medium Priority (Enhanced with Direct Access):**
1. **Automated Tool Import** (Now Possible):
   - **URL Pattern**: `/library/inventory/show/{itemID}` for 1,209 tools
   - **Data Fields Available**: Name, manufacturer, product codes, specifications, images
   - **Categories**: Full hierarchy (Inventory > Tools > [Category] > [Subcategory])
   - **Visual Assets**: High-quality images ready for download
   - **Descriptions**: Usage instructions and safety information

2. **Member System Integration** (Still Requires Access):
   - MyTurn.com admin access for member data
   - Historical loan/reservation records
   - Member preferences and contact information

### 2.2 Database Mapping Strategy

**Our Alpha-1 Schema → Ballarat Data:**
```sql
-- Tool Import (1,209 items ready)
Tool table:
  - name: Direct from MyTurn titles
  - description: Usage instructions from detail pages
  - brand: Manufacturer field (e.g., "Trojan")
  - model: Product codes (e.g., "TJI3015") 
  - categoryId: Map from hierarchical categories
  - condition: Default to "GOOD" (verify from availability)
  - status: "AVAILABLE" (from stock status)
  - imageUrl: Download from AWS S3 hosting
  - instructions: From description fields
  - purchasePrice: Not available in public data
  - replacementValue: Not available in public data

-- Tool Categories (Hierarchical)
ToolCategory table:
  - Root: "Tools" (1,009 items)
  - Level 2: "Hand Tools", "Power Tools", etc.
  - Level 3: "Clamps & Brackets", etc.
  - Also: "Books & Media", "Sports & Outdoors", "Kitchen & Dining"

-- System Configuration  
SystemConfig table:
  - Operating hours: Tue 4-6pm, Sat 10am-12pm
  - Late fee policies: $1/$5 per day
  - Location: "25-39 Barkly St, Ballarat East"
  - Total inventory: 1,209 items
```

## Phase 3: Implementation Approach

### 3.1 Automated Scraping (Development Cluster)
```python
# Enhanced Distributed Workflow (1,209 tools)
WALNUT_TASKS = [
    "scrape_main_catalog_pages",           # 72 pages, 15 items each
    "extract_tool_detail_pages",           # 1,209 individual tool pages  
    "download_tool_images",                # AWS S3 hosted images
    "parse_category_hierarchy",            # Full tree structure
    "extract_organizational_data"          # Hours, location, policies
]

IRONWOOD_TASKS = [
    "validate_tool_specifications",        # Manufacturer, codes, specs
    "process_and_optimize_images",         # Resize, format for web
    "normalize_category_data",             # Map to our schema
    "validate_data_completeness"           # Check all required fields
]

ROSEWOOD_TASKS = [
    "qa_test_imported_data",              # Validate against our API
    "verify_image_downloads",             # Ensure all images accessible  
    "test_category_hierarchy",            # Verify parent/child relationships
    "integration_testing"                # Test with alpha-1 system
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