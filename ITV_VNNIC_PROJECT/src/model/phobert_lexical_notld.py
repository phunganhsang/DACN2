
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoConfig, AutoTokenizer
from transformers.modeling_outputs import SequenceClassifierOutput
from transformers.models.roberta.modeling_roberta import RobertaModel
from transformers.models.roberta.modeling_roberta import RobertaPreTrainedModel
import torch

from utils import get_config


class PhoBertLexicalNoTLD(RobertaPreTrainedModel):
    def __init__(self, config):
        super().__init__(config)

        self.config = config
        self.config.id2label = {
            0: "Bình thường",
            1: "Tính nhiệm thấp",
        }
        self.config.label2id = {
            "Bình thường": 0,
            "Tính nhiệm thấp": 1,
        }
        self.config.num_classes = 2
        self.roberta = RobertaModel(config, add_pooling_layer=False)
        self.fc1 = nn.Linear(10, 256)
        self.fc2 = nn.Linear(256, 768)  # (batchsize , 1 , 768)
        self.dropout_nn = nn.Dropout(0.1)
        self.dropout_lm = nn.Dropout(0.1)
        self.out = nn.Linear(1536, 2)
        # init weight
        self.init_weights()

    def forward(self, features, input_ids, attention_mask, token_type_ids=None, labels=None):
        # output lexical
        x_nn = F.relu(self.fc1(features))
        x_nn = F.relu(self.fc2(x_nn))

        # output llm
        x_roberta = self.roberta(
            input_ids=input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids
        ).last_hidden_state[:, 0, :]

        # drop out trước khi concat
        x_nn = self.dropout_nn(x_nn)
        x_roberta = self.dropout_lm(x_roberta)

        logits = self.out(torch.cat((x_nn, x_roberta), dim=1))

        # tính loss cái này chỉ để hiện kq loss tập valid
        loss = None
        if labels is not None:
            if labels.dtype != torch.long:
                labels = labels.long()
            loss_fct = nn.CrossEntropyLoss()
            loss = loss_fct(
                logits.view(-1, self.config.num_classes), labels.view(-1))
        # hàm trainer cần cái này nó mới chịu train
        return SequenceClassifierOutput(loss=loss, logits=logits)


# vinai/phobert-base-v2
config = get_config()
model_checkpoint = config['model_checkpoint']['phobert_lexical_notld']
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

phobert_lexical_notld_config = AutoConfig.from_pretrained(model_checkpoint)

model_phobert_lexical_notld = PhoBertLexicalNoTLD.from_pretrained(
    model_checkpoint,
    config=phobert_lexical_notld_config
).to(device)

phobert_lexical_notld_tokenizer = AutoTokenizer.from_pretrained(
    model_checkpoint
)
