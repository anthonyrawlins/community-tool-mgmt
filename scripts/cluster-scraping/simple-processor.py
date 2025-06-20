#!/usr/bin/env python3
"""
Simplified Tool Processor - Run on WALNUT
Processes tool details from discovered tools
"""

import asyncio
import aiohttp
import json
import sqlite3
import time
from datetime import datetime
from pathlib import Path
import logging
import re
from html import unescape

# Configuration
BASE_URL = "https://ballarattoollibrary.myturn.com"
SHARED_DIR = Path("/rust/containers/ballarat-scraping")
DATABASE_PATH = SHARED_DIR / "scraping_progress.db"
PROCESSED_DATA_DIR = SHARED_DIR / "processed_data"
REQUEST_DELAY = 2.0
MAX_TOOLS_TO_PROCESS = 50  # Process first 50 tools as example

# Ensure directories exist
PROCESSED_DATA_DIR.mkdir(exist_ok=True)

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def fetch_tool_details(session, tool_id, tool_url):
    """Fetch and parse individual tool details"""
    try:
        await asyncio.sleep(REQUEST_DELAY)
        
        async with session.get(tool_url) as response:
            if response.status != 200:
                return None, f"HTTP {response.status}"
            
            html = await response.text()
            
            # Extract tool information
            tool_data = {
                'id': tool_id,
                'url': tool_url,
                'scraped_at': datetime.now().isoformat()
            }
            
            # Extract name
            name_match = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
            if name_match:
                tool_data['name'] = unescape(name_match.group(1).strip())
            
            # Extract description
            desc_match = re.search(r'<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)</div>', html, re.IGNORECASE | re.DOTALL)
            if desc_match:
                tool_data['description'] = unescape(desc_match.group(1).strip())
            
            # Extract brand
            brand_match = re.search(r'<strong>Brand:</strong>\s*([^<\n]+)', html, re.IGNORECASE)
            if brand_match:
                tool_data['brand'] = unescape(brand_match.group(1).strip())
            
            # Extract images
            image_urls = re.findall(r'<img[^>]*src="([^"]*amazonaws\.com[^"]*)"', html, re.IGNORECASE)
            tool_data['image_urls'] = list(set(image_urls))
            
            return tool_data, None
            
    except Exception as e:
        return None, str(e)

async def main():
    """Main processing function"""
    logger.info("Starting simplified tool processing")
    
    # Connect to database
    db = sqlite3.connect(DATABASE_PATH)
    cursor = db.cursor()
    
    # Get tools to process
    cursor.execute(f'''
        SELECT tool_id, tool_name, tool_url 
        FROM discovered_tools 
        LIMIT {MAX_TOOLS_TO_PROCESS}
    ''')
    tools = cursor.fetchall()
    
    logger.info(f"Processing {len(tools)} tools")
    
    # Create session
    async with aiohttp.ClientSession() as session:
        processed_count = 0
        
        for tool_id, tool_name, tool_url in tools:
            logger.info(f"Processing {tool_id}: {tool_name}")
            
            tool_data, error = await fetch_tool_details(session, tool_id, tool_url)
            
            if tool_data:
                # Save processed data
                output_file = PROCESSED_DATA_DIR / f"tool_{tool_id}.json"
                with open(output_file, 'w') as f:
                    json.dump(tool_data, f, indent=2)
                
                processed_count += 1
                logger.info(f"✓ Processed {tool_id}")
            else:
                logger.error(f"✗ Failed {tool_id}: {error}")
    
    db.close()
    
    # Create completion signal
    signal_data = {
        "processor": "SIMPLIFIED_PROCESSOR",
        "completion_time": datetime.now().isoformat(),
        "tools_processed": processed_count,
        "status": "sample_processing_complete"
    }
    
    with open(SHARED_DIR / "processing_completed.signal", 'w') as f:
        json.dump(signal_data, f, indent=2)
    
    logger.info(f"Processing complete! {processed_count} tools processed")

if __name__ == "__main__":
    asyncio.run(main())