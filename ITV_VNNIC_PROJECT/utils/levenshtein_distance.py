def get_levenshtein_distance(str1: str, str2: str) -> int:
    """Calculate the Levenshtein distance between two strings."""
    str1, str2 = str1.lower(), str2.lower()
    m, n = len(str1), len(str2)

    prev_row = list(range(n + 1))
    curr_row = [0] * (n + 1)

    for i in range(1, m + 1):
        curr_row[0] = i
        for j in range(1, n + 1):
            curr_row[j] = prev_row[j - 1] if str1[i - 1] == str2[j -
                                                                 1] else 1 + min(curr_row[j - 1], prev_row[j], prev_row[j - 1])
        prev_row = curr_row.copy()
    return curr_row[n]
