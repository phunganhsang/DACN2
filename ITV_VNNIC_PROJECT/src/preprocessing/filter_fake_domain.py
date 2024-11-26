import pandas as pd
from utils.levenshtein_distance import get_levenshtein_distance
from utils import get_config
import re
config = get_config()

LEGIT = 0
PHISHING = 1
TOMODEL = 2


def is_phishing_url(original_url):
    # list uy tin
    file_path = config['dict_path']['dict_legit_domain']
    df = pd. read_csv(file_path)
    domains_in_file = df.iloc[:, 0].tolist()
    # list bao chi cap phep
    file_path_news = config['dict_path']['dict_news_legit']
    df = pd. read_csv(file_path_news)
    cols = df.iloc[:, 1].tolist()
    for row in cols:
        split_row = [element.strip()
                     for element in re.split(r'[,\s]+', str(row)) if element]
        for sublist in split_row:
            sublist = sublist.strip()
            if str(sublist).startswith('www') or str().startswith('http') or str(sublist).endswith('.vn'):
                domains_in_file.append(sublist)
    legit_domains = sorted([str(d) for d in domains_in_file], key=len)
    # print("urlcheck:", original_url)

    # defind return
    status = -1
    domain_return = ""
    list_uy_tin = list()
    # Extract domain names and TLDs
    original_domain, original_tld = original_url.split('.', 1)
    # print(original_domain)
    if len(original_domain) <= 5:
        threshold = 1
    else:
        threshold = len(original_domain)/5
    for legit_url in legit_domains:
        new_domain, new_tld = legit_url.split('.', 1)
        if abs(len(new_domain) - len(original_domain)) > int(threshold):
            continue
        # Calculate Levenshtein distance between domain names
        distance = get_levenshtein_distance(new_domain, original_domain)
        if distance <= int(threshold):
            if distance == 0:
                if original_tld == new_tld:
                    return LEGIT, legit_url
                else:
                    status = PHISHING
                    list_uy_tin.append(legit_url)
                    domain_return = legit_url
            else:
                status = PHISHING
                list_uy_tin.append(legit_url)
                domain_return = legit_url
        if status == -1:
            status = TOMODEL
            domain_return = original_domain
    return status, list_uy_tin
