import os
import uuid
import aiofiles
from fastapi import UploadFile
from app.config import settings


async def save_image(file: UploadFile) -> str:
    if settings.storage_type == "gcs":
        return await _save_gcs(file)
    return await _save_local(file)


async def _save_local(file: UploadFile) -> str:
    os.makedirs(settings.upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(settings.upload_dir, filename)
    async with aiofiles.open(path, "wb") as f:
        content = await file.read()
        await f.write(content)
    return f"/uploads/{filename}"


async def _save_gcs(file: UploadFile) -> str:
    from google.cloud import storage
    client = storage.Client()
    bucket = client.bucket(settings.gcs_bucket)
    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    blob_name = f"tickets/{uuid.uuid4()}{ext}"
    blob = bucket.blob(blob_name)
    content = await file.read()
    blob.upload_from_string(content, content_type=file.content_type or "image/jpeg")
    return blob.public_url
