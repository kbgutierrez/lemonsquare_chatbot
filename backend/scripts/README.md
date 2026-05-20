Maintenance scripts for Qdrant and ingestion tasks

- `wipe_recreate_qdrant.py`: Delete and recreate Qdrant collection(s) with payload indexes.
- `reingest_all.py`: Run routing ingestion, canonical ticket ingestion, and re-upsert manual/learned chat canonical points.
- `rebuild_canonical_vectors.py`: Wrapper to run canonical ticket ingestion (batch size configurable).

Usage examples (run from `backend/`):

```bash
python -m scripts.wipe_recreate_qdrant --yes
python -m scripts.reingest_all
python -m scripts.rebuild_canonical_vectors --batch 50
```

Notes:
- Reingestion of uploaded PDFs requires the original PDF files; place them in a folder and set `UPLOAD_DIR` env var if you want automated PDF reupload.
- Scripts import the application settings and DB sessions; ensure `.env` is configured or environment variables are set before running.
