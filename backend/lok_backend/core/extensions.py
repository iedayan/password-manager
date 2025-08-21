"""Flask extensions initialization."""

from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

jwt = JWTManager()
bcrypt = Bcrypt()
# Configure rate limiter with Redis if available
redis_url = os.environ.get('REDIS_URL')
if redis_url:
    limiter = Limiter(
        key_func=get_remote_address,
        storage_uri=redis_url
    )
else:
    limiter = Limiter(key_func=get_remote_address)