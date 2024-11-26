def normalize_domain(domain: str) -> str:
    '''
    Chuẩn hóa tên miền bằng cách loại bỏ giao thức và thay thế dấu chấm bằng khoảng trắng.
    => mục đích đưa vào model
    Tham số:
        domain (str): Tên miền cần được chuẩn hóa.
    Trả về:
        str: Tên miền đã được chuẩn hóa.
    '''
    domain = str(domain)
    if domain.startswith("http://"):
        domain = domain[7:]
        domain = domain.replace("www.", "")
    if domain.startswith("https://"):
        domain = domain[8:]
        domain = domain.replace("www.", "")
    domain = domain.replace(".", " ")
    return domain
def normalize_domain_for_lexical(domain: str):
    '''
    Chuẩn hóa tên miền cho class lexical
    Tham số:
        domain (str): Tên miền cần được chuẩn hóa.
    Trả về:
        str: Tên miền đã được chuẩn hóa.
    '''
    domain = str(domain)
    if domain.startswith("http://"):
        domain = domain[7:]
        domain = domain.replace("www.", "")
    if domain.startswith("https://"):
        domain = domain[8:]
        domain = domain.replace("www.", "")
    if domain.startswith("www."):
        domain = domain.replace("www.", "")
    if "/" in domain:
        domain = domain.split("/")[0]
    return domain


def split_tld_vn(domain):
    '''
    Loại bỏ các tên miền cấp cao nhất (TLD) phổ biến của Việt Nam khỏi tên miền.
    Tham số:
        domain (str): Tên miền cần được xử lý.
    Trả về:
        str: Tên miền sau khi đã loại bỏ các TLD.
    '''
    tlds = ["edu vn", "com vn", "net vn", "org vn", "gov vn", "vn"]
    for tld in tlds:
        domain = domain.replace(tld, "")
    return domain
