from playwright.sync_api import sync_playwright, TimeoutError
from pymongo import MongoClient
from tqdm import tqdm
import time
import re
import random
import signal
import sys

# Handle Ctrl+C properly
def signal_handler(sig, frame):
    print("\nScraping interrupted by user. Exiting...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        
        # Set shorter default timeout
        context.set_default_timeout(5000)
        
        page = context.new_page()
        
        base_url = "https://www.storia.ro/ro/rezultate/inchiriere/apartament/timis/timisoara"
        page.goto(base_url, wait_until="domcontentloaded")
        
        # Try to accept cookies if present
        try:
            page.wait_for_selector('button[data-testid="accept-all-cookies"]', timeout=3000)
            page.click('button[data-testid="accept-all-cookies"]')
        except:
            pass
        
        # Extract pagination information
        total_pages = 1
        try:
            pagination_items = page.locator('ul[data-cy="react-ui.search.base-pagination.nexus-pagination"] li').all()
            for item in pagination_items:
                text = item.text_content().strip()
                if text.isdigit() and int(text) > total_pages:
                    total_pages = int(text)
        except:
            print("Could not extract pagination, defaulting to 1 page")
        
        # Get total listings count for progress bar
        total_listings = 36 * total_pages
        try:
            total_text = page.locator('span.css-15svspy').text_content()
            match = re.search(r'din\s+(\d+)', total_text)
            if match:
                total_listings = int(match.group(1))
        except:
            print("Could not extract total listings count, using estimate")
        
        print(f"Found approximately {total_listings} listings across {total_pages} pages")
        
        # Connect to MongoDB
        client = MongoClient('mongodb://localhost:27017/')
        db = client['storia']
        collection = db['rentals']
        
        # Progress bar
        progress_bar = tqdm(total=total_listings, desc="Scraping listings")
        
        listings_processed = 0
        
        # Process each page
        for page_num in range(1, total_pages + 1):
            try:
                page_url = f"{base_url}?page={page_num}&by=DEFAULT&direction=DESC&viewType=listing"
                page.goto(page_url, wait_until="domcontentloaded")
                
                # Wait for listings to appear
                page.wait_for_selector('article[data-cy="listing-item"]', timeout=5000)
                
                # Use JavaScript to extract all listings data at once - much faster and more reliable
                listings_data = page.evaluate("""
                () => {
                    const listings = [];
                    
                    // Get all article elements
                    const articles = document.querySelectorAll('article[data-cy="listing-item"]');
                    
                    for (const article of articles) {
                        try {
                            // Price
                            let price = "N/A";
                            let currency = "€";
                            const priceElement = article.querySelector('span.css-2bt9f1');
                            if (priceElement) {
                                const priceText = priceElement.textContent.trim();
                                const priceMatch = priceText.match(/(\\d+(?:\\s?\\d+)*)/);
                                if (priceMatch) {
                                    price = priceMatch[1].replace(/\\s/g, "");
                                }
                                if (!priceText.includes('€')) {
                                    currency = "RON";
                                }
                            }
                            
                            // Title
                            let title = "N/A";
                            const titleElement = article.querySelector('p[data-cy="listing-item-title"]');
                            if (titleElement) {
                                title = titleElement.textContent.trim();
                            }
                            
                            // URL and ID
                            let url = "N/A";
                            let listingId = "N/A";
                            const linkElement = article.querySelector('a[data-cy="listing-item-link"]');
                            if (linkElement) {
                                const relativeUrl = linkElement.getAttribute('href');
                                url = relativeUrl.startsWith('/') ? 
                                      "https://www.storia.ro" + relativeUrl : relativeUrl;
                                
                                const idMatch = url.match(/([A-Za-z0-9]+)$/);
                                if (idMatch) {
                                    listingId = idMatch[1];
                                }
                            }
                            
                            // Location
                            let location = "N/A";
                            const locationElement = article.querySelector('.css-42r2ms');
                            if (locationElement) {
                                location = locationElement.textContent.trim();
                            }
                            
                            // Room details
                            let rooms = "N/A";
                            let area = "N/A";
                            let floor = "N/A";
                            
                            const dlElement = article.querySelector('dl.css-9q2yy4');
                            if (dlElement) {
                                const dtElements = dlElement.querySelectorAll('dt');
                                const ddElements = dlElement.querySelectorAll('dd');
                                
                                for (let i = 0; i < dtElements.length; i++) {
                                    if (i < ddElements.length) {
                                        const label = dtElements[i].textContent.trim().toLowerCase();
                                        const valueSpan = ddElements[i].querySelector('span');
                                        const value = valueSpan ? valueSpan.textContent.trim() : "";
                                        
                                        if (label.includes('camere')) {
                                            rooms = value;
                                        } else if (label.includes('suprafa')) {
                                            area = value;
                                        } else if (label.includes('etaj')) {
                                            floor = value;
                                        }
                                    }
                                }
                            }
                            
                            // Description - try to open and get it
                            let description = "N/A";
                            const detailsElement = article.querySelector('details');
                            
                            if (detailsElement) {
                                // Open the details
                                detailsElement.setAttribute('open', 'true');
                                
                                // Now try to get the description
                                const descElement = detailsElement.querySelector('.css-1b63dzw');
                                if (descElement) {
                                    description = descElement.textContent.trim();
                                }
                            }
                            
                            listings.push({
                                listingId,
                                title,
                                price,
                                currency,
                                location,
                                rooms,
                                area,
                                floor,
                                description,
                                url
                            });
                        } catch (e) {
                            // Just continue to the next listing if there's an error
                            console.error("Error processing a listing:", e);
                        }
                    }
                    
                    return listings;
                }
                """)
                
                # Process and store listings data
                for listing_data in listings_data:
                    try:
                        # Prepare MongoDB document
                        mongo_doc = {
                            'listing_id': listing_data['listingId'],
                            'title': listing_data['title'],
                            'price': {
                                'amount': listing_data['price'],
                                'currency': listing_data['currency']
                            },
                            'location': listing_data['location'],
                            'details': {
                                'rooms': listing_data['rooms'],
                                'area': listing_data['area'],
                                'floor': listing_data['floor']
                            },
                            'description': listing_data['description'],
                            'url': listing_data['url'],
                            'scraped_at': time.time()
                        }
                        
                        # Insert or update in MongoDB
                        if listing_data['listingId'] != "N/A":
                            collection.update_one(
                                {'listing_id': listing_data['listingId']},
                                {'$set': mongo_doc},
                                upsert=True
                            )
                        
                        # Update progress bar
                        listings_processed += 1
                        progress_bar.update(1)
                        
                    except Exception as e:
                        print(f"Error saving listing: {e}")
                
                # Small delay between pages
                time.sleep(0.5)
                
            except Exception as e:
                print(f"Error processing page {page_num}: {e}")
                continue
        
        progress_bar.close()
        client.close()
        browser.close()
        print(f"Scraping completed! Processed {listings_processed} listings.")

if __name__ == "__main__":
    main()