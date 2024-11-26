from fastapi.responses import Response
import pandas as pd
from io import BytesIO
import json
from fastapi.responses import JSONResponse
import asyncio
import datetime

from src.model import DomainInference, MetaDataCLSInfer
from src.feature_domain import LexicalURLFeature
from .domain import DomainService
from ..database.models.domain import DomainSchema

from utils import (
    normalize_domain_for_lexical,
    get_metadata,
    get_config
)
from src.preprocessing import (is_phishing_url, is_licensed)

domain_inference = DomainInference()
config = get_config()


def get_type_domain_from_metadata(metadata):
    metadata_infer = MetaDataCLSInfer()
    inferred_type = metadata_infer.infer(text=metadata)
    type_mapping = {
        0: 'Báo chí, tin tức',
        1: 'Nội dung khiêu dâm',
        2: 'Cờ bạc, cá độ, vay tín dụng',
        3: 'Tổ chức',
        4: 'Chưa xác định'
    }
    return type_mapping.get(inferred_type, 'unknown')


def determine_type_domain(domain, has_metadata=False, metadata='', lexical=None):
    type_mapping = {
        "bao_chi": 'Báo chí, tin tức',
        "khieu_dam": 'Nội dung khiêu dâm',
        "co_bac": 'Cờ bạc, cá độ, vay tín dụng',
        "chinh_tri": 'Tổ chức',
        "Chưa xác định": 'Chưa xác định'
    }
    if domain.endswith('.gov.vn'):
        return 'Tổ chức', '', False
    elif has_metadata:
        word_sensitive = " "
        type_meta = get_type_domain_from_metadata(metadata)
        return type_meta, word_sensitive, True if type_meta == 'Báo chí, tin tức' else False
    else:
        type_domain, word = lexical.get_type_url()
        word_sensitive = word
        label = type_mapping.get(type_domain,'unknown')
        return label, word_sensitive, True if label == 'Báo chí, tin tức' else False
    
# 0: Bình thường
# 1: Tín nhiệm thấp
# 2: Cần xem xét
# 21: Cần xem xét: báo chí không cấp phép nhưng model bình thường
# 22: Cần xem xét: Có khả năng giả mạo nhưng model bình thường

async def infer_domains_service(file_content):
    try:
        # Check the size of file_content
        file_size = len(file_content)
        limit_size = config['file_validate']['limit_size']
        limit_row = config['file_validate']['limit_row']
        
        if file_size < limit_size * 1024 * 1024:  # 2 MB in bytes
            # print("alo")
            # Sử dụng một luồng khác để xử lý file với pandas (do pandas là sync)
            df = await asyncio.to_thread(pd.read_excel, BytesIO(file_content), engine='openpyxl')

            # validate file
            if len(df) > limit_row:
                return JSONResponse(status_code=400, content=json.dumps(
                    {"message": f"File Excel có hơn {limit_row} hàng.", "status": 400}))

            if list(df.columns) != ['url']:
                return JSONResponse(status_code=400, content=json.dumps(
                    {"message": "File Excel không có đúng định dạng. Cần có một cột với header là 'url'.", "status": 400}))

            # Tạo một danh sách để chứa kết quả
            results = []

            # Lặp qua từng dòng trong DataFrame và xử lý bất đồng bộ
            tasks = []
            for _, row in df.iterrows():
                domain = row['url']
                tasks.append(asyncio.create_task(infer_domain_service(domain)))

            # Chờ tất cả các tác vụ hoàn thành
            results = await asyncio.gather(*tasks)
            return results

        else:
            return JSONResponse(status_code=400, content=json.dumps(
                {"message": "File content is larger than 2MB and cannot be loaded.", "status": 400}))
    except Exception as error:
        # print(f"Đã xảy ra lỗi: {error}")
        import traceback
        # traceback.print_exc()
        return JSONResponse(content={"message": str(error)}, status_code=500)

async def infer_domain_service(domain):
    # normalize domain to keep only domain
    domain_normalize = normalize_domain_for_lexical(domain)
    lexical = LexicalURLFeature(domain_normalize)

    # Khởi tạo response mặc định
    response_data = {
        "domain": domain_normalize,
        "entropy": lexical.get_entropy(),
        "percentageDigits": lexical.get_percentage_digits(),
        "domainLength": lexical.get_length_to_display(),
        "specialChars": lexical.get_count_special_characters(),
        "typeDomain": " ",
        "wordSensitive": " ",
        "metadata": "",
        "officialDomain": "",
        "note": "",
        "lastUpdate": datetime.datetime.now().strftime("%d/%m/%Y"),
        "result": 100000
    }

    # Tạo list các coroutines để chạy song song
    async def check_licensed():
        return await asyncio.to_thread(is_licensed, domain_normalize)

    async def check_phishing():
        return await asyncio.to_thread(is_phishing_url, domain_normalize)

    async def get_domain_metadata():
        has_meta, meta = await asyncio.to_thread(get_metadata, domain)
        return has_meta, meta

    # Chạy các tác vụ song song
    licensed_task = asyncio.create_task(check_licensed())
    phishing_task = asyncio.create_task(check_phishing())
    metadata_task = asyncio.create_task(get_domain_metadata())

    # Đợi kết quả từ tất cả các tác vụ
    is_licensed_news, licensed_info = await licensed_task
    check_status, list_legit = await phishing_task
    has_metadata, metadata = await metadata_task

    # Xử lý logic dựa trên kết quả
    if is_licensed_news:
        response_data['typeDomain'] = "Báo chí, tin tức"
        response_data["note"] = "Báo chí được cấp phép"
        response_data["result"] = 0
    else:
        if check_status == 0:
            response_data["officialDomain"] = domain
            response_data["result"] = 0
            response_data["note"] = "Thuộc doanh nghiệp uy tín"
        else:
            if has_metadata:
                response_data["metadata"] = metadata

            type_domain, word_sensitive, is_baochi = determine_type_domain(
                domain=domain,
                has_metadata=has_metadata,
                metadata=metadata,
                lexical=lexical
            )
            response_data["typeDomain"] = type_domain
            response_data["wordSensitive"] = word_sensitive

            # Chạy model inference
            label, _ = await asyncio.to_thread(domain_inference.infer, domain, has_metadata, metadata)
            response_data["result"] = label

            # Xử lý các trường hợp đặc biệt
            if is_baochi and label == 0:
                response_data["result"] = 21
                response_data["note"] = "Báo chí chưa được cấp phép"
            elif is_baochi and label == 1:
                response_data["result"] = label
                response_data["note"] = "Báo chí chưa được cấp phép"

            if check_status == 1 and label == 1:
                response_data["result"] = label
                response_data["officialDomain"] = "\n".join(list_legit)
                response_data["note"] = "Có khả năng giả mạo\n" + "\n".join(list_legit)
            elif check_status == 1 and label == 0:
                response_data["result"] = 22
                response_data["note"] = "Có khả năng giả mạo\n" + "\n".join(list_legit)
                response_data["officialDomain"] = "\n".join(list_legit)

            if type_domain == 'Cờ bạc, cá độ, vay tín dụng':
                response_data["result"] = 1
                response_data["note"] = ""
                response_data["officialDomain"] = ""

            if type_domain == 'Nội dung khiêu dâm':
                response_data["result"] = 1
                response_data["note"] = ""
                response_data["officialDomain"] = ""

            if has_metadata == False and metadata == '*Website Không hoạt động':
                response_data["metadata"] = '*Website Không hoạt động'

    # Lưu vào database
    new_domain = DomainSchema(**response_data, isReview=False)
    await asyncio.to_thread(DomainService.create_domain, new_domain)

    return response_data