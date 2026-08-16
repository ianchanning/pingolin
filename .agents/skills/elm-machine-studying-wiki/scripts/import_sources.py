#!/usr/bin/env python3
"""
Elm Machine Studying - Source Ingestion Engine
Parses wiki/raw/sources.md, retrieves documentation, articles, talk transcripts,
and error catalogs, converts them to clean markdown with frontmatter, and stores
them in wiki/raw/ subdirectories.
"""

import argparse
import datetime
import os
import re
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import html2text
    from bs4 import BeautifulSoup
except ImportError:
    print("Dependencies missing. Run with: uv run --with beautifulsoup4,html2text,yt-dlp python3 .agents/skills/elm-machine-studying-wiki/scripts/import_sources.py")
    sys.exit(1)


SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_ROOT = SCRIPT_DIR.parent
WIKI_DIR = SKILL_ROOT / "wiki"
RAW_DIR = WIKI_DIR / "raw"
SOURCES_MD = RAW_DIR / "sources.md"
LOG_MD = WIKI_DIR / "log.md"

DOCS_DIR = RAW_DIR / "docs"
TRANSCRIPTS_DIR = RAW_DIR / "transcripts"
REPOS_DIR = RAW_DIR / "repos"
ERROR_CATALOG_DIR = RAW_DIR / "error-catalog"

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def slugify(text: str) -> str:
    """Generate clean filesystem slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


def parse_sources_manifest(content: str) -> list[dict]:
    """Parse table rows in sources.md into structured source entries."""
    sources = []
    current_category = "cat:general"
    
    for line in content.split("\n"):
        cat_match = re.search(r"## \d+\..*?\(`(cat:[a-z]+)`\)", line)
        if cat_match:
            current_category = cat_match.group(1)
            continue
            
        if line.strip().startswith("| `["):
            parts = re.split(r"(?<!\\)\|", line.strip())
            parts = [p.strip() for p in parts if p.strip()]
            if len(parts) >= 5:
                status = parts[0].strip("`")
                raw_title = parts[1]
                title = re.sub(r"[*_`]", "", raw_title).strip()
                src_type = parts[2].strip()
                raw_link = parts[3].strip()
                concepts = parts[4].strip()

                url = None
                url_match = re.search(r"https?://[^\s)\]]+", raw_link)
                if url_match:
                    url = url_match.group(0)
                elif "YouTube:" in raw_link:
                    yt_id_match = re.search(r"YouTube:\s*([A-Za-z0-9_-]+)", raw_link)
                    if yt_id_match:
                        url = f"https://www.youtube.com/watch?v={yt_id_match.group(1)}"
                elif raw_link.startswith("http"):
                    url = raw_link

                sources.append({
                    "status": status,
                    "category": current_category,
                    "title": title,
                    "type": src_type,
                    "raw_link": raw_link,
                    "url": url,
                    "key_concepts": concepts,
                    "raw_line": line
                })
            
    return sources


def fetch_html_to_markdown(url: str, title: str, category: str, concepts: str) -> str:
    """Fetch HTML URL and convert main body to clean Markdown."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    soup = BeautifulSoup(html, "html.parser")
    
    for el in soup(["script", "style", "nav", "header", "footer", "aside"]):
        el.decompose()
        
    main_content = soup.find("main") or soup.find("article") or soup.find("div", {"id": "content"}) or soup.find("body") or soup
    
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.ignore_images = False
    h.body_width = 0
    markdown_body = h.handle(str(main_content))
    
    today = datetime.date.today().isoformat()
    frontmatter = f"""---
title: "{title}"
category: "{category}"
source_url: "{url}"
ingested_at: "{today}"
key_concepts: "{concepts}"
---

# {title}

**Source URL:** [{url}]({url})  
**Category:** `{category}` | **Ingested:** `{today}`  
**Key Concepts:** {concepts}

---

{markdown_body}
"""
    return frontmatter


def clean_vtt_subtitles(vtt_text: str) -> str:
    """Convert raw VTT subtitle text into clean, deduplicated paragraph prose."""
    lines = vtt_text.split("\n")
    cleaned_lines = []
    seen = set()
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith("WEBVTT") or line.startswith("Kind:") or line.startswith("Language:"):
            continue
        if re.match(r"^\d{2}:\d{2}", line) or "-->" in line:
            continue
        line = re.sub(r"<[^>]+>", "", line).strip()
        if line and line not in seen:
            seen.add(line)
            cleaned_lines.append(line)
            
    paragraphs = []
    current_para = []
    for line in cleaned_lines:
        current_para.append(line)
        if len(current_para) >= 6:
            paragraphs.append(" ".join(current_para))
            current_para = []
    if current_para:
        paragraphs.append(" ".join(current_para))
        
    return "\n\n".join(paragraphs)


def fetch_youtube_transcript(url: str, title: str, category: str, concepts: str) -> str | None:
    """Fetch YouTube subtitles using yt-dlp and format as markdown transcript."""
    temp_prefix = RAW_DIR / f"temp_yt_{slugify(title)}"
    cmd = [
        "yt-dlp",
        "--write-auto-sub",
        "--write-sub",
        "--sub-lang", "en",
        "--skip-download",
        "--output", str(temp_prefix),
        url
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        vtt_files = list(RAW_DIR.glob(f"temp_yt_{slugify(title)}*.vtt"))
        if not vtt_files:
            return None
            
        with open(vtt_files[0], "r", encoding="utf-8", errors="replace") as f:
            vtt_content = f.read()
            
        for vf in vtt_files:
            vf.unlink(missing_ok=True)
            
        transcript_prose = clean_vtt_subtitles(vtt_content)
        today = datetime.date.today().isoformat()
        
        frontmatter = f"""---
title: "{title} (Transcript)"
category: "{category}"
source_url: "{url}"
ingested_at: "{today}"
key_concepts: "{concepts}"
---

# {title} - Talk Transcript

**Source Video:** [{url}]({url})  
**Category:** `{category}` | **Ingested:** `{today}`  
**Key Concepts:** {concepts}

---

## Talk Transcript

{transcript_prose}
"""
        return frontmatter
    except Exception as e:
        print(f"Error fetching YouTube transcript for {title}: {e}")
        return None


def fetch_error_catalog_issues():
    """Fetch all GitHub issues from elm/error-message-catalog using gh CLI."""
    if not shutil.which("gh"):
        print("GitHub CLI (gh) not installed; skipping error catalog issues dump.")
        return
        
    ERROR_CATALOG_DIR.mkdir(parents=True, exist_ok=True)
    issues_dir = ERROR_CATALOG_DIR / "issues"
    issues_dir.mkdir(parents=True, exist_ok=True)
    
    print("Fetching elm/error-message-catalog issues via gh CLI...")
    try:
        cmd = [
            "gh", "issue", "list",
            "--repo", "elm/error-message-catalog",
            "--state", "all",
            "--limit", "300",
            "--json", "number,title,body,state,author,labels,createdAt,url"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if res.returncode != 0:
            print("gh CLI issue fetch failed:", res.stderr)
            return
            
        import json
        issues = json.loads(res.stdout)
        print(f"Downloaded {len(issues)} issues. Formatting markdown files...")
        
        for issue in issues:
            num = issue["number"]
            ititle = issue["title"].replace('"', '\\"')
            state = issue["state"]
            author = issue.get("author", {}).get("login", "anonymous")
            created = issue.get("createdAt", "")
            url = issue.get("url", "")
            labels = [l["name"] for l in issue.get("labels", [])]
            body = issue.get("body") or "*No description provided.*"
            
            md_content = f"""---
issue_number: {num}
title: "{ititle}"
state: {state}
author: "{author}"
created_at: "{created}"
url: "{url}"
labels: {labels}
---

# Issue #{num}: {issue['title']}

**State:** `{state}` | **Author:** @{author} | **Source:** [{url}]({url})

## Description

{body}
"""
            out_file = issues_dir / f"issue-{num:03d}.md"
            with open(out_file, "w", encoding="utf-8") as out:
                out.write(md_content)
                
        print(f"Successfully formatted {len(issues)} issue files in {issues_dir}")
    except Exception as e:
        print("Error processing error catalog issues:", e)


def clone_error_catalog_repo():
    """Clone elm/error-message-catalog repository snapshot."""
    target_repo = ERROR_CATALOG_DIR / "repo"
    if target_repo.exists():
        print("Error message catalog repo already cloned.")
        return
        
    print("Cloning elm/error-message-catalog shallow snapshot...")
    try:
        subprocess.run(["git", "clone", "--depth", "1", "https://github.com/elm/error-message-catalog.git", str(target_repo)], check=True)
        shutil.rmtree(target_repo / ".git", ignore_errors=True)
        print("Cloned repository snapshot successfully.")
    except Exception as e:
        print("Error cloning error catalog repository:", e)


def update_sources_status(sources_to_mark: set[str]):
    """Update sources.md table rows from [ ] to [/]."""
    if not sources_to_mark:
        return
        
    with open(SOURCES_MD, "r", encoding="utf-8") as f:
        content = f.read()
        
    lines = content.split("\n")
    new_lines = []
    for line in lines:
        updated = False
        for title in sources_to_mark:
            clean_line_title = re.sub(r"[*_`]", "", line)
            if title in clean_line_title and "| `[ ]` |" in line:
                new_line = line.replace("| `[ ]` |", "| `[/]` |")
                new_lines.append(new_line)
                updated = True
                break
        if not updated:
            new_lines.append(line)
            
    with open(SOURCES_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(new_lines))


def append_to_log(ingested_items: list[str]):
    """Append ingestion batch to wiki/log.md."""
    if not ingested_items:
        return
        
    today = datetime.date.today().isoformat()
    entry = f"\n## [{today}] ingest | Batch Ingested {len(ingested_items)} Raw Sources\n"
    for item in ingested_items:
        entry += f"- Ingested raw source: {item}\n"
        
    with open(LOG_MD, "a", encoding="utf-8") as f:
        f.write(entry)


def main():
    parser = argparse.ArgumentParser(description="Ingest Elm raw sources into wiki/raw/")
    parser.add_argument("--category", help="Target specific category (e.g. cat:philosophy, cat:syntax)")
    parser.add_argument("--limit", type=int, default=10, help="Max sources to ingest in one run")
    parser.add_argument("--all", action="store_true", help="Ingest all queued sources")
    parser.add_argument("--with-error-catalog", action="store_true", help="Also clone error-message-catalog and issues")
    args = parser.parse_args()

    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    TRANSCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
    REPOS_DIR.mkdir(parents=True, exist_ok=True)

    if not SOURCES_MD.exists():
        print(f"Sources manifest {SOURCES_MD} not found!")
        sys.exit(1)

    with open(SOURCES_MD, "r", encoding="utf-8") as f:
        manifest_text = f.read()

    sources = parse_sources_manifest(manifest_text)
    queued_sources = [s for s in sources if s["status"] == "[ ]"]

    if args.category:
        queued_sources = [s for s in queued_sources if s["category"] == args.category]

    print(f"Found {len(queued_sources)} queued sources to process.")

    limit = len(queued_sources) if args.all else args.limit
    to_process = queued_sources[:limit]

    ingested_titles = set()
    log_records = []

    for src in to_process:
        title = src["title"]
        url = src["url"]
        cat = src["category"]
        concepts = src["key_concepts"]
        slug = slugify(title)

        print(f"\n---> Processing: [{cat}] {title}")

        if not url:
            print(f"Skipping {title}: No direct URL found.")
            continue

        if "youtube.com" in url or "youtu.be" in url:
            print(f"Fetching YouTube transcript: {url}")
            md_content = fetch_youtube_transcript(url, title, cat, concepts)
            if md_content:
                out_path = TRANSCRIPTS_DIR / f"{slug}.md"
                with open(out_path, "w", encoding="utf-8") as f:
                    f.write(md_content)
                print(f"Saved transcript to {out_path.relative_to(SKILL_ROOT)}")
                ingested_titles.add(title)
                log_records.append(f"Transcript: {title} ({out_path.name})")
        else:
            print(f"Fetching web documentation: {url}")
            try:
                md_content = fetch_html_to_markdown(url, title, cat, concepts)
                out_path = DOCS_DIR / f"{slug}.md"
                with open(out_path, "w", encoding="utf-8") as f:
                    f.write(md_content)
                print(f"Saved doc to {out_path.relative_to(SKILL_ROOT)}")
                ingested_titles.add(title)
                log_records.append(f"Doc: {title} ({out_path.name})")
            except Exception as e:
                print(f"Failed to fetch {url}: {e}")

    if args.with_error_catalog:
        print("\n---> Ingesting Elm Error Message Catalog...")
        clone_error_catalog_repo()
        fetch_error_catalog_issues()
        ingested_titles.add("Elm Error Message Catalog (Repo)")
        ingested_titles.add("Elm Error Message Catalog (Issues & Discussions)")
        log_records.append("Repo: elm/error-message-catalog")
        log_records.append("Issues: elm/error-message-catalog issues archive")

    if ingested_titles:
        print(f"\nUpdating {SOURCES_MD.relative_to(SKILL_ROOT)} status for {len(ingested_titles)} sources...")
        update_sources_status(ingested_titles)
        append_to_log(log_records)
        print("Ingestion run successfully completed!")
    else:
        print("No new sources were ingested in this run.")


if __name__ == "__main__":
    main()
