# Use a pipeline as a high-level helper
from transformers import pipeline
from pyvi import ViTokenizer, ViPosTagger
import torch
import torch.nn.functional as F
import numpy as np

from utils import (
    get_config,
    normalize_domain,
    normalize_domain_for_lexical,
    split_tld_vn,
    get_metadata,
    one_hot_encode
)

from .phobert_lexical_notld import model_phobert_lexical_notld, phobert_lexical_notld_tokenizer
from .phobert_meta_lexical import model_phobert_lexical_meta, phobert_lexical_meta_tokenizer
from src.feature_domain import lexical

config = get_config()
pipe = pipeline(
    "text-classification",
    model=config['model_checkpoint']['phobert_meta_cls']
)


class MetaDataCLSInfer:
    def __init__(self):
        self._pipeline = pipe
        self._label_map = {
            'LABEL_0': 0,
            'LABEL_1': 1,
            'LABEL_2': 2,
            'LABEL_3': 3,
            'LABEL_4': 4
        }

    def infer(self, text):
        """
        Dự đoán nhãn cho đoạn văn bản đầu vào.
        text: Một đoạn văn bản (str)
        return: 0 -> 4
        """
        max_sequent_length = config['max_sequent_length']
        if len(text) > max_sequent_length:
            text = text[:max_sequent_length]

        result = self._pipeline(ViTokenizer.tokenize(text))
        
        label = result[0]['label']
        if label in self._label_map:
            return self._label_map[label]
        else:
            raise ValueError(f"Unexpected label: {label}")


class DomainInference:
    def __init__(self):
        self.device = torch.device(
            'cuda' if torch.cuda.is_available() else 'cpu'
        )
        self.lexical_model = model_phobert_lexical_notld.to(self.device)
        self.lexical_tokenizer = phobert_lexical_notld_tokenizer
        self.lexical_meta_model = model_phobert_lexical_meta.to(self.device)
        self.lexical_meta_tokenizer = phobert_lexical_meta_tokenizer
        

    def predict_with_metadata(self, normalized_domain, metadata, features):
        # print(">>normalized_domain", normalized_domain)
        # print(">>metadata", metadata)
        # print(">>features", features)
        normalized_domain = normalized_domain.split()[0]
        domain_tokens = self.lexical_tokenizer(
            normalized_domain,#ViTokenizer.tokenize(metadata)
            padding=True,
            max_length=30,
            truncation=True,
            return_tensors="pt"
        )
        metadata_tokens = self.lexical_meta_tokenizer(
            ViTokenizer.tokenize(metadata),
            padding=True,
            max_length=200,
            truncation=True,
            return_tensors="pt"
        )
        predictions = self.lexical_meta_model(
            features=features.to(self.device),
            input_ids=domain_tokens['input_ids'].to(self.device),
            attention_mask=domain_tokens['attention_mask'].to(self.device),
            token_type_ids=domain_tokens['token_type_ids'].to(self.device),
            input_ids_meta=metadata_tokens['input_ids'].to(self.device),
            attention_mask_meta=metadata_tokens['attention_mask'].to(self.device),
            token_type_ids_meta=metadata_tokens['token_type_ids'].to(self.device),
        )
        probabilities = F.softmax(predictions.logits, dim=1) * 100
        predicted_label = torch.argmax(probabilities, dim=1).item()
        return predicted_label, probabilities.squeeze().tolist() #TODO chỉ trả về 0 - 1

    def predict_have_lexical(self, normalized_domain, features):
        normalized_domain = normalized_domain.split()[0]
        # print(">>normalized_domain", normalized_domain)
        # print(">>features", features)
        domain_tokens = self.lexical_tokenizer(
            normalized_domain,
            padding=True,
            max_length=30,
            truncation=True,
            return_tensors="pt"
        )
        predictions = self.lexical_model(
            features=features,
            input_ids=domain_tokens['input_ids'].to(self.device),
            attention_mask=domain_tokens['attention_mask'].to(self.device),
            token_type_ids=domain_tokens['token_type_ids'].to(self.device),
        )
        probabilities = F.softmax(predictions.logits, dim=1) * 100
        predicted_label = torch.argmax(probabilities, dim=1).item()
        return int(predicted_label), probabilities.squeeze().tolist() 




    def get_lexical(self, domain, has_metadata, metadata):
        domain_for_lexical = normalize_domain_for_lexical(domain)
        vector_lexical = lexical.get_vector_lexical(domain_for_lexical)
        try:
            vector_type_domain = []
            if domain.endswith('.gov.vn'):
                vector_type_domain = one_hot_encode(
                    'Tổ chức')
            elif has_metadata:
                metadata_infer = MetaDataCLSInfer()
                vector_type_domain = one_hot_encode(
                    metadata_infer.infer(text=metadata))
            else:
                type_domain, _ = lexical.LexicalURLFeature(
                    domain).get_type_url()
                type_mapping = {
                    "bao_chi": 'Báo chí, tin tức',
                    "khieu_dam": 'Nội dung khiêu dâm',
                    "co_bac": 'Cờ bạc, cá độ, vay tín dụng',
                    "chinh_tri": 'Tổ chức',
                    "Chưa xác định": 'Chưa xác định'
                }
                vector_type_domain = one_hot_encode(type_mapping.get(type_domain,'unknown'))

            vector_input = np.concatenate(
                (vector_lexical, vector_type_domain))

            features = torch.tensor(
                [vector_input], dtype=torch.float32).to(self.device)
            return features
        except Exception as error:
            print(f"Đã xảy ra lỗi: {error}")
            import traceback
            # traceback.print_exc()  # In traceback để biết chính xác vị trí lỗi

    def infer(self, domain, has_metadata, metadata):
        normalized_domain = normalize_domain(domain)

        features = self.get_lexical(
            domain=domain,
            has_metadata=has_metadata,
            metadata=metadata
        )
        if has_metadata:
            max_sequent_length = config['max_sequent_length']
            if len(metadata) >= max_sequent_length:
                metadata = metadata[:max_sequent_length]

            return self.predict_with_metadata(
                normalized_domain,
                metadata,
                features
            )
        else:
            return self.predict_have_lexical(
                normalized_domain,
                features
            )
