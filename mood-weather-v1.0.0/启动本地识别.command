#!/bin/zsh
cd "$(dirname "$0")"
if curl -fsS http://127.0.0.1:8766/health >/dev/null 2>&1; then
  open http://127.0.0.1:8766
  exit 0
fi
.venv/bin/python -u server.py &
emotion_pid=$!
trap 'kill "$emotion_pid" 2>/dev/null' EXIT INT TERM
for attempt in {1..60}; do
  if curl -fsS http://127.0.0.1:8766/health >/dev/null 2>&1; then
    open http://127.0.0.1:8766
    break
  fi
  kill -0 "$emotion_pid" 2>/dev/null || exit 1
  sleep 1
done
wait "$emotion_pid"
