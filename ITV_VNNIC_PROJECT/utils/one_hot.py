import numpy as np


def one_hot_encode(string):
    if string == 0:
        string = 'Báo chí, tin tức'
    elif string == 1:
        string = 'Nội dung khiêu dâm'
    elif string == 2:
        string = 'Cờ bạc, cá độ, vay tín dụng'
    elif string == 3:
        string = 'Tổ chức'
    elif string == 4:
        string = 'Chưa xác định'
    categories = ['Báo chí, tin tức', 'Nội dung khiêu dâm',
                  'Cờ bạc, cá độ, vay tín dụng', 'Tổ chức', 'Chưa xác định']

    # Initialize an array of zeros with length equal to the number of categories
    encoded = np.zeros(len(categories), dtype=int)

    # Check if the string matches any category
    if string in categories:
        # Find the index of the matched category
        index = categories.index(string)
        # Set the corresponding element to 1
        encoded[index] = 1
    return encoded
