import unicodedata


def normalize_text(text):
    # Normalize Unicode characters and remove control characters
    return ''.join(ch for ch in unicodedata.normalize('NFKD', text) if unicodedata.category(ch)[0] != 'C')
