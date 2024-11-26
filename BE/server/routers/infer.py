import fastapi
from fastapi import File, UploadFile, Depends
from fastapi.responses import JSONResponse
from typing import List

from ..models.infer import InferDomainResponse
from ..services.infer import infer_domain_service, infer_domains_service
from ..middleware.security import validate_token
router_infer = fastapi.APIRouter()



@router_infer.get('/', response_model=InferDomainResponse, dependencies=[Depends(validate_token)])
async def infer_domain(domain: str , model_release : str = 'release_v1'):
    try:
        rt = await infer_domain_service(domain)
        return InferDomainResponse(**rt)
    except Exception as error:
        # print(f"Đã xảy ra lỗi: {error}")
        import traceback
        # traceback.print_exc()
        return JSONResponse(content={"message": str(error)}, status_code=500) 


@router_infer.post("/file/", dependencies=[Depends(validate_token)])
async def upload_file(file: UploadFile = File(...), model_release : str = 'release_v1'):
    try:
        # Đọc nội dung file và lưu vào biến
        file_content = await file.read()
        results = await infer_domains_service(file_content)
        # Trả về kết quả dưới dạng JSON
        return JSONResponse(
            content={
                "data": results,
                "status": 200
            },
            status_code=200
        )
    except Exception as error:
        # print(f"Đã xảy ra lỗi: {error}")
        import traceback
        # traceback.print_exc()
        return JSONResponse(content={"message": str(error)}, status_code=500)

# from tqdm import tqdm
# @router_infer.post("/chunk/", dependencies=[Depends(validate_token)])
# async def upload_file(domains: List[str] ,model_release : str = 'release_v1'):
    

#     try:

#         results = []
#         for domain in tqdm(domains, desc="Processing domains"):
#             rt = await infer_domain_service(domain)
#             results.append(InferDomainResponse(**rt))
#         return results



#     except Exception as error:
#         # print(f"Đã xảy ra lỗi: {error}")
#         import traceback
#         # traceback.print_exc()
#         return JSONResponse(content={"message": str(error)}, status_code=500)

# ==============================================

# from fastapi import Depends, APIRouter
# from typing import List
# from multiprocessing import Pool, cpu_count
# import multiprocessing
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel
# import asyncio
# from functools import partial

# # Định nghĩa hàm xử lý cho một domain đơn lẻ
# def process_single_domain(domain: str, model_release: str = 'release_v1'):
#     try:
#         # Chuyển hàm async thành sync để có thể chạy trong multiprocessing
#         async def async_wrapper():
#             return await infer_domain_service(domain)
        
#         # Chạy hàm async trong event loop
#         loop = asyncio.new_event_loop()
#         asyncio.set_event_loop(loop)
#         result = loop.run_until_complete(async_wrapper())
#         loop.close()
        
#         return InferDomainResponse(**result)
#     except Exception as e:
#         return {"error": str(e)}

# # Hàm wrapper để xử lý chunk data
# def process_chunk(chunk_data, model_release):
#     chunk_id, domains = chunk_data
#     print(f"Processing chunk {chunk_id}")
#     results = []
#     for domain in domains:
#         result = process_single_domain(domain, model_release)
#         results.append(result)
#     return results

# @router_infer.post("/chunk/", dependencies=[Depends(validate_token)])
# async def upload_file(domains: List[str], model_release: str = 'release_v1'):
#     try:
#         # Xác định số lượng CPU cores
#         num_processes = cpu_count() - 10
        
#         # Tính toán kích thước chunk dựa trên số lượng domains và processes
#         chunk_size = max(1, len(domains) // num_processes)
        
#         # Chia domains thành các chunks
#         chunks = [domains[i:i + chunk_size] for i in range(0, len(domains), chunk_size)]
        
#         # Chuẩn bị input data với index
#         input_data = list(enumerate(chunks))
        
#         # Tạo partial function với model_release
#         process_func = partial(process_chunk, model_release=model_release)
        
#         # Sử dụng Pool để xử lý parallel
#         with Pool(processes=num_processes) as pool:
#             # Map process_func với input_data và collect kết quả
#             chunk_results = pool.map(process_func, input_data)
        
#         # Gộp kết quả từ tất cả các chunks
#         final_results = []
#         for chunk in chunk_results:
#             final_results.extend(chunk)
        
#         return final_results

#     except Exception as error:
#         import traceback
#         return JSONResponse(content={"message": str(error)}, status_code=500)


#=====================================
from tqdm import tqdm
from fastapi import Depends, APIRouter
from typing import List
from multiprocessing import Pool, cpu_count
import multiprocessing
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import asyncio
from functools import partial
import pandas as pd
import os

def process_domain_chunk(chunk_data):
    """
    Xử lý một chunk các domains một cách tuần tự
    chunk_data: tuple (chunk_id, list of domains, model_release)
    """
    chunk_id, domains, model_release = chunk_data
    results = []
    
    print(f"Process {multiprocessing.current_process().name} starting chunk {chunk_id}")
    print(f"Number of domains in chunk {chunk_id}: {len(domains)}")
    
    # Tạo event loop cho process này
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Xử lý tuần tự từng domain trong chunk
        for domain in tqdm(domains, desc=f"Chunk {chunk_id}"):
            try:
                # Chạy async function trong event loop
                result = loop.run_until_complete(infer_domain_service(domain))
                results.append(InferDomainResponse(**result))
            except Exception as e:
                results.append({
                    "domain": domain,
                    "result": None,
                    "status": "error",
                    "error_message": str(e)
                })
                print(f"Error processing domain {domain} in chunk {chunk_id}: {str(e)}")
    
    finally:
        loop.close()
    
    print(f"Finished processing chunk {chunk_id}")
    return {
        "chunk_id": chunk_id,
        "results": results,
        "total_processed": len(results)
    }
output_dir = '/home/esti-cv/Desktop/VNNIC/ITV_VNNIC_PROJECT/server/result'
@router_infer.post("/chunk/", dependencies=[Depends(validate_token)])
async def upload_file(domains: List[str], model_release: str = 'release_v1'):
    try:
        # Xác định số lượng processes dựa trên CPU cores
        num_processes = cpu_count() - 16
        print(f"Using {num_processes} processes")
        
        # Tính toán kích thước chunk
        chunk_size = max(1, len(domains) // num_processes)
        if chunk_size < 1:
            chunk_size = 1
        
        # Chia domains thành các chunks
        chunks = []
        for i in range(0, len(domains), chunk_size):
            chunk = domains[i:i + chunk_size]
            chunks.append(chunk)
        
        # Chuẩn bị input data cho multiprocessing
        input_data = [
            (i, chunk, model_release) 
            for i, chunk in enumerate(chunks)
        ]
        
        print(f"Created {len(chunks)} chunks of approximate size {chunk_size}")
        
        # Sử dụng Pool để phân phối các chunks cho các processes
        with Pool(processes=num_processes) as pool:
            # Chạy process_domain_chunk trên mỗi chunk
            chunk_results = pool.map(process_domain_chunk, input_data)
        
        # Gộp kết quả từ tất cả các chunks
        final_results = []
        for chunk_result in chunk_results:
            final_results.extend(chunk_result["results"])

        # Tạo DataFrame từ kết quả
        df = pd.DataFrame(final_results)
        
        # Tạo tên file với timestamp
        filename = f"domain_results_100000.csv"
        
        # Tạo thư mục output nếu chưa tồn tại
        os.makedirs(output_dir, exist_ok=True)
        
        # Đường dẫn đầy đủ của file CSV
        csv_path = os.path.join(output_dir, filename)
        
        # Lưu DataFrame thành file CSV
        df.to_csv(csv_path, index=False, encoding='utf-8')
        print(f"Results saved to: {csv_path}")
        
        return final_results

    except Exception as error:
        import traceback
        traceback.print_exc()
        return JSONResponse(
            content={
                "message": str(error),
                "traceback": traceback.format_exc()
            }, 
            status_code=500
        )