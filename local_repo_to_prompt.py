#!/usr/bin/env python3
"""
Объединяет все текстовые файлы из локального Git-репозитория в один файл.
Использует `git ls-files` для получения списка файлов под версионным контролем.
"""

import subprocess
import sys
import argparse
from pathlib import Path

DEFAULT_MAX_SIZE_MB = 2
DEFAULT_OUTPUT = "repo_content.txt"


def is_text_file(file_path: Path, sample_size: int = 8192) -> bool:
    """Проверяет, текстовый ли файл, пытаясь декодировать его начало как UTF-8."""
    try:
        with open(file_path, 'rb') as f:
            chunk = f.read(sample_size)
        chunk.decode('utf-8')
        return True
    except (UnicodeDecodeError, IOError):
        return False


def get_git_tracked_files(repo_root: Path) -> list[str]:
    """
    Возвращает список относительных путей файлов, отслеживаемых Git,
    используя команду `git ls-files`.
    """
    try:
        result = subprocess.run(
            ["git", "ls-files"],
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=True
        )
        # Разбиваем по строкам, отбрасываем пустые
        files = [line.strip() for line in result.stdout.splitlines() if line.strip()]
        return files
    except subprocess.CalledProcessError as e:
        print(f"Ошибка при выполнении git ls-files: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Собрать текстовые файлы локального Git-репозитория в один файл."
    )
    parser.add_argument("repo_path", nargs="?", default=".",
                        help="Путь к локальному репозиторию (по умолчанию текущая папка).")
    parser.add_argument("--output", "-o", default=DEFAULT_OUTPUT,
                        help=f"Имя выходного файла (по умолчанию: {DEFAULT_OUTPUT})")
    parser.add_argument("--max-size-mb", type=float, default=DEFAULT_MAX_SIZE_MB,
                        help=f"Максимальный размер файла в МБ (по умолчанию: {DEFAULT_MAX_SIZE_MB})")
    parser.add_argument("--ext", nargs="*",
                        help="Оставить только файлы с указанными расширениями (например .py .md). "
                             "Если не указано, берутся все текстовые файлы.")

    args = parser.parse_args()
    repo_root = Path(args.repo_path).resolve()

    if not (repo_root / ".git").exists():
        print(f"Ошибка: {repo_root} не является Git-репозиторием (нет папки .git).", file=sys.stderr)
        sys.exit(1)

    print(f"Получаю список файлов из Git-репозитория: {repo_root}")
    tracked_files = get_git_tracked_files(repo_root)
    print(f"Всего отслеживаемых файлов: {len(tracked_files)}")

    if args.ext:
        allowed_ext = {e.lower() if e.startswith('.') else f".{e}".lower() for e in args.ext}
        print(f"Фильтрация по расширениям: {allowed_ext}")
    else:
        allowed_ext = None

    max_size_bytes = int(args.max_size_mb * 1024 * 1024)

    output_parts = []
    skipped = 0
    processed = 0

    for rel_path in tracked_files:
        full_path = repo_root / rel_path

        # Фильтр по расширению (если задан)
        if allowed_ext is not None and full_path.suffix.lower() not in allowed_ext:
            skipped += 1
            continue

        # Проверка размера
        try:
            size = full_path.stat().st_size
        except OSError:
            print(f"Пропущен (ошибка доступа): {rel_path}")
            skipped += 1
            continue

        if size > max_size_bytes:
            print(f"Пропущен (слишком большой {size} байт): {rel_path}")
            skipped += 1
            continue

        # Проверка на текстовый файл
        if not is_text_file(full_path):
            print(f"Пропущен (бинарный): {rel_path}")
            skipped += 1
            continue

        # Чтение содержимого
        try:
            content = full_path.read_text(encoding="utf-8")
        except Exception as e:
            print(f"Пропущен (ошибка чтения): {rel_path} — {e}")
            skipped += 1
            continue

        header = f"=== File: {rel_path} ===\n"
        output_parts.append(header + content + "\n")
        processed += 1

    if not output_parts:
        print("Нет подходящих файлов для объединения.")
        sys.exit(0)

    # Запись результата
    output_text = "\n".join(output_parts)
    output_path = Path(args.output)
    output_path.write_text(output_text, encoding="utf-8")
    file_size_mb = output_path.stat().st_size / (1024 * 1024)

    print(f"\nГотово!")
    print(f"Обработано файлов: {processed}")
    print(f"Пропущено (бинарные / большие / не по расширению): {skipped}")
    print(f"Результат сохранён в: {output_path.resolve()} ({file_size_mb:.2f} МБ)")


if __name__ == "__main__":
    main()