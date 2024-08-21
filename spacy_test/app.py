import spacy
from spacy.matcher import Matcher  

from flask import Flask
from flask import request
from flask_cors import CORS

from datetime import datetime

app = Flask(__name__)
CORS(app)

#nlp = spacy.load("es_core_news_sm")
nlp = spacy.load("es_dep_news_trf")
# First person verb matcher
matcher = Matcher(nlp.vocab)
pattern = [{"POS": "VERB", "MORPH": {"IS_SUPERSET": ["Person=1"]}}]
matcher.add("first_person", [pattern])

@app.post("/")
def hello_world():
    sentences = []
    tokens = request.get_json().get('tokens')
    for token in tokens:
        sentences.extend(check_text(token))
    return sentences


def check_text(text):
    doc = nlp(text)
    matches = matcher(doc, as_spans=True)

    sentences = []
    for span in matches:
        sentences.append(span.sent.text)
        print(span.sent.text, span.text, span.label_)
    return sentences
