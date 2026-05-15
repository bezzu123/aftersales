from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    username: str
    full_name: str | None
    email: str | None
    role: str
    branch_code: str | None
    is_active: bool

    class Config:
        from_attributes = True
