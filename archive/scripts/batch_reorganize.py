import json
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import os

# Get token from .pinboardrc
def get_token():
    try:
        with open(os.path.expanduser("~/.pinboardrc"), 'r') as f:
            for line in f:
                if line.startswith('api_token'):
                    return line.split('=')[1].strip()
    except Exception as e:
        print(f"Error reading token: {e}")
        sys.exit(1)
    return None

TOKEN = get_token()

def api_call(endpoint, params):
    params['auth_token'] = TOKEN
    params['format'] = 'json'
    url = f"https://api.pinboard.in/v1/{endpoint}?{urllib.parse.urlencode(params)}"
    try:
        # Respect Pinboard's 1-request-per-3-seconds rule for aggressive operations
        # We use a bit more safety margin here
        time.sleep(2) 
        with urllib.request.urlopen(url) as response:
            content = response.read().decode()
            if not content: return {}
            return json.loads(content)
    except Exception as e:
        print(f"API Error on {endpoint}: {e}")
        return None

def get_all_bookmarks(tag):
    return api_call("posts/get", {"tag": tag})

def update_bookmark(bookmark, new_tag):
    tags = bookmark['tags'].split()
    if new_tag not in tags:
        tags.append(new_tag)
    
    new_tags_str = " ".join(tags)
    
    params = {
        'url': bookmark['href'],
        'description': bookmark['description'],
        'extended': bookmark['extended'],
        'tags': new_tags_str,
        'dt': bookmark['time'],
        'replace': 'yes'
    }
    return api_call("posts/add", params)

def delete_tag_globally(tag):
    return api_call("tags/delete", {"tag": tag})

def batch_rename(mapping_file, dry_run=True):
    with open(mapping_file, 'r') as f:
        mappings = json.load(f)

    print(f"Starting batch reorganization ({len(mappings)} tags to process)...")
    
    for m in mappings:
        old = m['old_tag']
        new = m['new_tag']
        count = m['count']
        
        print(f"\n>>> Processing '{old}' -> '{new}' ({count} bookmarks expected)")
        
        data = get_all_bookmarks(old)
        if not data or 'posts' not in data:
            print(f"    No bookmarks found for tag '{old}'")
            continue

        bookmarks = data['posts']
        print(f"    Found {len(bookmarks)} actual bookmarks.")

        if dry_run:
            print(f"    [DRY RUN] Would update {len(bookmarks)} bookmarks and delete '{old}'")
            continue

        for i, b in enumerate(bookmarks):
            print(f"      [{i+1}/{len(bookmarks)}] Updating: {b['href'][:60]}...")
            update_bookmark(b, new)
        
        print(f"    Deleting old tag '{old}' globally...")
        delete_tag_globally(old)
        print(f"    Finished '{old}'")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python batch_reorganize.py mappings.json [--execute]")
        sys.exit(1)
        
    dry_run = "--execute" not in sys.argv
    batch_rename(sys.argv[1], dry_run)
