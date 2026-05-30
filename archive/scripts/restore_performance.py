import json
import urllib.parse
import urllib.request
import time
import os
import sys

def get_token():
    with open(os.path.expanduser("~/.pinboardrc"), 'r') as f:
        for line in f:
            if line.startswith('api_token'):
                return line.split('=')[1].strip()
    return None

TOKEN = get_token()
HEADERS = {'User-Agent': 'Gemini-CLI-Surgical-Refactor/1.0'}

def restore_performance():
    with open('performance_recovery.json') as f:
        bookmarks = json.load(f)
    
    print(f"Restoring {len(bookmarks)} bookmarks to 'cs.PF'...")
    
    for i, b in enumerate(bookmarks):
        # We add 'cs.PF' to the existing tags (excluding 'performance' which is gone from the API but in our backup)
        tags = set(b['tags'].split())
        if 'performance' in tags: tags.remove('performance')
        tags.add('cs.PF')
        
        params = urllib.parse.urlencode({
            'url': b['href'],
            'description': b['description'],
            'extended': b['extended'],
            'tags': " ".join(tags),
            'dt': b['time'],
            'replace': 'yes',
            'auth_token': TOKEN,
            'format': 'json'
        })
        
        url = f"https://api.pinboard.in/v1/posts/add?{params}"
        req = urllib.request.Request(url, headers=HEADERS)
        
        try:
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode())
                print(f"  [{i+1}/{len(bookmarks)}] Restored: {b['href'][:50]}... -> {res['result_code']}")
        except Exception as e:
            print(f"  Error on {b['href']}: {e}")
        
        # Safe delay
        time.sleep(3)

if __name__ == "__main__":
    restore_performance()
