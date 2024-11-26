from bs4 import BeautifulSoup
from typing import Tuple
from selenium import webdriver
import traceback


# def get_metadata(url: str, timeout: int = 12) -> Tuple[bool, str]:
#     '''
#     Lấy thông tin thẻ meta description hoặc keywords từ trang web và nối với nội dung body.
#     Tham số:
#     - url: Địa chỉ URL của trang web cần lấy thông tin.
#     - timeout: Thời gian chờ tối đa cho yêu cầu (mặc định là 7 giây).
#     Trả về:
#     - Tuple[bool, str]:
#         - Phần tử đầu tiên (bool) cho biết thành công (True) hay thất bại (False).
#         - Phần tử thứ hai (str) chứa nội dung của thẻ meta description/keywords và 500 ký tự giữa của phần body (nếu tìm thấy), hoặc chuỗi rỗng nếu không tìm thấy.
#     '''
#     try:
#         if not url.startswith("http://") and not url.startswith("https://"):
#             url = "https://" + url

#         # Khởi tạo trình điều khiển Chrome
#         driver = webdriver.Chrome()
#         driver.set_page_load_timeout(timeout)
#         driver.get(url)

#         # Lấy nội dung HTML của trang web
#         html_content = driver.page_source
#         soup = BeautifulSoup(html_content, 'html.parser')
#         # Danh sách các metadata cần kiểm tra
#         metadata_tags = [
#             ('meta', {'id': 'metaDes', 'name': 'description'}),
#             ('meta', {'name': 'description'}),
#             ('meta', {'property': 'og:description'}),
#             ('meta', {'name': 'twitter:description'})
#         ]

#         for tag, attrs in metadata_tags:
#             meta_tag = soup.find(tag, attrs=attrs)
#             if meta_tag and 'content' in meta_tag.attrs:
#                 content = meta_tag.attrs['content'].strip()
#                 if len(content) >= 10:
#                     return (True, content)

#         # # Lấy nội dung body
#         # body_text = soup.get_text()
#         # body_content = body_text[len(body_text)//2-250:len(body_text)//2+250]
#         # # Nối meta content và body content
#         # result = f"{body_content}"
#         driver.quit()
#         return (False, "")

#     except Exception as e:
#         traceback.print_exc()
#         if 'driver' in locals() and driver:
#             driver.quit()
#         return (False, "*Website Không hoạt động")


from bs4 import BeautifulSoup
from typing import Tuple
import requests
import traceback


def get_metadata(url: str, timeout: int = 6) -> Tuple[bool, str]:
    '''
    Lấy thông tin thẻ meta description hoặc keywords từ trang web và nối với nội dung body.
    Tham số:
    - url: Địa chỉ URL của trang web cần lấy thông tin.
    - timeout: Thời gian chờ tối đa cho yêu cầu (mặc định là 12 giây).
    Trả về:
    - Tuple[bool, str]: 
        - Phần tử đầu tiên (bool) cho biết thành công (True) hay thất bại (False).
        - Phần tử thứ hai (str) chứa nội dung của thẻ meta description/keywords và 500 ký tự giữa của phần body (nếu tìm thấy), hoặc chuỗi rỗng nếu không tìm thấy.
    '''
    try:
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        # Thêm headers để mô phỏng trình duyệt
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # Gửi yêu cầu GET đến URL với headers
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()  # Raise an exception for bad status codes

        # Lấy nội dung HTML của trang web
        html_content = response.text
        soup = BeautifulSoup(html_content, 'html.parser')

        # Danh sách các metadata cần kiểm tra
        metadata_tags = [
            ('meta', {'id': 'metaDes', 'name': 'description'}),
            ('meta', {'name': 'description'}),
            ('meta', {'property': 'og:description'}),
            ('meta', {'name': 'twitter:description'})
        ]

        for tag, attrs in metadata_tags:
            meta_tag = soup.find(tag, attrs=attrs)
            if meta_tag and 'content' in meta_tag.attrs:
                content = meta_tag.attrs['content'].strip()
                if len(content) >= 10:
                    return (True, content)

        # # Lấy nội dung body
        # body_text = soup.get_text()
        # body_content = body_text[len(body_text)//2-250:len(body_text)//2+250]
        # # Nối meta content và body content
        # result = f"{body_content}"
        return (False, "")

    except Exception as e:
        # traceback.print_exc()
        return (False, "*Website Không hoạt động")
