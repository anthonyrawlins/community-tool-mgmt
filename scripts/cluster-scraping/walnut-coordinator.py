#!/usr/bin/env python3
"""
WALNUT (192.168.1.27) - Main Scraping Coordinator
Ballarat Tool Library Data Migration - MyTurn Catalog Scraping

Coordinates the distributed scraping of 1,209 tools from MyTurn catalog.
Uses qwen2.5-coder for content parsing and data normalization.
"""

import asyncio
import aiohttp
import json
import time
import sqlite3
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse
import logging
from typing import Dict, List, Optional, Tuple

# Configuration
BASE_URL = "https://ballarattoollibrary.myturn.com"
CATALOG_URL = f"{BASE_URL}/library/inventory/browse"
ITEMS_PER_PAGE = 15
MAX_CONCURRENT_REQUESTS = 5
REQUEST_DELAY = 1.0  # Rate limiting - 1 second between requests
OUTPUT_DIR = Path("/rust/containers/ballarat-scraping")
DATABASE_PATH = OUTPUT_DIR / "scraping_progress.db"

# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WalnutCoordinator:
    """Main coordinator for scraping operations on WALNUT"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.discovered_tools = []
        self.failed_requests = []
        self.progress_db = None
        
        # Ensure output directory exists
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database for tracking progress"""
        self.progress_db = sqlite3.connect(DATABASE_PATH)
        cursor = self.progress_db.cursor()
        
        # Create tables for tracking progress
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scraping_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_number INTEGER UNIQUE,
                items_found INTEGER,
                status TEXT,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                error_message TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS discovered_tools (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tool_id TEXT UNIQUE,
                tool_name TEXT,
                tool_url TEXT,
                category TEXT,
                discovered_at TIMESTAMP,
                processed_by_ironwood BOOLEAN DEFAULT FALSE,
                qa_by_rosewood BOOLEAN DEFAULT FALSE
            )
        ''')
        
        self.progress_db.commit()
        logger.info("Database initialized successfully")
    
    async def create_session(self):
        """Create aiohttp session with proper headers"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(headers=headers, timeout=timeout)
        logger.info("HTTP session created")
    
    async def fetch_catalog_page(self, page: int) -> Tuple[bool, List[Dict], str]:
        """
        Fetch a single catalog page and extract tool information
        
        Returns:
            Tuple of (success, tools_list, error_message)
        """
        if not self.session:
            await self.create_session()
        
        # Record start of page processing
        cursor = self.progress_db.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO scraping_progress 
            (page_number, status, started_at) 
            VALUES (?, 'in_progress', ?)
        ''', (page, datetime.now()))
        self.progress_db.commit()
        
        try:
            # Calculate page offset (pages are 0-indexed in URL)
            offset = (page - 1) * ITEMS_PER_PAGE
            url = f"{CATALOG_URL}?offset={offset}"
            
            logger.info(f"Fetching catalog page {page} (offset {offset})")
            
            async with self.session.get(url) as response:
                if response.status != 200:
                    error_msg = f"HTTP {response.status} for page {page}"
                    logger.error(error_msg)
                    
                    # Record failure
                    cursor.execute('''
                        UPDATE scraping_progress 
                        SET status='failed', error_message=?, completed_at=?
                        WHERE page_number=?
                    ''', (error_msg, datetime.now(), page))
                    self.progress_db.commit()
                    
                    return False, [], error_msg
                
                html_content = await response.text()
                
                # Parse tools from this page
                tools = await self.parse_tools_from_page(html_content, page)
                
                # Record success
                cursor.execute('''
                    UPDATE scraping_progress 
                    SET status='completed', items_found=?, completed_at=?
                    WHERE page_number=?
                ''', (len(tools), datetime.now(), page))
                self.progress_db.commit()
                
                logger.info(f"Page {page}: Found {len(tools)} tools")
                return True, tools, ""
        
        except Exception as e:
            error_msg = f"Exception on page {page}: {str(e)}"
            logger.error(error_msg)
            
            # Record failure
            cursor.execute('''
                UPDATE scraping_progress 
                SET status='failed', error_message=?, completed_at=?
                WHERE page_number=?
            ''', (error_msg, datetime.now(), page))
            self.progress_db.commit()
            
            return False, [], error_msg
    
    async def parse_tools_from_page(self, html_content: str, page: int) -> List[Dict]:
        """
        Parse tool information from HTML content using basic string parsing
        
        TODO: Integrate with qwen2.5-coder for advanced content extraction
        """
        tools = []
        
        # Basic HTML parsing - look for tool links and information
        # MyTurn typically uses patterns like /library/inventory/show/{id}
        
        import re
        
        # Find all tool detail page links
        tool_links = re.findall(r'/library/inventory/show/(\d+)', html_content)
        
        # Extract tool names from the HTML (simplified approach)
        # This would be enhanced with qwen2.5-coder for better extraction
        tool_name_pattern = r'<a[^>]*href="[^"]*inventory/show/\d+"[^>]*>([^<]+)</a>'
        tool_names = re.findall(tool_name_pattern, html_content)
        
        # Combine IDs and names
        for i, tool_id in enumerate(tool_links):
            tool_name = tool_names[i] if i < len(tool_names) else f"Tool {tool_id}"
            tool_url = f"{BASE_URL}/library/inventory/show/{tool_id}"
            
            tool_data = {
                'id': tool_id,
                'name': tool_name.strip(),
                'url': tool_url,
                'page_discovered': page,
                'discovered_at': datetime.now().isoformat()
            }
            
            tools.append(tool_data)
            
            # Store in database
            cursor = self.progress_db.cursor()
            cursor.execute('''
                INSERT OR IGNORE INTO discovered_tools 
                (tool_id, tool_name, tool_url, discovered_at) 
                VALUES (?, ?, ?, ?)
            ''', (tool_id, tool_name.strip(), tool_url, datetime.now()))
            self.progress_db.commit()
        
        return tools
    
    async def estimate_total_pages(self) -> int:
        """
        Estimate total number of pages by checking the catalog
        Based on the known 1,209 tools and 15 items per page
        """
        # From DATA_MIGRATION_PLAN.md: 1,209 tools total
        estimated_pages = (1209 + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE  # Ceiling division
        logger.info(f"Estimated {estimated_pages} pages for 1,209 tools")
        return estimated_pages
    
    async def coordinate_full_scraping(self):
        """
        Main coordination function for complete catalog scraping
        """
        logger.info("Starting WALNUT coordination of MyTurn catalog scraping")
        
        start_time = time.time()
        total_pages = await self.estimate_total_pages()
        
        # Create semaphore for concurrent request limiting
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
        
        async def scrape_page_with_limit(page_num):
            async with semaphore:
                await asyncio.sleep(REQUEST_DELAY)  # Rate limiting
                return await self.fetch_catalog_page(page_num)
        
        # Process all pages concurrently (with limits)
        tasks = [scrape_page_with_limit(page) for page in range(1, total_pages + 1)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect results
        successful_pages = 0
        total_tools_found = 0
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Page {i+1} failed with exception: {result}")
                self.failed_requests.append(i+1)
            else:
                success, tools, error = result
                if success:
                    successful_pages += 1
                    total_tools_found += len(tools)
                    self.discovered_tools.extend(tools)
                else:
                    self.failed_requests.append(i+1)
        
        # Generate summary report
        elapsed_time = time.time() - start_time
        await self.generate_coordination_report(
            total_pages, successful_pages, total_tools_found, elapsed_time
        )
        
        # Signal IRONWOOD to begin processing
        await self.signal_ironwood_processing()
    
    async def generate_coordination_report(self, total_pages: int, successful_pages: int, 
                                         total_tools: int, elapsed_time: float):
        """Generate comprehensive report for cluster coordination"""
        
        report = {
            "walnut_coordination_report": {
                "timestamp": datetime.now().isoformat(),
                "scraping_summary": {
                    "total_pages_attempted": total_pages,
                    "successful_pages": successful_pages,
                    "failed_pages": len(self.failed_requests),
                    "total_tools_discovered": total_tools,
                    "elapsed_time_seconds": elapsed_time
                },
                "failed_pages": self.failed_requests,
                "next_steps": {
                    "ironwood_processing": "Ready for data processing and image downloads",
                    "rosewood_qa": "Pending IRONWOOD completion"
                },
                "database_location": str(DATABASE_PATH),
                "discovered_tools_sample": self.discovered_tools[:5]  # First 5 tools
            }
        }
        
        # Save report
        report_path = OUTPUT_DIR / f"walnut_coordination_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Coordination report saved to {report_path}")
        logger.info(f"WALNUT SUMMARY: {successful_pages}/{total_pages} pages, {total_tools} tools discovered")
    
    async def signal_ironwood_processing(self):
        """Create signal file for IRONWOOD to begin processing"""
        signal_file = OUTPUT_DIR / "walnut_completed.signal"
        
        signal_data = {
            "coordinator": "WALNUT",
            "completion_time": datetime.now().isoformat(),
            "tools_discovered": len(self.discovered_tools),
            "database_path": str(DATABASE_PATH),
            "next_processor": "IRONWOOD",
            "status": "ready_for_processing"
        }
        
        with open(signal_file, 'w') as f:
            json.dump(signal_data, f, indent=2)
        
        logger.info(f"Signal file created for IRONWOOD: {signal_file}")
    
    async def cleanup(self):
        """Clean up resources"""
        if self.session:
            await self.session.close()
        
        if self.progress_db:
            self.progress_db.close()
        
        logger.info("WALNUT coordinator cleanup completed")

async def main():
    """Main execution function"""
    coordinator = WalnutCoordinator()
    
    try:
        await coordinator.coordinate_full_scraping()
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    finally:
        await coordinator.cleanup()

if __name__ == "__main__":
    print("WALNUT Coordinator - Ballarat Tool Library MyTurn Scraping")
    print("=" * 60)
    asyncio.run(main())