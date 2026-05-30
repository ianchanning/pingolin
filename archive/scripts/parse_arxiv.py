import re
import json
import sys

def parse_arxiv_md(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Regex to match categories
    # *   **cs.AI - Artificial Intelligence**
    cat_regex = re.compile(r'\*\s+\*\*(cs\.[A-Z]{2})\s+-\s+([^*]+)\*\*')
    
    categories = []
    
    matches = list(cat_regex.finditer(content))
    for i, match in enumerate(matches):
        code = match.group(1)
        name = match.group(2).strip()
        
        # Start of description is after the match
        start = match.end()
        # End of description is before the next match or end of file
        end = matches[i+1].start() if i+1 < len(matches) else len(content)
        
        raw_desc = content[start:end].strip()
        # Clean up description: remove the ([new](...), ...) part and join lines
        lines = raw_desc.splitlines()
        # First line usually contains the links, skip it if it starts with (
        if lines and lines[0].strip().startswith('('):
            lines = lines[1:]
        
        description = " ".join(l.strip() for l in lines if l.strip())
        
        categories.append({
            'code': code,
            'name': name,
            'description': description
        })
            
    return categories

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_arxiv.py <file_path>")
        sys.exit(1)
        
    cats = parse_arxiv_md(sys.argv[1])
    print(json.dumps(cats, indent=2))
