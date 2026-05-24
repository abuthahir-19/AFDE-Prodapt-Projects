from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenUser(BaseModel):
    id: int
    name: str
    email: str
    role: str
    role_id: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: TokenUser
