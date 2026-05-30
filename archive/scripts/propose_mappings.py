import json
import re
import sys

# Stop words to avoid matching common terms in descriptions
STOP_WORDS = {
    'and', 'the', 'for', 'with', 'all', 'areas', 'except', 'which', 'have', 
    'separate', 'subject', 'particular', 'includes', 'although', 'this', 
    'may', 'overlap', 'some', 'material', 'more', 'appropriate', 'here',
    'but', 'likely', 'primary', 'area', 'covers', 'includes', 'roughly',
    'classes', 'acm', 'based', 'also', 'such', 'topics', 'interest', 'their',
    'other', 'another', 'many', 'various', 'using', 'from', 'into', 'both',
    'these', 'those', 'through', 'between'
}

def normalize(text):
    # Remove non-alphanumeric and lowercase
    return re.sub(r'[^a-z0-9]', '', text.lower())

def get_tokens(text):
    # Split by non-alphanumeric, lowercase, filter short and stop words
    tokens = re.split(r'[^a-z0-9]', text.lower())
    return {t for t in tokens if len(t) > 2 and t not in STOP_WORDS}

def propose_mappings(arxiv_json, tags_json):
    with open(arxiv_json, 'r') as f:
        arxiv_cats = json.load(f)
    with open(tags_json, 'r') as f:
        pinboard_tags = json.load(f)

    # Manual aliases
    ALIASES = {
        'ai': 'cs.AI',
        'algorithms': 'cs.DS',
        'complexity': 'cs.CC',
        'computer-vision': 'cs.CV',
        'crypto': 'cs.CR',
        'cryptography': 'cs.CR',
        'data-science': 'cs.LG', # Often ML focused
        'data-structures': 'cs.DS',
        'database': 'cs.DB',
        'databases': 'cs.DB',
        'deep-learning': 'cs.LG',
        'dist-sys': 'cs.DC',
        'distributed-systems': 'cs.DC',
        'economics': 'cs.GT', # Intersects with GT
        'game-theory': 'cs.GT',
        'graphics': 'cs.GR',
        'hci': 'cs.HC',
        'internet': 'cs.NI',
        'llm': 'cs.CL',
        'llms': 'cs.CL',
        'machine-learning': 'cs.LG',
        'machine_learning': 'cs.LG',
        'ml': 'cs.LG',
        'natural-language-processing': 'cs.CL',
        'networking': 'cs.NI',
        'neural-networks': 'cs.NE',
        'nlp': 'cs.CL',
        'operating-systems': 'cs.OS',
        'os': 'cs.OS',
        'programming': 'cs.PL',
        'robotics': 'cs.RO',
        'se': 'cs.SE',
        'security': 'cs.CR',
        'software-engineering': 'cs.SE',
        'statistics': 'cs.LG',
        'stats': 'cs.LG', # In Arxiv CS, stats often maps to LG/ML
    }

    # Tags that should NEVER be mapped automatically
    BLACKLIST = {'human', 'cv', 'personal', 'work', 'notes', 'mathematics', 'statistics', 'economics'}

    # Prepare Arxiv metadata for matching
    arxiv_data = []
    for cat in arxiv_cats:
        name_tokens = get_tokens(cat['name'])
        # Add the full name (normalized) as a significant token
        sig_tokens = {normalize(cat['name'])} | name_tokens
        
        # Remove very common words from significant tokens if they are not the full name
        COMMON_CS_WORDS = {'computer', 'science', 'data', 'learning', 'programming', 'software', 'engineering', 'systems', 'information', 'theory'}
        sig_tokens = {t for t in sig_tokens if t not in COMMON_CS_WORDS or t == normalize(cat['name'])}

        arxiv_data.append({
            'code': cat['code'],
            'name': cat['name'],
            'name_norm': normalize(cat['name']),
            'sig_tokens': sig_tokens
        })

    results = []

    for tag, count in pinboard_tags.items():
        tag_lower = tag.lower()
        tag_norm = normalize(tag)
        
        if tag_lower in BLACKLIST:
            continue
            
        target_code = None
        reason = ""

        # 1. Alias match (Highest priority)
        if tag_lower in ALIASES:
            target_code = ALIASES[tag_lower]
            reason = "manual alias"
        
        # 2. Direct name match
        if not target_code:
            for cat in arxiv_data:
                if tag_norm == cat['name_norm']:
                    target_code = cat['code']
                    reason = "direct name match"
                    break
        
        # 3. Significant token match (only if tag is a significant word in the category name)
        if not target_code:
            for cat in arxiv_data:
                if tag_norm in cat['sig_tokens']:
                    target_code = cat['code']
                    reason = "significant token match"
                    break

        if target_code:
            results.append({
                'old_tag': tag,
                'count': count,
                'new_tag': target_code,
                'reason': reason
            })

    return results

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python propose_mappings.py arxiv.json tags.json")
        sys.exit(1)
        
    mappings = propose_mappings(sys.argv[1], sys.argv[2])
    # Sort by count descending
    mappings.sort(key=lambda x: x['count'], reverse=True)
    print(json.dumps(mappings, indent=2))
