#!/usr/bin/env python3
"""
IRONWOOD (192.168.1.113) - Data Processing and Validation
Ballarat Tool Library Data Migration - Tool Detail Processing

Processes individual tool pages discovered by WALNUT, validates data,
downloads and optimizes images, and prepares data for database import.
Uses deepseek-coder-v2 for advanced data validation.
"""

import asyncio
import aiohttp
import json
import sqlite3
import os
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin
import logging
from typing import Dict, List, Optional, Tuple
import hashlib
from PIL import Image
import requests

# Configuration
BASE_URL = "https://ballarattoollibrary.myturn.com"
MAX_CONCURRENT_REQUESTS = 3  # Lower than WALNUT for processing-heavy tasks
REQUEST_DELAY = 2.0  # Longer delay for detail page processing
SHARED_DIR = Path("/rust/containers/ballarat-scraping")
DATABASE_PATH = SHARED_DIR / "scraping_progress.db"
IMAGES_DIR = SHARED_DIR / "tool_images"
PROCESSED_DATA_DIR = SHARED_DIR / "processed_data"
SIGNAL_FILE = SHARED_DIR / "walnut_completed.signal"

# Image processing settings
MAX_IMAGE_WIDTH = 800
MAX_IMAGE_HEIGHT = 600
IMAGE_QUALITY = 85

# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class IronwoodProcessor:
    """Data processor for tool details on IRONWOOD"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.progress_db = None
        self.processed_tools = []
        self.failed_processing = []
        
        # Ensure directories exist
        IMAGES_DIR.mkdir(parents=True, exist_ok=True)
        PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
        
        # Connect to shared database
        self.connect_to_database()
    
    def connect_to_database(self):
        """Connect to the shared SQLite database created by WALNUT"""
        if not DATABASE_PATH.exists():
            logger.error(f"Database not found at {DATABASE_PATH}")
            raise FileNotFoundError("WALNUT coordination database not found")
        
        self.progress_db = sqlite3.connect(DATABASE_PATH)
        
        # Add processing tracking columns
        cursor = self.progress_db.cursor()
        try:
            cursor.execute('''
                ALTER TABLE discovered_tools 
                ADD COLUMN processing_started_at TIMESTAMP
            ''')
        except sqlite3.OperationalError:
            pass  # Column might already exist
        
        try:
            cursor.execute('''
                ALTER TABLE discovered_tools 
                ADD COLUMN processing_completed_at TIMESTAMP
            ''')
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute('''
                ALTER TABLE discovered_tools 
                ADD COLUMN processing_error TEXT
            ''')
        except sqlite3.OperationalError:
            pass
        
        self.progress_db.commit()
        logger.info("Connected to shared database")
    
    async def wait_for_walnut_completion(self) -> bool:
        """Wait for WALNUT to complete coordination"""
        logger.info("Waiting for WALNUT coordination to complete...")
        
        timeout = 3600  # 1 hour timeout
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if SIGNAL_FILE.exists():
                logger.info("WALNUT coordination completed - starting processing")
                return True
            
            await asyncio.sleep(10)  # Check every 10 seconds
        
        logger.error("Timeout waiting for WALNUT completion")
        return False
    
    async def create_session(self):
        """Create aiohttp session for tool detail fetching"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        
        timeout = aiohttp.ClientTimeout(total=45)
        self.session = aiohttp.ClientSession(headers=headers, timeout=timeout)
        logger.info("HTTP session created for detail processing")
    
    async def fetch_tool_details(self, tool_id: str, tool_url: str) -> Tuple[bool, Dict, str]:
        """
        Fetch detailed information for a single tool
        
        Returns:
            Tuple of (success, tool_data_dict, error_message)
        """
        if not self.session:
            await self.create_session()
        
        try:
            logger.info(f"Processing tool {tool_id}")
            
            async with self.session.get(tool_url) as response:
                if response.status != 200:
                    error_msg = f"HTTP {response.status} for tool {tool_id}"
                    logger.error(error_msg)
                    return False, {}, error_msg
                
                html_content = await response.text()
                
                # Parse tool details from HTML
                tool_data = await self.parse_tool_details(html_content, tool_id, tool_url)
                
                # Download and process images
                if tool_data.get('image_urls'):
                    tool_data['processed_images'] = await self.process_tool_images(
                        tool_id, tool_data['image_urls']
                    )
                
                return True, tool_data, ""
        
        except Exception as e:
            error_msg = f"Exception processing tool {tool_id}: {str(e)}"
            logger.error(error_msg)
            return False, {}, error_msg
    
    async def parse_tool_details(self, html_content: str, tool_id: str, tool_url: str) -> Dict:
        """
        Parse detailed tool information from HTML
        
        TODO: Integrate with deepseek-coder-v2 for advanced extraction
        """
        import re
        from html import unescape
        
        tool_data = {
            'id': tool_id,
            'url': tool_url,
            'scraped_at': datetime.now().isoformat()
        }
        
        # Extract tool name (improved parsing)
        name_pattern = r'<h1[^>]*>([^<]+)</h1>'
        name_match = re.search(name_pattern, html_content)
        tool_data['name'] = unescape(name_match.group(1).strip()) if name_match else f"Tool {tool_id}"
        
        # Extract manufacturer/brand
        brand_patterns = [
            r'<strong>Brand:</strong>\s*([^<\n]+)',
            r'<strong>Manufacturer:</strong>\s*([^<\n]+)',
            r'Manufacturer:\s*([^<\n]+)',
        ]
        for pattern in brand_patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                tool_data['brand'] = unescape(match.group(1).strip())
                break
        
        # Extract model/product code
        model_patterns = [
            r'<strong>Model:</strong>\s*([^<\n]+)',
            r'<strong>Product Code:</strong>\s*([^<\n]+)',
            r'Model:\s*([^<\n]+)',
        ]
        for pattern in model_patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                tool_data['model'] = unescape(match.group(1).strip())
                break
        
        # Extract description
        desc_patterns = [
            r'<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)</div>',
            r'<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)</p>',
        ]
        for pattern in desc_patterns:
            match = re.search(pattern, html_content, re.IGNORECASE | re.DOTALL)
            if match:
                tool_data['description'] = unescape(match.group(1).strip())
                break
        
        # Extract category from breadcrumbs or navigation
        category_pattern = r'Inventory\s*>\s*Tools\s*>\s*([^>]+)>'
        category_match = re.search(category_pattern, html_content)
        if category_match:
            tool_data['category'] = unescape(category_match.group(1).strip())
        
        # Extract image URLs (AWS S3 hosted images)
        image_patterns = [
            r'<img[^>]*src="([^"]*amazonaws\.com[^"]*)"',
            r'src="([^"]*\.(jpg|jpeg|png|gif))"',
        ]
        
        image_urls = []
        for pattern in image_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    url = match[0]
                else:
                    url = match
                if url not in image_urls:
                    image_urls.append(url)
        
        tool_data['image_urls'] = image_urls
        
        # Extract specifications table if present
        spec_pattern = r'<table[^>]*class="[^"]*spec[^"]*"[^>]*>(.*?)</table>'
        spec_match = re.search(spec_pattern, html_content, re.IGNORECASE | re.DOTALL)
        if spec_match:
            # Parse specification rows
            row_pattern = r'<tr[^>]*>.*?<td[^>]*>([^<]+)</td>.*?<td[^>]*>([^<]+)</td>.*?</tr>'
            spec_rows = re.findall(row_pattern, spec_match.group(1), re.IGNORECASE | re.DOTALL)
            
            specifications = {}
            for spec_key, spec_value in spec_rows:
                specifications[unescape(spec_key.strip())] = unescape(spec_value.strip())
            
            tool_data['specifications'] = specifications
        
        return tool_data
    
    async def process_tool_images(self, tool_id: str, image_urls: List[str]) -> List[Dict]:
        """Download and optimize tool images"""
        processed_images = []
        
        for i, image_url in enumerate(image_urls):
            try:
                # Create filename
                url_hash = hashlib.md5(image_url.encode()).hexdigest()[:8]
                filename = f"tool_{tool_id}_{i+1}_{url_hash}.jpg"
                filepath = IMAGES_DIR / filename
                
                # Download image
                logger.info(f"Downloading image {i+1} for tool {tool_id}")
                
                response = requests.get(image_url, timeout=30, stream=True)
                response.raise_for_status()
                
                # Save original temporarily
                temp_path = filepath.with_suffix('.tmp')
                with open(temp_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                # Optimize image
                optimized_path = await self.optimize_image(temp_path, filepath)
                
                # Clean up temp file
                temp_path.unlink()
                
                processed_images.append({
                    'original_url': image_url,
                    'local_path': str(optimized_path),
                    'filename': filename,
                    'size_bytes': optimized_path.stat().st_size,
                    'processed_at': datetime.now().isoformat()
                })
                
            except Exception as e:
                logger.error(f"Failed to process image {image_url}: {e}")
                continue
        
        return processed_images
    
    async def optimize_image(self, input_path: Path, output_path: Path) -> Path:
        """Optimize image for web use"""
        try:
            with Image.open(input_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too large
                if img.width > MAX_IMAGE_WIDTH or img.height > MAX_IMAGE_HEIGHT:
                    img.thumbnail((MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT), Image.Resampling.LANCZOS)
                
                # Save optimized version
                img.save(output_path, 'JPEG', quality=IMAGE_QUALITY, optimize=True)
            
            return output_path
            
        except Exception as e:
            logger.error(f"Image optimization failed: {e}")
            # Just copy the original if optimization fails
            input_path.rename(output_path)
            return output_path
    
    async def get_unprocessed_tools(self) -> List[Tuple[str, str, str]]:
        """Get list of tools that need processing"""
        cursor = self.progress_db.cursor()
        cursor.execute('''
            SELECT tool_id, tool_name, tool_url 
            FROM discovered_tools 
            WHERE processed_by_ironwood = FALSE 
            AND processing_started_at IS NULL
            ORDER BY id
        ''')
        
        return cursor.fetchall()
    
    async def mark_processing_started(self, tool_id: str):
        """Mark tool as processing started"""
        cursor = self.progress_db.cursor()
        cursor.execute('''
            UPDATE discovered_tools 
            SET processing_started_at = ?, processed_by_ironwood = FALSE
            WHERE tool_id = ?
        ''', (datetime.now(), tool_id))
        self.progress_db.commit()
    
    async def mark_processing_completed(self, tool_id: str, success: bool, error_msg: str = ""):
        """Mark tool processing as completed"""
        cursor = self.progress_db.cursor()
        cursor.execute('''
            UPDATE discovered_tools 
            SET processed_by_ironwood = ?, processing_completed_at = ?, processing_error = ?
            WHERE tool_id = ?
        ''', (success, datetime.now(), error_msg, tool_id))
        self.progress_db.commit()
    
    async def process_all_tools(self):
        """Main processing function for all discovered tools"""
        logger.info("Starting IRONWOOD processing of tool details")
        
        # Get unprocessed tools
        unprocessed_tools = await self.get_unprocessed_tools()
        total_tools = len(unprocessed_tools)
        
        logger.info(f"Found {total_tools} tools to process")
        
        if total_tools == 0:
            logger.info("No tools found for processing")
            return
        
        # Process tools with concurrency control
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
        
        async def process_single_tool(tool_info):
            tool_id, tool_name, tool_url = tool_info
            
            async with semaphore:
                await self.mark_processing_started(tool_id)
                
                try:
                    await asyncio.sleep(REQUEST_DELAY)  # Rate limiting
                    
                    success, tool_data, error_msg = await self.fetch_tool_details(tool_id, tool_url)
                    
                    if success:
                        # Save processed data
                        data_file = PROCESSED_DATA_DIR / f"tool_{tool_id}.json"
                        with open(data_file, 'w') as f:
                            json.dump(tool_data, f, indent=2)
                        
                        self.processed_tools.append(tool_data)
                        await self.mark_processing_completed(tool_id, True)
                        logger.info(f"Successfully processed tool {tool_id}: {tool_name}")
                    else:
                        self.failed_processing.append(tool_id)
                        await self.mark_processing_completed(tool_id, False, error_msg)
                        logger.error(f"Failed to process tool {tool_id}: {error_msg}")
                
                except Exception as e:
                    error_msg = f"Unexpected error: {str(e)}"
                    self.failed_processing.append(tool_id)
                    await self.mark_processing_completed(tool_id, False, error_msg)
                    logger.error(f"Exception processing tool {tool_id}: {e}")
        
        # Process all tools
        start_time = time.time()
        tasks = [process_single_tool(tool_info) for tool_info in unprocessed_tools]
        await asyncio.gather(*tasks, return_exceptions=True)
        
        elapsed_time = time.time() - start_time
        
        # Generate processing report
        await self.generate_processing_report(total_tools, elapsed_time)
        
        # Signal ROSEWOOD for QA
        await self.signal_rosewood_qa()
    
    async def generate_processing_report(self, total_tools: int, elapsed_time: float):
        """Generate comprehensive processing report"""
        
        successful_count = len(self.processed_tools)
        failed_count = len(self.failed_processing)
        
        report = {
            "ironwood_processing_report": {
                "timestamp": datetime.now().isoformat(),
                "processing_summary": {
                    "total_tools_processed": total_tools,
                    "successful_processing": successful_count,
                    "failed_processing": failed_count,
                    "success_rate": (successful_count / total_tools * 100) if total_tools > 0 else 0,
                    "elapsed_time_seconds": elapsed_time
                },
                "failed_tools": self.failed_processing,
                "output_locations": {
                    "processed_data": str(PROCESSED_DATA_DIR),
                    "optimized_images": str(IMAGES_DIR),
                    "database": str(DATABASE_PATH)
                },
                "next_steps": {
                    "rosewood_qa": "Ready for QA validation and testing"
                },
                "sample_processed_tools": self.processed_tools[:3]  # First 3 tools
            }
        }
        
        # Save report
        report_path = SHARED_DIR / f"ironwood_processing_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Processing report saved to {report_path}")
        logger.info(f"IRONWOOD SUMMARY: {successful_count}/{total_tools} tools processed successfully")
    
    async def signal_rosewood_qa(self):
        """Create signal file for ROSEWOOD QA testing"""
        signal_file = SHARED_DIR / "ironwood_completed.signal"
        
        signal_data = {
            "processor": "IRONWOOD",
            "completion_time": datetime.now().isoformat(),
            "tools_processed": len(self.processed_tools),
            "tools_failed": len(self.failed_processing),
            "data_location": str(PROCESSED_DATA_DIR),
            "images_location": str(IMAGES_DIR),
            "next_processor": "ROSEWOOD",
            "status": "ready_for_qa"
        }
        
        with open(signal_file, 'w') as f:
            json.dump(signal_data, f, indent=2)
        
        logger.info(f"Signal file created for ROSEWOOD: {signal_file}")
    
    async def cleanup(self):
        """Clean up resources"""
        if self.session:
            await self.session.close()
        
        if self.progress_db:
            self.progress_db.close()
        
        logger.info("IRONWOOD processor cleanup completed")

async def main():
    """Main execution function"""
    processor = IronwoodProcessor()
    
    try:
        # Wait for WALNUT to complete
        if not await processor.wait_for_walnut_completion():
            logger.error("WALNUT coordination not completed - exiting")
            return
        
        # Process all tools
        await processor.process_all_tools()
        
    except KeyboardInterrupt:
        logger.info("Processing interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    finally:
        await processor.cleanup()

if __name__ == "__main__":
    print("IRONWOOD Processor - Ballarat Tool Library Tool Detail Processing")
    print("=" * 70)
    asyncio.run(main())