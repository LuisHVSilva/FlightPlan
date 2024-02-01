import fitz
import BrasilInformation from "../"

file = './data/rotaer_completo.pdf'
new_json_file = './data/rotaer_completo.json'


# Abre o arquivo PDF em modo de leitura binária
with fitz.open(file) as pdf_document:
    number_of_pages = pdf_document.page_count
    airport_information = []

    for i in range(number_of_pages):
        pagina = pdf_document[i - 1]
        text = pagina.get_text()
        text_list = text.split("D-AMDT")

        airport_information.append(extract_information(text_list))

    airport_information_dictionary = create_dictionary(airport_information)
    criar_arquivo_json(airport_information_dictionary, new_json_file)
