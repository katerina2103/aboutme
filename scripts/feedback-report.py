from pathlib import Path
import sqlite3
root=Path(__file__).resolve().parents[1]
with sqlite3.connect(root/'feedback.sqlite3') as db:
 rows=db.execute('SELECT created_at,vote,comment FROM feedback ORDER BY created_at DESC').fetchall()
up=sum(r[1]=='up' for r in rows)
report=f"# Website feedback\n\nTotal: {len(rows)} · Yes, clearly: {up} · Not quite yet: {len(rows)-up}\n\n"
for date,vote,comment in rows:
 report+=f"- {date} UTC · {vote}: {comment or '(no comment)'}\n"
(root/'feedback-results.md').write_text(report)
print(report)
