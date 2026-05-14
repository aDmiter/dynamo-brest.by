#!/usr/bin/env python3
"""
Collects all text files from a local Git repository into TXT files,
split into parts of ~2500 lines each.
Uses `git ls-files` to get the list of version-controlled files.
"""

import subprocess
import sys
import argparse
from pathlib import Path

DEFAULT_MAX_SIZE_MB = 2
DEFAULT_OUTPUT_BASE = "repo_content"
DEFAULT_MAX_LINES = 2500


def is_text_file(file_path: Path, sample_size: int = 8192) -> bool:
    """Check if file is text by trying to decode its beginning as UTF-8."""
    try:
        with open(file_path, 'rb') as f:
            chunk = f.read(sample_size)
        chunk.decode('utf-8')
        return True
    except (UnicodeDecodeError, IOError):
        # Try other encodings
        for encoding in ['windows-1251', 'cp1251', 'latin-1', 'cp1252']:
            try:
                chunk.decode(encoding)
                return True
            except (UnicodeDecodeError, IOError):
                continue
        return False


def read_file_content(file_path: Path) -> str:
    """
    Read file content with automatic encoding detection.
    Tries UTF-8 first, then windows-1251, then cp1251.
    """
    # Try UTF-8 with BOM first
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            return f.read()
    except (UnicodeDecodeError, IOError):
        pass

    # Try regular UTF-8
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except (UnicodeDecodeError, IOError):
        pass

    # Try windows-1251 (Cyrillic in Windows)
    try:
        with open(file_path, 'r', encoding='windows-1251') as f:
            return f.read()
    except (UnicodeDecodeError, IOError):
        pass

    # Try cp1251
    try:
        with open(file_path, 'r', encoding='cp1251') as f:
            return f.read()
    except (UnicodeDecodeError, IOError):
        pass

    # Fallback to latin-1 (reads everything)
    try:
        with open(file_path, 'r', encoding='latin-1') as f:
            return f.read()
    except (UnicodeDecodeError, IOError):
        pass

    # Last resort: read as binary and decode with replacement
    try:
        with open(file_path, 'rb') as f:
            raw = f.read()
        return raw.decode('utf-8', errors='replace')
    except IOError:
        raise


def get_git_tracked_files(repo_root: Path) -> list[str]:
    """Get list of Git-tracked files using `git ls-files`."""
    try:
        result = subprocess.run(
            ["git", "ls-files"],
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=True
        )
        files = [line.strip() for line in result.stdout.splitlines() if line.strip()]
        return files
    except subprocess.CalledProcessError as e:
        print(f"Error running git ls-files: {e}", file=sys.stderr)
        sys.exit(1)


def collect_files(repo_root: Path, allowed_ext: set[str] | None, max_size_bytes: int, exclude_dirs: set[str]):
    """Collect suitable files and return list of (rel_path, content) tuples."""
    tracked_files = get_git_tracked_files(repo_root)
    print(f"Total tracked files: {len(tracked_files)}")

    if allowed_ext:
        print(f"Extension filter: {allowed_ext}")

    if exclude_dirs:
        print(f"Excluded directories: {exclude_dirs}")

    # Extensions to always skip (binary files)
    always_skip_ext = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.svg',
                       '.woff', '.woff2', '.ttf', '.eot', '.otf',
                       '.mp3', '.mp4', '.avi', '.mov', '.webm',
                       '.zip', '.tar', '.gz', '.rar', '.7z',
                       '.pdf', '.doc', '.docx', '.xls', '.xlsx',
                       '.exe', '.dll', '.so', '.dylib',
                       '.db', '.sqlite', '.sqlite3'}

    result = []
    skipped = 0
    excluded_by_dir = 0

    for rel_path in tracked_files:
        full_path = repo_root / rel_path

        # Check if file is in excluded directory
        path_parts = Path(rel_path).parts
        if any(excluded in path_parts for excluded in exclude_dirs):
            excluded_by_dir += 1
            continue

        # Skip known binary extensions
        if full_path.suffix.lower() in always_skip_ext:
            skipped += 1
            continue

        # Extension filter (if whitelist is specified)
        if allowed_ext is not None and full_path.suffix.lower() not in allowed_ext:
            skipped += 1
            continue

        # Size check
        try:
            size = full_path.stat().st_size
        except OSError:
            print(f"Skipped (access error): {rel_path}")
            skipped += 1
            continue

        if size > max_size_bytes:
            print(f"Skipped (too large {size} bytes): {rel_path}")
            skipped += 1
            continue

        # Text file check
        if not is_text_file(full_path):
            print(f"Skipped (binary): {rel_path}")
            skipped += 1
            continue

        # Read content with automatic encoding detection
        try:
            content = read_file_content(full_path)
        except Exception as e:
            print(f"Skipped (read error): {rel_path} - {e}")
            skipped += 1
            continue

        result.append((rel_path, content))

    if not result:
        print("No suitable files found.")
        sys.exit(0)

    print(f"Processed files: {len(result)}")
    print(f"Skipped by excluded dirs: {excluded_by_dir}")
    print(f"Skipped (binary/large/extension): {skipped}")
    return result


def save_split_txt(files: list[tuple[str, str]], output_base: Path, max_lines: int):
    """Save result into multiple TXT files, split by number of lines."""
    parts = []
    current_part_files = []
    current_part_content = []
    current_lines = 0

    for rel_path, content in files:
        header = f"=== File: {rel_path} ===\n"
        block = header + content + "\n"
        block_lines = block.count('\n')

        # Warn if single file exceeds line limit
        if block_lines > max_lines:
            print(f"Warning: file {rel_path} ({block_lines} lines) exceeds limit "
                  f"({max_lines} lines), but will be included entirely.")

        # Start new part if current block doesn't fit
        if current_lines + block_lines > max_lines and current_part_files:
            parts.append((current_part_files, "\n".join(current_part_content)))
            current_part_files = []
            current_part_content = []
            current_lines = 0

        current_part_files.append(rel_path)
        current_part_content.append(block)
        current_lines += block_lines

    # Last part
    if current_part_files:
        parts.append((current_part_files, "\n".join(current_part_content)))

    # Save parts
    total_parts = len(parts)
    for idx, (part_files, part_content) in enumerate(parts, 1):
        if total_parts == 1:
            output_path = Path(f"{output_base}.txt")
        else:
            output_path = Path(f"{output_base}_part{idx}.txt")

        # Add table of contents
        toc = f"Part {idx} of {total_parts}\n"
        toc += f"Files in this part: {len(part_files)}\n"
        toc += f"Total lines: {part_content.count(chr(10))}\n"
        toc += "=" * 50 + "\n\n"
        toc += "Contents:\n"
        for f in part_files:
            toc += f"  - {f}\n"
        toc += "\n" + "=" * 50 + "\n\n"

        final_content = toc + part_content
        # Always save as UTF-8
        output_path.write_text(final_content, encoding='utf-8')

        file_size_kb = output_path.stat().st_size / 1024
        total_lines = final_content.count('\n')
        print(f"Saved: {output_path.name} "
              f"({file_size_kb:.1f} KB, {total_lines} lines, {len(part_files)} files)")

    return total_parts


def main():
    parser = argparse.ArgumentParser(
        description="Collect text files from a local Git repo into split TXT files."
    )
    parser.add_argument("repo_path", nargs="?", default=".",
                        help="Path to local repository (default: current directory).")
    parser.add_argument("--output", "-o", default=DEFAULT_OUTPUT_BASE,
                        help="Base name for output files (default: repo_content).")
    parser.add_argument("--max-size-mb", type=float, default=DEFAULT_MAX_SIZE_MB,
                        help="Maximum size of a single source file in MB "
                             "(default: 2).")
    parser.add_argument("--max-lines", type=int, default=DEFAULT_MAX_LINES,
                        help="Maximum number of lines per output part "
                             "(default: 2500).")
    parser.add_argument("--ext", nargs="*",
                        help="Only include files with specified extensions (e.g. .py .md). "
                             "If not specified, all text files are included.")
    parser.add_argument("--exclude-dir", nargs="*",
                        default=["node_modules", ".next"],
                        help="Additional directories to exclude "
                             "(default: node_modules .next).")

    args = parser.parse_args()
    repo_root = Path(args.repo_path).resolve()

    if not (repo_root / ".git").exists():
        print(f"Error: {repo_root} is not a Git repository (no .git folder).", file=sys.stderr)
        sys.exit(1)

    if args.ext:
        allowed_ext = {e.lower() if e.startswith('.') else f".{e}".lower() for e in args.ext}
    else:
        allowed_ext = None

    exclude_dirs = set(args.exclude_dir)
    max_size_bytes = int(args.max_size_mb * 1024 * 1024)

    print(f"Analyzing repository: {repo_root}")
    files = collect_files(repo_root, allowed_ext, max_size_bytes, exclude_dirs)

    output_base = Path(args.output)
    total_parts = save_split_txt(files, output_base, args.max_lines)

    print(f"\nDone! Created {total_parts} part(s)")

    if total_parts == 1:
        print(f"File: {output_base}.txt")
    else:
        print("Files:")
        for i in range(1, total_parts + 1):
            print(f"  {output_base}_part{i}.txt")


if __name__ == "__main__":
    main()