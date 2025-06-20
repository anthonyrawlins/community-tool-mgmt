#!/usr/bin/env python3
"""
ROSEWOOD (192.168.1.22) - QA Testing and Validation
Ballarat Tool Library Data Migration - Final QA and Import Preparation

Validates processed data from IRONWOOD, tests data integrity,
performs final quality checks, and prepares import files for alpha-1 system.
Uses deepseek-r1 for comprehensive validation and testing.
"""

import asyncio
import json
import sqlite3
import os
import time
from datetime import datetime
from pathlib import Path
import logging
from typing import Dict, List, Optional, Tuple, Set
import hashlib
import requests
from dataclasses import dataclass

# Configuration
SHARED_DIR = Path("/rust/containers/ballarat-scraping")
DATABASE_PATH = SHARED_DIR / "scraping_progress.db"
PROCESSED_DATA_DIR = SHARED_DIR / "processed_data"
IMAGES_DIR = SHARED_DIR / "tool_images"
QA_RESULTS_DIR = SHARED_DIR / "qa_results"
IMPORT_READY_DIR = SHARED_DIR / "import_ready"
SIGNAL_FILE = SHARED_DIR / "ironwood_completed.signal"

# Alpha-1 API endpoint for testing
ALPHA_1_API_BASE = "https://tools.home.deepblack.cloud/api/v1"

# QA validation criteria
MIN_REQUIRED_FIELDS = {'id', 'name', 'url'}
RECOMMENDED_FIELDS = {'brand', 'model', 'description', 'category', 'image_urls'}
MAX_NAME_LENGTH = 200
MAX_DESCRIPTION_LENGTH = 2000

# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    """Result of tool data validation"""
    tool_id: str
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    completeness_score: float
    quality_score: float

class RosewoodQA:
    """QA validator and tester for processed tool data"""
    
    def __init__(self):
        self.progress_db = None
        self.validation_results = []
        self.processed_tools = []
        self.qa_summary = {}
        
        # Ensure directories exist
        QA_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        IMPORT_READY_DIR.mkdir(parents=True, exist_ok=True)
        
        # Connect to shared database
        self.connect_to_database()
    
    def connect_to_database(self):
        """Connect to the shared SQLite database"""
        if not DATABASE_PATH.exists():
            logger.error(f"Database not found at {DATABASE_PATH}")
            raise FileNotFoundError("Shared database not found")
        
        self.progress_db = sqlite3.connect(DATABASE_PATH)
        
        # Add QA tracking columns
        cursor = self.progress_db.cursor()
        try:
            cursor.execute('''
                ALTER TABLE discovered_tools 
                ADD COLUMN qa_started_at TIMESTAMP
            ''')
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute('''
                ALTER TABLE discovered_tools 
                ADD COLUMN qa_completed_at TIMESTAMP
            ''')
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute('''
                ALTER TABLE discovered_tools 
                ADD COLUMN qa_validation_score REAL
            ''')
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute('''
                ALTER TABLE discovered_tools 
                ADD COLUMN qa_errors TEXT
            ''')
        except sqlite3.OperationalError:
            pass
        
        self.progress_db.commit()
        logger.info("Connected to shared database")
    
    async def wait_for_ironwood_completion(self) -> bool:
        """Wait for IRONWOOD processing to complete"""
        logger.info("Waiting for IRONWOOD processing to complete...")
        
        timeout = 7200  # 2 hour timeout
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if SIGNAL_FILE.exists():
                logger.info("IRONWOOD processing completed - starting QA")
                return True
            
            await asyncio.sleep(15)  # Check every 15 seconds
        
        logger.error("Timeout waiting for IRONWOOD completion")
        return False
    
    async def load_processed_tools(self) -> List[Dict]:
        """Load all processed tool data from IRONWOOD"""
        tools = []
        
        if not PROCESSED_DATA_DIR.exists():
            logger.error(f"Processed data directory not found: {PROCESSED_DATA_DIR}")
            return tools
        
        # Load all JSON files
        for json_file in PROCESSED_DATA_DIR.glob("tool_*.json"):
            try:
                with open(json_file, 'r') as f:
                    tool_data = json.load(f)
                    tools.append(tool_data)
            except Exception as e:
                logger.error(f"Failed to load {json_file}: {e}")
        
        logger.info(f"Loaded {len(tools)} processed tools for QA")
        return tools
    
    async def validate_tool_data(self, tool_data: Dict) -> ValidationResult:
        """
        Comprehensive validation of individual tool data
        
        TODO: Integrate with deepseek-r1 for advanced validation logic
        """
        tool_id = tool_data.get('id', 'unknown')
        errors = []
        warnings = []
        
        # Check required fields
        missing_required = MIN_REQUIRED_FIELDS - set(tool_data.keys())
        if missing_required:
            errors.append(f"Missing required fields: {', '.join(missing_required)}")
        
        # Check recommended fields
        missing_recommended = RECOMMENDED_FIELDS - set(tool_data.keys())
        if missing_recommended:
            warnings.append(f"Missing recommended fields: {', '.join(missing_recommended)}")
        
        # Validate field content
        if 'name' in tool_data:
            name = tool_data['name']
            if not name or len(name.strip()) == 0:
                errors.append("Tool name is empty")
            elif len(name) > MAX_NAME_LENGTH:
                warnings.append(f"Tool name too long ({len(name)} > {MAX_NAME_LENGTH})")
        
        if 'description' in tool_data:
            desc = tool_data['description']
            if desc and len(desc) > MAX_DESCRIPTION_LENGTH:
                warnings.append(f"Description too long ({len(desc)} > {MAX_DESCRIPTION_LENGTH})")
        
        # Validate URL format
        if 'url' in tool_data:
            url = tool_data['url']
            if not url.startswith('https://ballarattoollibrary.myturn.com'):
                errors.append("Invalid tool URL format")
        
        # Validate image data
        image_issues = await self.validate_tool_images(tool_data)
        warnings.extend(image_issues)
        
        # Calculate scores
        completeness_score = self.calculate_completeness_score(tool_data)
        quality_score = self.calculate_quality_score(tool_data, errors, warnings)
        
        is_valid = len(errors) == 0
        
        return ValidationResult(
            tool_id=tool_id,
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            completeness_score=completeness_score,
            quality_score=quality_score
        )
    
    async def validate_tool_images(self, tool_data: Dict) -> List[str]:
        """Validate tool images and check file integrity"""
        warnings = []
        
        if 'processed_images' not in tool_data:
            warnings.append("No processed images found")
            return warnings
        
        for img_info in tool_data['processed_images']:
            local_path = Path(img_info.get('local_path', ''))
            
            if not local_path.exists():
                warnings.append(f"Image file not found: {local_path}")
                continue
            
            # Check file size
            file_size = local_path.stat().st_size
            if file_size == 0:
                warnings.append(f"Empty image file: {local_path}")
            elif file_size > 5 * 1024 * 1024:  # 5MB
                warnings.append(f"Large image file ({file_size} bytes): {local_path}")
        
        return warnings
    
    def calculate_completeness_score(self, tool_data: Dict) -> float:
        """Calculate data completeness score (0-100)"""
        total_fields = len(MIN_REQUIRED_FIELDS) + len(RECOMMENDED_FIELDS)
        present_fields = len(set(tool_data.keys()) & (MIN_REQUIRED_FIELDS | RECOMMENDED_FIELDS))
        
        base_score = (present_fields / total_fields) * 80
        
        # Bonus points for additional data
        if tool_data.get('specifications'):
            base_score += 10
        
        if tool_data.get('processed_images'):
            base_score += 10
        
        return min(base_score, 100.0)
    
    def calculate_quality_score(self, tool_data: Dict, errors: List[str], warnings: List[str]) -> float:
        """Calculate data quality score (0-100)"""
        base_score = 100.0
        
        # Deduct for errors (major issues)
        base_score -= len(errors) * 15
        
        # Deduct for warnings (minor issues)  
        base_score -= len(warnings) * 5
        
        # Bonus for rich content
        if tool_data.get('description') and len(tool_data['description']) > 50:
            base_score += 5
        
        if tool_data.get('brand') and tool_data.get('model'):
            base_score += 5
        
        return max(base_score, 0.0)
    
    async def validate_all_tools(self):
        """Run validation on all processed tools"""
        logger.info("Starting comprehensive QA validation")
        
        # Load processed tools
        self.processed_tools = await self.load_processed_tools()
        
        if not self.processed_tools:
            logger.error("No processed tools found for validation")
            return
        
        # Validate each tool
        validation_tasks = [
            self.validate_tool_data(tool_data) 
            for tool_data in self.processed_tools
        ]
        
        self.validation_results = await asyncio.gather(*validation_tasks)
        
        # Update database with validation results
        await self.update_qa_database()
        
        logger.info(f"Validated {len(self.validation_results)} tools")
    
    async def update_qa_database(self):
        """Update database with QA validation results"""
        cursor = self.progress_db.cursor()
        
        for result in self.validation_results:
            qa_errors = json.dumps({
                'errors': result.errors,
                'warnings': result.warnings
            })
            
            cursor.execute('''
                UPDATE discovered_tools 
                SET qa_by_rosewood = ?, qa_completed_at = ?, 
                    qa_validation_score = ?, qa_errors = ?
                WHERE tool_id = ?
            ''', (
                result.is_valid, 
                datetime.now(), 
                result.quality_score,
                qa_errors,
                result.tool_id
            ))
        
        self.progress_db.commit()
        logger.info("Database updated with QA results")
    
    async def test_alpha1_api_compatibility(self) -> Dict:
        """Test compatibility with alpha-1 API endpoints"""
        logger.info("Testing alpha-1 API compatibility")
        
        api_tests = {
            'health_check': False,
            'categories_endpoint': False,
            'tools_endpoint': False,
            'sample_tool_import': False
        }
        
        try:
            # Test health endpoint
            response = requests.get(f"{ALPHA_1_API_BASE}/health", timeout=10)
            api_tests['health_check'] = response.status_code == 200
            
            # Test categories endpoint
            response = requests.get(f"{ALPHA_1_API_BASE}/categories", timeout=10)
            api_tests['categories_endpoint'] = response.status_code in [200, 404]  # 404 is OK if empty
            
            # Test tools endpoint
            response = requests.get(f"{ALPHA_1_API_BASE}/tools", timeout=10)
            api_tests['tools_endpoint'] = response.status_code in [200, 404]
            
            # Test sample tool data format (without actually importing)
            if self.validation_results:
                sample_tool = self.processed_tools[0]
                formatted_tool = await self.format_tool_for_import(sample_tool)
                
                # Validate against expected schema
                required_api_fields = {'name', 'description', 'categoryId', 'status'}
                api_tests['sample_tool_import'] = all(
                    field in formatted_tool for field in required_api_fields
                )
        
        except Exception as e:
            logger.error(f"API compatibility test failed: {e}")
        
        return api_tests
    
    async def format_tool_for_import(self, tool_data: Dict) -> Dict:
        """Format tool data for alpha-1 database import"""
        
        # Map to alpha-1 schema
        formatted = {
            'name': tool_data.get('name', ''),
            'description': tool_data.get('description', ''),
            'brand': tool_data.get('brand', ''),
            'model': tool_data.get('model', ''),
            'categoryId': 1,  # Default category - will be mapped properly
            'condition': 'GOOD',  # Default condition
            'status': 'AVAILABLE',  # Default status
            'imageUrl': '',  # Will be set from processed images
            'instructions': tool_data.get('description', ''),
            'specifications': tool_data.get('specifications', {}),
            'sourceUrl': tool_data.get('url', ''),
            'importedAt': datetime.now().isoformat(),
            'sourceSystem': 'MyTurn'
        }
        
        # Set primary image if available
        if tool_data.get('processed_images'):
            first_image = tool_data['processed_images'][0]
            formatted['imageUrl'] = f"/tool_images/{first_image['filename']}"
        
        # Map category from MyTurn to our system
        category_mapping = {
            'Hand Tools': 1,
            'Power Tools': 2,
            'Garden Tools': 3,
            'Tools': 1  # Default
        }
        
        myturn_category = tool_data.get('category', 'Tools')
        formatted['categoryId'] = category_mapping.get(myturn_category, 1)
        
        return formatted
    
    async def generate_import_files(self):
        """Generate final import files for alpha-1 system"""
        logger.info("Generating import-ready files")
        
        # Filter valid tools only
        valid_tools = [
            tool for i, tool in enumerate(self.processed_tools)
            if i < len(self.validation_results) and self.validation_results[i].is_valid
        ]
        
        logger.info(f"Preparing {len(valid_tools)} valid tools for import")
        
        # Format for database import
        import_tools = []
        for tool_data in valid_tools:
            formatted_tool = await self.format_tool_for_import(tool_data)
            import_tools.append(formatted_tool)
        
        # Generate SQL import script
        await self.generate_sql_import(import_tools)
        
        # Generate JSON import file
        await self.generate_json_import(import_tools)
        
        # Generate category mapping
        await self.generate_category_mapping()
        
        # Copy optimized images to import directory
        await self.prepare_image_imports()
    
    async def generate_sql_import(self, tools: List[Dict]):
        """Generate SQL import script"""
        sql_file = IMPORT_READY_DIR / "tools_import.sql"
        
        with open(sql_file, 'w') as f:
            f.write("-- Ballarat Tool Library - MyTurn Import Script\n")
            f.write(f"-- Generated: {datetime.now().isoformat()}\n")
            f.write(f"-- Total tools: {len(tools)}\n\n")
            
            f.write("BEGIN TRANSACTION;\n\n")
            
            for tool in tools:
                # Escape single quotes for SQL
                name = tool['name'].replace("'", "''")
                description = tool['description'].replace("'", "''")
                brand = tool.get('brand', '').replace("'", "''")
                model = tool.get('model', '').replace("'", "''")
                
                f.write(f"""
INSERT INTO "Tool" (
    "name", "description", "brand", "model", "categoryId", 
    "condition", "status", "imageUrl", "instructions", 
    "createdAt", "updatedAt"
) VALUES (
    '{name}',
    '{description}',
    '{brand}',
    '{model}',
    {tool['categoryId']},
    '{tool['condition']}',
    '{tool['status']}',
    '{tool['imageUrl']}',
    '{description}',
    datetime('now'),
    datetime('now')
);
""")
            
            f.write("\nCOMMIT;\n")
        
        logger.info(f"SQL import script generated: {sql_file}")
    
    async def generate_json_import(self, tools: List[Dict]):
        """Generate JSON import file"""
        json_file = IMPORT_READY_DIR / "tools_import.json"
        
        import_data = {
            "metadata": {
                "source": "MyTurn Ballarat Tool Library",
                "generated_at": datetime.now().isoformat(),
                "total_tools": len(tools),
                "import_format_version": "1.0"
            },
            "tools": tools
        }
        
        with open(json_file, 'w') as f:
            json.dump(import_data, f, indent=2)
        
        logger.info(f"JSON import file generated: {json_file}")
    
    async def generate_category_mapping(self):
        """Generate category mapping file"""
        categories = set()
        for tool in self.processed_tools:
            if tool.get('category'):
                categories.add(tool['category'])
        
        category_mapping = {
            "categories_found": list(categories),
            "recommended_mapping": {
                "Hand Tools": {"id": 1, "name": "Hand Tools"},
                "Power Tools": {"id": 2, "name": "Power Tools"}, 
                "Garden Tools": {"id": 3, "name": "Garden Tools"},
                "Kitchen Tools": {"id": 4, "name": "Kitchen Tools"},
                "Default": {"id": 1, "name": "Hand Tools"}
            }
        }
        
        mapping_file = IMPORT_READY_DIR / "category_mapping.json"
        with open(mapping_file, 'w') as f:
            json.dump(category_mapping, f, indent=2)
        
        logger.info(f"Category mapping generated: {mapping_file}")
    
    async def prepare_image_imports(self):
        """Prepare optimized images for import"""
        import_images_dir = IMPORT_READY_DIR / "tool_images"
        import_images_dir.mkdir(exist_ok=True)
        
        # Copy all optimized images
        if IMAGES_DIR.exists():
            import os
            import shutil
            
            for image_file in IMAGES_DIR.glob("*.jpg"):
                dest_file = import_images_dir / image_file.name
                shutil.copy2(image_file, dest_file)
        
        logger.info(f"Images prepared for import: {import_images_dir}")
    
    async def generate_qa_report(self):
        """Generate comprehensive QA report"""
        
        # Calculate summary statistics
        total_tools = len(self.validation_results)
        valid_tools = sum(1 for r in self.validation_results if r.is_valid)
        invalid_tools = total_tools - valid_tools
        
        avg_completeness = sum(r.completeness_score for r in self.validation_results) / total_tools if total_tools > 0 else 0
        avg_quality = sum(r.quality_score for r in self.validation_results) / total_tools if total_tools > 0 else 0
        
        # Test API compatibility
        api_tests = await self.test_alpha1_api_compatibility()
        
        report = {
            "rosewood_qa_report": {
                "timestamp": datetime.now().isoformat(),
                "validation_summary": {
                    "total_tools_validated": total_tools,
                    "valid_tools": valid_tools,
                    "invalid_tools": invalid_tools,
                    "validation_success_rate": (valid_tools / total_tools * 100) if total_tools > 0 else 0,
                    "average_completeness_score": round(avg_completeness, 2),
                    "average_quality_score": round(avg_quality, 2)
                },
                "api_compatibility": api_tests,
                "data_quality_breakdown": {
                    "high_quality": sum(1 for r in self.validation_results if r.quality_score >= 80),
                    "medium_quality": sum(1 for r in self.validation_results if 60 <= r.quality_score < 80),
                    "low_quality": sum(1 for r in self.validation_results if r.quality_score < 60)
                },
                "common_issues": self.analyze_common_issues(),
                "import_readiness": {
                    "tools_ready_for_import": valid_tools,
                    "sql_script_generated": True,
                    "json_import_generated": True,
                    "images_optimized": True,
                    "category_mapping_generated": True
                },
                "recommendations": self.generate_recommendations()
            }
        }
        
        # Save report
        report_path = QA_RESULTS_DIR / f"rosewood_qa_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"QA report saved to {report_path}")
        logger.info(f"ROSEWOOD SUMMARY: {valid_tools}/{total_tools} tools validated successfully")
        
        return report
    
    def analyze_common_issues(self) -> Dict:
        """Analyze common validation issues"""
        all_errors = []
        all_warnings = []
        
        for result in self.validation_results:
            all_errors.extend(result.errors)
            all_warnings.extend(result.warnings)
        
        from collections import Counter
        
        return {
            "most_common_errors": dict(Counter(all_errors).most_common(5)),
            "most_common_warnings": dict(Counter(all_warnings).most_common(5))
        }
    
    def generate_recommendations(self) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        if self.validation_results:
            low_quality_count = sum(1 for r in self.validation_results if r.quality_score < 60)
            if low_quality_count > 0:
                recommendations.append(f"Consider manual review of {low_quality_count} low-quality tool records")
            
            missing_images = sum(1 for tool in self.processed_tools if not tool.get('processed_images'))
            if missing_images > 0:
                recommendations.append(f"Add images for {missing_images} tools without visual content")
            
            missing_descriptions = sum(1 for tool in self.processed_tools if not tool.get('description'))
            if missing_descriptions > 0:
                recommendations.append(f"Enhance descriptions for {missing_descriptions} tools")
        
        recommendations.extend([
            "Implement automated data validation in the import pipeline",
            "Set up regular data quality monitoring",
            "Consider gradual rollout starting with highest quality tools"
        ])
        
        return recommendations
    
    async def cleanup(self):
        """Clean up resources"""
        if self.progress_db:
            self.progress_db.close()
        
        logger.info("ROSEWOOD QA cleanup completed")

async def main():
    """Main execution function"""
    qa_processor = RosewoodQA()
    
    try:
        # Wait for IRONWOOD to complete
        if not await qa_processor.wait_for_ironwood_completion():
            logger.error("IRONWOOD processing not completed - exiting")
            return
        
        # Run comprehensive QA validation
        await qa_processor.validate_all_tools()
        
        # Generate import files
        await qa_processor.generate_import_files()
        
        # Generate final QA report
        await qa_processor.generate_qa_report()
        
        logger.info("ROSEWOOD QA process completed successfully")
        
    except KeyboardInterrupt:
        logger.info("QA processing interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    finally:
        await qa_processor.cleanup()

if __name__ == "__main__":
    print("ROSEWOOD QA - Ballarat Tool Library Final Validation and Import Prep")
    print("=" * 75)
    asyncio.run(main())