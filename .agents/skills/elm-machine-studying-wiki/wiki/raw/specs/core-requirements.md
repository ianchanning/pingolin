# Core Requirements - Pinboard Tag Reorganization

## Goal
Reorganize 20,000+ Pinboard links by mapping existing tags to Arxiv Computer Science categories to improve organization and discoverability.

## Source Data
- **Arxiv Categories:** Defined in `Computer Science.md`. Format is typically `cs.<CODE> - <Name>`.
- **Pinboard Bookmarks:** Current tags and links accessible via the `pinboard` CLI.

## Workflow
1.  **Metadata Extraction:**
    - Parse `Computer Science.md` to extract category codes (e.g., `cs.AI`), names (e.g., `Artificial Intelligence`), and synonyms/keywords from descriptions.
2.  **Tag Discovery:**
    - Retrieve all existing tags from Pinboard using `pinboard tags`.
3.  **Mapping & Matching:**
    - Identify existing tags that match Arxiv category names or synonyms.
    - Handle cases like case-insensitive matches, partial matches, or known synonyms.
4.  **Renaming (Execution):**
    - Use `pinboard rename-tag --old <OLD_TAG> --new <NEW_TAG>` to consolidate tags into the Arxiv schema.
    - Ensure a dry-run or verification step before batch renaming.

## Constraints & Considerations
- **Scale:** 20,000+ links. Tag operations should be efficient.
- **Precision:** Avoid over-aggressive matching (e.g., "AI" might be a tag, but "A" shouldn't match).
- **Automation:** Use scripts to automate the parsing and mapping suggestions.
- **Safety:** Provide a way to review and approve renames before they are applied.

## Success Criteria
- Existing tags are consolidated into a standardized Arxiv-based hierarchy.
- Links are searchable using the new Arxiv tags.
- The process is repeatable for future tagging.
