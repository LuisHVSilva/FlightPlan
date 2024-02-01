import tabula
import fitz


def internal_attr_via(array):
    atributos = ["first_coordinate", "second_coordinate", "track_mag", "rev_track_mag",
                 "length", "upper_limit", "lower_limit", "mea", "airspace_class"]
    internal_object = {}
    array_size = len(array)

    for i, atributo in enumerate(atributos):
        if i < array_size and array[i] is not None and array[i] != "":
            internal_object[atributo] = array[i]

    return internal_object


class BrasilAirac(object):
    def __init__(self, file):
        self.file = file

    def airport_class(self, pages):
        df = tabula.read_pdf(self.file, pages=str(pages), multiple_tables=True)
        classification = "CLASS A"
        new_object = {}

        for table in df[:-1]:
            last_column = table.columns[-1]
            new_table = table.drop(last_column, axis=1)

            for linha in new_table.itertuples(index=False):
                if isinstance(linha[0], str) and "CLASSE" in linha[0]:
                    classification = linha[0][-7:]

                if isinstance(linha[1], str) and len(linha[1]) == 4:
                    new_object[linha[1]] = classification

        return new_object

    def extract_atc_routes(self, first_page, last_page):
        with fitz.open(self.file) as pdf_document:
            info = {}
            icao_via = []

            new_object = {}
            actual_via = None

            for k in range(first_page - 1, last_page):
                pagina = pdf_document[k]
                text = pagina.get_text()
                array = text.split("\n")
                via = next((i.split(" ")[2].strip() for i in array if "ENR" in i), None)

                if via != actual_via:
                    actual_via = via
                    new_object[via] = []

                # Remover elementos vazios
                array_without_black_spaces = [palavra.strip() for palavra in array if palavra.strip()]
                array_first_index_separate = array_without_black_spaces.index("Even")
                array_second_index_separate = array_without_black_spaces[array_first_index_separate:].index("6")
                array_info = array_without_black_spaces[array_first_index_separate + array_second_index_separate + 2:]

                for i in array_info:
                    if "▲" in i:
                        icao_via_breakpoint = i.split("▲")[1].strip()
                        icao_via.append(icao_via_breakpoint)
                        new_object[via].append(icao_via_breakpoint)
                    else:
                        new_object[via].append(i)

            for j in new_object:
                info[j] = []
                valores_encontrados = [valor for valor in new_object[j] if valor in icao_via]
                index = 0
                for i in range(len(valores_encontrados) - 1):
                    start = new_object[j].index(valores_encontrados[i])
                    end = new_object[j].index(valores_encontrados[i + 1])
                    internal_array = new_object[j][start:end]
                    if "/" in internal_array[1]:
                        valores_encontrados[i] = f"{internal_array[0]} {internal_array[1]}"
                        internal_array.pop(0)

                    internal_array.pop(0)
                    internal_object = internal_attr_via(internal_array)

                    info[j].append({valores_encontrados[i]: internal_object})

                    index += 1

                last_value_index = new_object[j].index(valores_encontrados[index])
                last_value_key = new_object[j][last_value_index:][0]
                internal_array = new_object[j][last_value_index:]
                internal_array.pop(0)

                internal_object = internal_attr_via(internal_array)
                info[j].append({last_value_key: internal_object})

            return info
