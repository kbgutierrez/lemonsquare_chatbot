bind = "0.0.0.0:8000"
# Upload progress is tracked by the in-process JobManager. Multiple workers
# split that memory, so status polling can land on a worker that does not know
# about the upload job. Keep this at 1 unless job state is moved to SQL/Redis.
workers = 1
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
graceful_timeout = 30
keepalive = 5
preload_app = False
accesslog = "-"
errorlog = "-"
loglevel = "info"
