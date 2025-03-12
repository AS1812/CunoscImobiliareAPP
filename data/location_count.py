#!/usr/bin/env python3
from pymongo import MongoClient

def main():
    # Connect to MongoDB (adjust connection string if needed)
    client = MongoClient('mongodb://localhost:27017/')
    db = client['rentals']
    collection = db['timisoara']
    
    # Aggregation pipeline: group by location and count listings for each
    pipeline = [
        {
            "$group": {
                "_id": "$location",  # Group by the location field
                "count": {"$sum": 1}  # Sum up the count for each location
            }
        },
        {
            "$sort": {"count": -1}  # Sort descending by count (optional)
        }
    ]
    
    results = list(collection.aggregate(pipeline))
    
    # Display the total number of unique locations
    total_unique_locations = len(results)
    print(f"Total unique locations: {total_unique_locations}\n")
    
    # Print out the count per location
    print("Listings count per location:")
    for result in results:
        location = result["_id"] if result["_id"] != "" else "Unknown"
        print(f"{location}: {result['count']}")
    
    # Close the MongoDB connection
    client.close()

if __name__ == '__main__':
    main()
