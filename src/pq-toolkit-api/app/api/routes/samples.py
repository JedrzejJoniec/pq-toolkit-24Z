from fastapi import APIRouter, Request, Depends, UploadFile, HTTPException, Form
from app.api.deps import SessionDep
from app.schemas import PqSampleRating, PqSuccessResponse, PqSampleRatingList
import app.crud as crud
from app.api.deps import SessionDep, SampleManagerDep, CurrentAdmin
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.put("/rate", response_model=PqSampleRating)
async def rate_sample(
        request: PqSampleRating,
        session: SessionDep,
):
    updated_sample = crud.add_sample_rating(session, request)
    return updated_sample


@router.post("/", response_model=PqSuccessResponse)
async def upload_samples(
        session: SessionDep,
        sample_manager: SampleManagerDep,
        files: list[UploadFile],
        titles: list[str] = Form(...)
):
    if len(files) != len(titles):
        raise HTTPException(status_code=400, detail="Number of files and titles must match")

    for file, title in zip(files, titles):
        crud.upload_sample(session, sample_manager, file, title)

    return PqSuccessResponse(success=True)


@router.get("/", response_model=PqSampleRatingList)
def get_samples(session: SessionDep):
    return crud.get_samples(session)


@router.get("/stream", response_model=UploadFile)
def get_sample_stream(sample_manager: SampleManagerDep, filename: str):
    return crud.get_sample(sample_manager, filename)

@router.delete("/{sample_id}", response_model=PqSuccessResponse)
def delete_sample(sample_manager: SampleManagerDep, session: SessionDep, sample_id: str):
    crud.delete_sample(sample_manager, session, sample_id)
    return PqSuccessResponse(success=True)
