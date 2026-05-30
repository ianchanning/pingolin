import json
import subprocess
import sys
import os

def rename_tags(mapping_file, dry_run=True):
    with open(mapping_file, 'r') as f:
        mappings = json.load(f)

    for m in mappings:
        old = m['old_tag']
        new = m['new_tag']
        count = m['count']
        
        if old == new:
            continue
            
        print(f"{'[DRY RUN] ' if dry_run else ''}Renaming '{old}' ({count}) to '{new}'")
        
        if not dry_run:
            cmd = ["pinboard", "rename-tag", "--old", old, "--new", new]
            try:
                subprocess.run(cmd, check=True)
            except subprocess.CalledProcessError as e:
                print(f"Error renaming '{old}': {e}")

if __name__ == "__main__":
    dry_run = "--execute" not in sys.argv
    if len(sys.argv) < 2:
        print("Usage: python rename_tags.py mappings.json [--execute]")
        sys.exit(1)
        
    rename_tags(sys.argv[1], dry_run=dry_run)
