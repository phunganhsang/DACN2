# Load model directly
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from utils import get_config
import torch


config = get_config()
model_checkpoint = config['model_checkpoint']['phobert_meta_cls']
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

tokenizer = AutoTokenizer.from_pretrained(model_checkpoint)
model_phobert_meta_cls = AutoModelForSequenceClassification.from_pretrained(
    model_checkpoint).to(device)
