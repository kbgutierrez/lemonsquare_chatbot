try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address

    limiter = Limiter(key_func=get_remote_address)
    rate_limit_enabled = True
except ImportError:  # pragma: no cover
    class _NoOpLimiter:
        def limit(self, *args, **kwargs):
            def decorator(fn):
                return fn
            return decorator

    limiter = _NoOpLimiter()
    rate_limit_enabled = False