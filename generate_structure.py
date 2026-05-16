#!/usr/bin/env python3
"""
Generates a text file with the file structure tree of a local Git repository.
Uses `git ls-files` to get the list of version-controlled files.
"""

import subprocess
import sys
import argparse
from pathlib import Path

DEFAULT_OUTPUT = "project_structure.txt"


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


def build_tree(files: list[str]) -> dict:
    """
    Build a nested dictionary representing the file tree.
    Example: {'src': {'app': {'layout.tsx': None, 'page.tsx': None}}}
    """
    tree = {}
    for file_path in sorted(files):
        parts = Path(file_path).parts
        current = tree
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        current[parts[-1]] = None
    return tree


def render_tree(tree: dict, prefix: str = "", is_last: bool = True) -> list[str]:
    """Render tree dictionary into list of strings with tree-like formatting."""
    lines = []
    items = list(tree.items())

    for i, (name, subtree) in enumerate(items):
        is_last_item = (i == len(items) - 1)

        if is_last_item:
            connector = "+-- "
            new_prefix = prefix + "    "
        else:
            connector = "+-- "
            new_prefix = prefix + "|   "

        if subtree is None:
            lines.append(f"{prefix}{connector}{name}")
        else:
            lines.append(f"{prefix}{connector}{name}/")
            lines.extend(render_tree(subtree, new_prefix, is_last_item))

    return lines


def count_stats(files: list[str]) -> dict:
    """Count files by extension and directories."""
    stats = {
        "total_files": len(files),
        "total_dirs": 0,
        "by_extension": {},
        "dirs": set()
    }

    for file_path in files:
        path = Path(file_path)
        ext = path.suffix.lower() or "(no extension)"
        stats["by_extension"][ext] = stats["by_extension"].get(ext, 0) + 1

        for parent in path.parents:
            if str(parent) != ".":
                stats["dirs"].add(str(parent))

    stats["total_dirs"] = len(stats["dirs"])
    stats["dirs"] = sorted(stats["dirs"])
    stats["by_extension"] = dict(sorted(stats["by_extension"].items(),
                                         key=lambda x: x[1], reverse=True))

    return stats


def generate_structure_file(repo_root: Path, files: list[str], output_path: Path,
                            exclude_dirs: set[str], include_stats: bool = True):
    """Generate the structure file with tree and optional statistics."""
    filtered_files = []
    for f in files:
        path_parts = Path(f).parts
        if not any(excluded in path_parts for excluded in exclude_dirs):
            filtered_files.append(f)

    tree = build_tree(filtered_files)
    repo_name = repo_root.name

    lines = []
    lines.append(f"Project: {repo_name}")
    lines.append(f"Root: {repo_root}")
    lines.append("=" * 60)
    lines.append("")
    lines.append(f"{repo_name}/")
    lines.extend(render_tree(tree))

    if include_stats:
        stats = count_stats(filtered_files)
        lines.append("")
        lines.append("=" * 60)
        lines.append("STATISTICS")
        lines.append("=" * 60)
        lines.append(f"Total files: {stats['total_files']}")
        lines.append(f"Total directories: {stats['total_dirs']}")
        lines.append("")
        lines.append("Files by extension:")
        for ext, count in stats["by_extension"].items():
            bar = "#" * min(count, 50)
            lines.append(f"  {ext:<20} {count:>5}  {bar}")

    output_text = "\n".join(lines)
    output_path.write_text(output_text, encoding='utf-8')
    print(f"Structure saved to: {output_path.resolve()}")
    print(f"Total files in tree: {len(filtered_files)}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate a text file with the file structure tree of a local Git repository."
    )
    parser.add_argument("repo_path", nargs="?", default=".",
                        help="Path to local repository (default: current directory).")
    parser.add_argument("--output", "-o", default=DEFAULT_OUTPUT,
                        help="Output file name (default: project_structure.txt).")
    parser.add_argument("--exclude-dir", nargs="*",
                        default=["node_modules", ".next"],
                        help="Directories to exclude from the tree "
                             "(default: node_modules .next).")
    parser.add_argument("--no-stats", action="store_true",
                        help="Don't include statistics section.")
    parser.add_argument("--print", "-p", action="store_true",
                        help="Also print the tree to console.")

    args = parser.parse_args()
    repo_root = Path(args.repo_path).resolve()

    if not (repo_root / ".git").exists():
        print(f"Error: {repo_root} is not a Git repository (no .git folder).", file=sys.stderr)
        sys.exit(1)

    exclude_dirs = set(args.exclude_dir)
    print(f"Analyzing repository: {repo_root}")

    files = get_git_tracked_files(repo_root)
    print(f"Total tracked files: {len(files)}")

    output_path = Path(args.output)
    generate_structure_file(repo_root, files, output_path, exclude_dirs,
                           include_stats=not args.no_stats)

    if args.print:
        print("\n" + output_path.read_text(encoding='utf-8'))


if __name__ == "__main__":
    main()