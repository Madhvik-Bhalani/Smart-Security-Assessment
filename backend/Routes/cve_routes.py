from fastapi import APIRouter, HTTPException, Depends, Query
from Controllers.cve_controller import get_cves
from Middleware.auth import Auth

router = APIRouter()

@router.get("/cves", summary="Fetch Latest CVEs", tags=["CVEs"])
async def fetch_latest_cves(
    start: int = Query(0, description="Starting index for pagination"),
    length: int = Query(10, description="Number of records per page"),
    user=Depends(Auth.verify_token)
):
    """
    API endpoint to fetch paginated CVEs.
    :param start: Starting index for pagination.
    :param length: Number of records per page.
    :return: Paginated CVE data.
    """
    try:
        total_records, cve_data = get_cves(start=start, length=length)
        return {
            "totalRecords": total_records,
            "data": cve_data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
