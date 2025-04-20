#!/bin/bash
set -euo pipefail

echo "🛠 Running setup script..."

case "$OSTYPE" in
  linux-gnu* | darwin* | msys* | cygwin* | linux-musl)
    echo "🧪 Detected Unix-like OS"
    chmod +x scripts/drop_db.sh
    chmod +x scripts/import_db_from_json.sh
    chmod +x scripts/export_db_to_json.sh
    echo "✅ Scripts are now executable. You can run them."
    ;;

  win32)
    echo "⚠️ Detected Windows (cmd or PowerShell)"
    echo "ℹ️ Please use Git Bash or WSL to run setup and other scripts."
    echo "❌ setup.sh cannot be run in Command Prompt or PowerShell."
    exit 1
    ;;

  *)
    echo "❓ Unknown OS type: $OSTYPE"
    echo "⚠️ Please check script compatibility manually."
    ;;
esac
