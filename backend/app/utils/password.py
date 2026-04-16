from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

pwd_context = PasswordHash((BcryptHasher(),))

def hash_password(password: str) -> str:
    """
        Hash a plain text password using bcrypt
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
        Verify a plain password against a hashed one
    """
    return pwd_context.verify(plain_password, hashed_password)