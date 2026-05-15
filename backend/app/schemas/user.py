from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str | None = None
    email: str | None = None
    role: str
    branch_code: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    role: str | None = None
    branch_code: str | None = None
    is_active: bool | None = None
    password: str | None = None


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
