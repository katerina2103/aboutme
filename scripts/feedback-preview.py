from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json, sqlite3, uuid
ROOT=Path(__file__).resolve().parents[1]
DB=ROOT/'feedback.sqlite3'
with sqlite3.connect(DB) as db:
 db.execute('CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, vote TEXT NOT NULL, comment TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)')
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT/'dist'),**kwargs)
 def do_POST(self):
  if self.path!='/api/feedback':self.send_error(404);return
  try:
   length=int(self.headers.get('Content-Length','0'))
   if length<1 or length>12000:raise ValueError()
   data=json.loads(self.rfile.read(length));vote=data.get('vote');comment=data.get('comment');identity=data.get('id') or str(uuid.uuid4())
   uuid.UUID(identity)
   if vote not in ('up','down') or (comment is not None and (not isinstance(comment,str) or len(comment)>2000)):raise ValueError()
   with sqlite3.connect(DB) as db:
    db.execute("INSERT INTO feedback(id,vote,comment) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET vote=excluded.vote, comment=COALESCE(excluded.comment,feedback.comment), updated_at=CURRENT_TIMESTAMP",(identity,vote,comment))
   output=json.dumps({'id':identity}).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(output)));self.end_headers();self.wfile.write(output)
  except (ValueError,TypeError,json.JSONDecodeError):self.send_error(400)
ThreadingHTTPServer(('127.0.0.1',4173),Handler).serve_forever()
