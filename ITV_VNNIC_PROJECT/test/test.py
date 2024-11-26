# Use a pipeline as a high-level helper
from transformers import pipeline

pipe = pipeline("text-classification", model="linkmodel")


print(pipe(" 9 Tháng Tám, 2024 Phố Wall chưa bình yên sau tuần biến động 9 Tháng Tám, 2024 Tâm Điểm Tài Chính Ngân hàng nào đang trả lãi suất tiết kiệm trên 8%/năm? 7 Tháng Tám, 2024 Khách hàng FE CREDIT hào hứng khi trúng xe máy, nhận hoàn tiền 6 Tháng Tám, 2024 Sau gần nửa năm 'nằm im', một ngân hàng vừa tăng mạnh lãi suất tiết kiệm từ hôm nay (7/8) 7 Tháng Tám, 2024 SCB vừa tiếp tục đóng cửa nhiều phòng giao dịch tại Quảng Ninh,"))