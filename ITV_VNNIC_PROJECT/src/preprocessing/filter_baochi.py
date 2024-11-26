import pandas as pd
import re
from utils import get_config
config = get_config()

LICENSED= True
TOMODEL = False
def is_licensed(domain):
    file_path = config['dict_path']['dict_news_legit']
    df = pd. read_csv(file_path)
    cols = df.iloc[:, 1].tolist()
    domains_in_file = []
    for row in cols:
        split_row = [element.strip()
                    for element in re.split(r'[,\s]+', str(row)) if element]
        for sublist in split_row:
            if str(sublist).startswith('www') or str().startswith('http') or str(sublist).endswith('.vn'):
                domains_in_file.append(sublist)
    # read the domain in file legit
    licensed_news_domains = sorted(domains_in_file, key=len)
    for licensed_news_domain in licensed_news_domains:
        if len(licensed_news_domain) != len(domain) :
            if len(licensed_news_domain) > len(domain):
                return TOMODEL,domain
            else:
                continue
        else:
            if licensed_news_domain == domain:
                return LICENSED, domain
    return TOMODEL, domain
