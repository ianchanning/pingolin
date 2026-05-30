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
        time.sleep(1) 
        with urllib.request.urlopen(url) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"API Error on {endpoint}: {e}")
        return None

def get_all_bookmarks(tag):
    # 'posts/all' can be heavy, but for 20k links we might need it.
    # However, 'posts/get' with a tag returns all for that tag.
    return api_call("posts/get", {"tag": tag})

def update_bookmark(bookmark, old_tag, new_tag):
    tags = bookmark['tags'].split()
    if new_tag not in tags:
        tags.append(new_tag)
    
    # We don't remove old_tag here yet, we'll delete the tag globally later
    # to be safer and more efficient.
    
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

def rename_tag_manual(old_tag, new_tag, dry_run=True):
    print(f"Processing '{old_tag}' -> '{new_tag}'...")
    
    data = get_all_bookmarks(old_tag)
    if not data or 'posts' not in data:
        print(f"No bookmarks found for tag '{old_tag}'")
        return

    bookmarks = data['posts']
    print(f"Found {len(bookmarks)} bookmarks.")

    if dry_run:
        print(f"[DRY RUN] Would add '{new_tag}' to {len(bookmarks)} bookmarks and then delete '{old_tag}'")
        return

    for i, b in enumerate(bookmarks):
        print(f"  [{i+1}/{len(bookmarks)}] Updating: {b['href'][:60]}...")
        update_bookmark(b, old_tag, new_tag)
        # Slow down to avoid rate limits
        time.sleep(2)

    print(f"Deleting old tag '{old_tag}' globally...")
    delete_tag_globally(old_tag)
    print(f"Finished '{old_tag}'")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python manual_rename.py <old_tag> <new_tag> [--execute]")
        sys.exit(1)
    
    old = sys.argv[1]
    new = sys.argv[2]
    dry_run = "--execute" not in sys.argv
    
    rename_tag_manual(old, new, dry_run)
