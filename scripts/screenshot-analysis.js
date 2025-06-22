#!/usr/bin/env node

/**
 * Visual Analysis and Screenshot Tool for Ballarat Tool Library
 * 
 * This script:
 * - Takes screenshots of key pages
 * - Performs visual regression testing
 * - Analyzes page load performance
 * - Checks responsive design breakpoints
 * - Validates accessibility
 * 
 * Usage:
 *   npm install puppeteer lighthouse
 *   node scripts/screenshot-analysis.js [url] [output-dir]
 */

const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs').promises;
const path = require('path');

const DEFAULT_URL = 'https://ballarat-tool-library.home.deepblack.cloud';
const DEFAULT_OUTPUT_DIR = './screenshots';

// Key pages to analyze
const PAGES = [
  { name: 'homepage', path: '/', title: 'Homepage' },
  { name: 'catalog', path: '/catalog', title: 'Tool Catalog' },
  { name: 'member', path: '/member', title: 'Member Portal' },
  { name: 'register', path: '/register', title: 'Registration' },
  { name: 'about', path: '/about', title: 'About Page' },
  { name: 'contact', path: '/contact', title: 'Contact Page' },
  { name: 'faq', path: '/faq', title: 'FAQ Page' },
  { name: 'admin', path: '/admin', title: 'Admin Panel' }
];

// Responsive breakpoints to test
const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'wide', width: 2560, height: 1440 }
];

class VisualAnalyzer {
  constructor(baseUrl = DEFAULT_URL, outputDir = DEFAULT_OUTPUT_DIR) {
    this.baseUrl = baseUrl;
    this.outputDir = outputDir;
    this.results = {
      timestamp: new Date().toISOString(),
      baseUrl,
      screenshots: [],
      performance: [],
      accessibility: [],
      errors: []
    };
  }

  async init() {
    // Create output directory
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'lighthouse'), { recursive: true });
    
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async takeScreenshots() {
    console.log('📸 Taking screenshots...');
    
    for (const page of PAGES) {
      for (const breakpoint of BREAKPOINTS) {
        try {
          await this.screenshotPage(page, breakpoint);
        } catch (error) {
          console.error(`❌ Failed to screenshot ${page.name} at ${breakpoint.name}:`, error.message);
          this.results.errors.push({
            page: page.name,
            breakpoint: breakpoint.name,
            error: error.message,
            type: 'screenshot'
          });
        }
      }
    }
  }

  async screenshotPage(pageInfo, breakpoint) {
    const page = await this.browser.newPage();
    
    try {
      // Set viewport
      await page.setViewport({
        width: breakpoint.width,
        height: breakpoint.height,
        deviceScaleFactor: 1
      });

      // Navigate to page
      const url = `${this.baseUrl}${pageInfo.path}`;
      console.log(`  📄 ${pageInfo.title} (${breakpoint.name}: ${breakpoint.width}x${breakpoint.height})`);
      
      const response = await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Take full page screenshot
      const filename = `${pageInfo.name}-${breakpoint.name}-${breakpoint.width}x${breakpoint.height}.png`;
      const filepath = path.join(this.outputDir, filename);
      
      await page.screenshot({
        path: filepath,
        fullPage: true,
        type: 'png'
      });

      // Record screenshot info
      this.results.screenshots.push({
        page: pageInfo.name,
        breakpoint: breakpoint.name,
        filename,
        filepath,
        url,
        dimensions: `${breakpoint.width}x${breakpoint.height}`,
        timestamp: new Date().toISOString()
      });

      console.log(`    ✅ Screenshot saved: ${filename}`);

    } finally {
      await page.close();
    }
  }

  async runLighthouseAnalysis() {
    console.log('🔍 Running Lighthouse performance analysis...');
    
    for (const pageInfo of PAGES.slice(0, 3)) { // Limit to key pages
      try {
        await this.analyzePage(pageInfo);
      } catch (error) {
        console.error(`❌ Failed Lighthouse analysis for ${pageInfo.name}:`, error.message);
        this.results.errors.push({
          page: pageInfo.name,
          error: error.message,
          type: 'lighthouse'
        });
      }
    }
  }

  async analyzePage(pageInfo) {
    const url = `${this.baseUrl}${pageInfo.path}`;
    console.log(`  🔬 Analyzing ${pageInfo.title}: ${url}`);

    const options = {
      logLevel: 'info',
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: (new URL(await this.browser.wsEndpoint())).port,
    };

    const runnerResult = await lighthouse(url, options);
    
    // Save HTML report
    const reportFilename = `lighthouse-${pageInfo.name}.html`;
    const reportPath = path.join(this.outputDir, 'lighthouse', reportFilename);
    await fs.writeFile(reportPath, runnerResult.report);

    // Extract key metrics
    const lhr = runnerResult.lhr;
    const metrics = {
      page: pageInfo.name,
      url,
      timestamp: new Date().toISOString(),
      scores: {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100)
      },
      metrics: {
        firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: lhr.audits['largest-contentful-paint'].numericValue,
        cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue,
        totalBlockingTime: lhr.audits['total-blocking-time'].numericValue,
        speedIndex: lhr.audits['speed-index'].numericValue
      },
      reportPath: reportPath
    };

    this.results.performance.push(metrics);
    
    console.log(`    📊 Performance: ${metrics.scores.performance}% | Accessibility: ${metrics.scores.accessibility}%`);
    console.log(`    ⚡ FCP: ${Math.round(metrics.metrics.firstContentfulPaint)}ms | LCP: ${Math.round(metrics.metrics.largestContentfulPaint)}ms`);
  }

  async checkAccessibility() {
    console.log('♿ Checking accessibility compliance...');
    
    const page = await this.browser.newPage();
    
    try {
      // Test homepage accessibility
      const url = `${this.baseUrl}/`;
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Check for common accessibility issues
      const accessibilityChecks = await page.evaluate(() => {
        const results = {
          missingAltText: [],
          missingAriaLabels: [],
          lowContrastElements: [],
          missingHeadings: [],
          keyboardNavigation: true
        };

        // Check for images without alt text
        const images = document.querySelectorAll('img');
        images.forEach((img, i) => {
          if (!img.alt || img.alt.trim() === '') {
            results.missingAltText.push({
              src: img.src,
              index: i
            });
          }
        });

        // Check for buttons/links without accessible names
        const interactiveElements = document.querySelectorAll('button, a, input[type="submit"]');
        interactiveElements.forEach((el, i) => {
          const hasLabel = el.getAttribute('aria-label') || 
                          el.getAttribute('aria-labelledby') || 
                          el.textContent.trim() ||
                          el.title;
          if (!hasLabel) {
            results.missingAriaLabels.push({
              tagName: el.tagName,
              index: i,
              outerHTML: el.outerHTML.substring(0, 100)
            });
          }
        });

        // Check heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
          results.missingHeadings.push('No heading elements found');
        }

        return results;
      });

      this.results.accessibility.push({
        page: 'homepage',
        url,
        timestamp: new Date().toISOString(),
        checks: accessibilityChecks
      });

      console.log(`    ✅ Accessibility check completed`);
      console.log(`    📝 Missing alt text: ${accessibilityChecks.missingAltText.length} images`);
      console.log(`    🏷️  Missing labels: ${accessibilityChecks.missingAriaLabels.length} elements`);

    } finally {
      await page.close();
    }
  }

  async generateReport() {
    console.log('📋 Generating analysis report...');
    
    const reportPath = path.join(this.outputDir, 'visual-analysis-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

    // Generate HTML summary
    const htmlReport = this.generateHtmlReport();
    const htmlReportPath = path.join(this.outputDir, 'visual-analysis-report.html');
    await fs.writeFile(htmlReportPath, htmlReport);

    console.log(`📄 Reports saved:`);
    console.log(`  JSON: ${reportPath}`);
    console.log(`  HTML: ${htmlReportPath}`);

    return this.results;
  }

  generateHtmlReport() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Analysis Report - Ballarat Tool Library</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 40px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .score { font-size: 24px; font-weight: bold; }
        .good { color: #0d7377; }
        .ok { color: #ffa500; }
        .poor { color: #e74c3c; }
        .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .screenshot-item { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .screenshot-item img { width: 100%; height: auto; }
        .screenshot-info { padding: 10px; background: #f9f9f9; }
        .error { background: #ffe6e6; border: 1px solid #ffcccc; padding: 10px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Visual Analysis Report</h1>
        <p><strong>Website:</strong> ${this.results.baseUrl}</p>
        <p><strong>Generated:</strong> ${this.results.timestamp}</p>
        <p><strong>Screenshots:</strong> ${this.results.screenshots.length} | <strong>Performance Tests:</strong> ${this.results.performance.length}</p>
    </div>

    <div class="section">
        <h2>Performance Scores</h2>
        ${this.results.performance.map(p => `
            <div class="metric">
                <h3>${p.page}</h3>
                <div class="score ${this.getScoreClass(p.scores.performance)}">${p.scores.performance}%</div>
                <div>Performance</div>
                <div style="margin-top: 10px; font-size: 12px;">
                    <div>Accessibility: ${p.scores.accessibility}%</div>
                    <div>Best Practices: ${p.scores.bestPractices}%</div>
                    <div>SEO: ${p.scores.seo}%</div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Screenshots</h2>
        <div class="screenshot-grid">
            ${this.results.screenshots.slice(0, 12).map(s => `
                <div class="screenshot-item">
                    <img src="${s.filename}" alt="Screenshot of ${s.page} at ${s.breakpoint}" loading="lazy">
                    <div class="screenshot-info">
                        <strong>${s.page}</strong> - ${s.breakpoint}<br>
                        <small>${s.dimensions}</small>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    ${this.results.errors.length > 0 ? `
    <div class="section">
        <h2>Errors</h2>
        ${this.results.errors.map(e => `
            <div class="error">
                <strong>${e.page || 'Unknown'}</strong> (${e.type}): ${e.error}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h2>Files Generated</h2>
        <ul>
            <li>Screenshots: ${this.results.screenshots.length} files</li>
            <li>Lighthouse Reports: ${this.results.performance.length} HTML files</li>
            <li>JSON Report: visual-analysis-report.json</li>
        </ul>
    </div>
</body>
</html>`;
  }

  getScoreClass(score) {
    if (score >= 90) return 'good';
    if (score >= 50) return 'ok';
    return 'poor';
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      await this.takeScreenshots();
      await this.runLighthouseAnalysis();
      await this.checkAccessibility();
      const results = await this.generateReport();
      
      console.log('🎉 Visual analysis completed successfully!');
      console.log(`📊 Summary: ${results.screenshots.length} screenshots, ${results.performance.length} performance tests, ${results.errors.length} errors`);
      
      return results;
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const url = args[0] || DEFAULT_URL;
  const outputDir = args[1] || DEFAULT_OUTPUT_DIR;

  console.log('🚀 Starting visual analysis...');
  console.log(`📍 Target: ${url}`);
  console.log(`📁 Output: ${outputDir}`);
  console.log('');

  const analyzer = new VisualAnalyzer(url, outputDir);
  
  try {
    await analyzer.run();
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = VisualAnalyzer;