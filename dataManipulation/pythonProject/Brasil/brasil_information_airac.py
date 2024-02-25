import fitz
import tabula
from Utils.UnitConverterUtils import Converter


def is_latitude(element):
    # Verifica se o elemento tem pelo menos 6 caracteres (5 para os números e 1 para o hemisfério)
    if len(element) < 6:
        return False

    # Verifica se os primeiros 6 caracteres são dígitos
    if not element[:6].isdigit():
        return False

    # Verifica se o último caractere é "S" ou "N"
    if element[-1] not in ['S', 'N']:
        return False

    # Se todas as condições acima forem satisfeitas, então é uma latitude válida
    return True


def split_array(array):
    # Determinar o tamanho do array novo
    # Inicializar uma lista para armazenar os índices onde os elementos "▲" são encontrados
    new_array = []
    new_array_size = len(new_array) - 1
    index = []
    i = 0

    # Iterar sobre os elementos do array
    for element in range(len(array)):
        # Verificar se o elemento atual contém "▲"
        if "▲" in array[element]:
            # Se sim, adicionar o índice à lista index
            index.append(i)

        # Incrementar o contador
        i += 1

    # Verificar se o primeiro índice é 0 (significa que os "fixos" começam no início do array)
    if index[0] == 0:
        if len(index) > 1:
            # Se sim, adicionar os elementos do array até o segundo índice ao array novo
            new_array.append(array[:index[1]])
        else:
            new_array.append(array)
    else:
        # Se não, adicionar os elementos do array até o primeiro índice ao último subarray do array novo
        new_array.append(array[:index[0]])

    # Remover o primeiro elemento da lista de índices
    # Determinar o tamanho da lista de índices
    index_size = len(index)
    # Se houver mais de um índice
    if index_size > 0:
        i = 0
        # Iterar sobre os índices, exceto o último
        while i < index_size - 1:
            # Adicionar os elementos entre cada par de índices consecutivos ao array novo
            new_array.append(array[index[i]: index[i + 1]])
            i += 1

        # Adicionar os elementos após o último índice ao array novo
        new_array.append(array[index[index_size - 1]:])

    # Retornar o array novo
    return new_array


class BrasilAirac(object):
    def __init__(self, file):
        self.file = file

        # CONSTANTS
        self.__constants_atc_table_head = ["latitude", "longitude", "track_mag", "rev_track_mag",
                                           "length", "upper_limit", "lower_limit", "MEA", "airspace_class",
                                           "direction_of_cruising_levels_odd", "rnp_type", "RMK"]

        self.__constants_rnav_table_head = ["latitude", "longitude", "track_mag", "rev_track_mag",
                                            "length", "upper_limit", "lower_limit", "airspace_class",
                                            "direction_of_cruising_levels_odd", "rnp_type", "RMK"]
        self.__constant_header_separate = "ENR"
        self.__constant_table_header_separate = "Even"
        self.__constant_airway_breakpoint_note = "▲"
        self.__internal_array_via_attr = []

    @property
    def __internal_array_via(self):
        return self.__internal_array_via_attr

    @__internal_array_via.setter
    def __internal_array_via(self, value):
        self.__internal_array_via_attr.clear()
        self.__internal_array_via_attr = value

    def __internal_attr_via(self, attributes):
        internal_object = {}
        array_size = len(self.__internal_array_via_attr)

        if 'Classe/' in self.__internal_array_via_attr:
            class_index = self.__internal_array_via_attr.index("Classe/")
            if "Class" in self.__internal_array_via_attr[class_index + 1]:
                self.__internal_array_via_attr[
                    class_index] = (f"{self.__internal_array_via_attr[class_index]}"
                                    f"{self.__internal_array_via_attr[class_index + 1]}")
                self.__internal_array_via_attr.pop(class_index + 1)
                array_size -= 1

        for i, attribute in enumerate(attributes):
            if (i < array_size
                    and self.__internal_array_via_attr[i] is not None
                    and self.__internal_array_via_attr[i] != ""):

                if attribute == "latitude":
                    self.__internal_array_via_attr[i] = (Converter(latitude=self.__internal_array_via_attr[i])
                                                         .coordinates_dms_to_dd())

                if attribute == "longitude":
                    self.__internal_array_via_attr[i] = (Converter(longitude=self.__internal_array_via_attr[i])
                                                         .coordinates_dms_to_dd())

                internal_object[attribute] = self.__internal_array_via_attr[i]

        return internal_object

    def extract_airport_class(self, first_page, last_page, airport_object=None):
        pages = str(first_page)

        if last_page:
            pages = f"{first_page}-{last_page}"

        df = tabula.read_pdf(self.file, pages=str(pages), multiple_tables=True)
        classification = "CLASS A"
        new_object = {}

        # df[:-1] -> Removing the last table on the page that is not important
        for table in df[:-1]:
            last_column = table.columns[-1]
            new_table = table.drop(last_column, axis=1)

            for line in new_table.itertuples(index=False):
                classification_line = line[0]
                if isinstance(classification_line, str) and "CLASSE" in classification_line:
                    classification = line[0][-7:]

                icao = line[1]
                if isinstance(icao, str) and len(icao) == 4:
                    if airport_object and icao in airport_object:
                        airport_object[icao]["classification"] = classification
                    else:
                        new_object[icao] = classification

        if airport_object:
            a = airport_object["SBTG"]
            return airport_object

        return new_object

    def extract_airway_routes(self, airway_type, first_page, last_page, number_columns):
        with (fitz.open(self.file) as pdf_document):
            first_page -= 1

            if airway_type == "rnav":
                objects_via_key = self.__constants_rnav_table_head

            if airway_type == "atc":
                objects_via_key = self.__constants_atc_table_head

            info = {}
            airway_tag_name = []

            new_object = {}
            actual_waypoint = None

            for k in range(first_page, last_page):
                pagina = pdf_document[k]
                text = pagina.get_text()
                array = text.split("\n")

                # Get the waypoint based on pdf header.
                airway = next((i.split(" ")[2].strip() for i in array if self.__constant_header_separate in i),
                              None).strip()

                if airway != actual_waypoint:
                    actual_waypoint = airway
                    new_object[airway] = []

                array_without_black_spaces = [word.strip() for word in array if word.strip()]

                # Pega o índice dentro do array baseado na ultima palavra do cabeçalho da tabela do pdf
                array_first_index_separate = array_without_black_spaces.index(self.__constant_table_header_separate)

                # Pega o índice da numeração das colunas que aparece na tabela do pdf
                array_second_index_separate = array_without_black_spaces[array_first_index_separate:].index(
                    str(number_columns)) + 1

                # Array sem informações de cabeçalho
                array_info = array_without_black_spaces[array_first_index_separate + array_second_index_separate:]

                # Tira o nome da via se existir na lista
                if array_info[0].strip() == airway:
                    array_info.pop(0)

                aid_array = split_array(array_info)

                # Loop que percorre cada elemento do array de airways (aid_array)
                for aid in aid_array:
                    i = 0  # Inicializa o índice de controle para manter o rastreamento de onde estamos no array
                    # Verifica se o prefixo de quebra de linha constante está presente no primeiro elemento do
                    # array atual
                    if self.__constant_airway_breakpoint_note in aid[0]:
                        aid_name = ""  # Inicializa uma string vazia para armazenar o nome do aid
                        # Loop que percorre os elementos do aid atual
                        for a in aid:
                            # Verifica se o elemento atual é uma latitude e, se for, encerra o loop
                            if is_latitude(a):
                                break
                            # Concatena o elemento atual à variável aid_name
                            aid_name += " " + a
                            i += 1  # Incrementa o índice para avançar para o próximo elemento

                        # Adiciona o nome completo do aid (aid_name) à lista airway_tag_name e ao novo objeto
                        aid_name = aid_name.lstrip()  # Remova espaços extras do início
                        airway_tag_name.append(aid_name)
                        new_object[airway].append(aid_name)

                    # Loop que percorre os elementos restantes do aid atual e os adiciona ao novo objeto
                    for value in aid[i:]:
                        new_object[airway].append(value)

            for obj in new_object:
                info[obj] = []
                valores_encontrados = []

                for valor in new_object[obj]:
                    if valor in airway_tag_name and valor not in valores_encontrados:
                        valores_encontrados.append(valor)

                index = 0

                for i in range(len(valores_encontrados) - 1):
                    start = new_object[obj].index(valores_encontrados[i])
                    end = new_object[obj].index(valores_encontrados[i + 1])
                    self.__internal_array_via_attr = new_object[obj][start:end]

                    if len(self.__internal_array_via_attr) > 0:
                        if "/" in self.__internal_array_via_attr[1]:
                            valores_encontrados[
                                i] = f"{self.__internal_array_via_attr[0]} {self.__internal_array_via_attr[1]}"
                            self.__internal_array_via_attr.pop(0)

                        self.__internal_array_via_attr.pop(0)

                    internal_object = self.__internal_attr_via(objects_via_key)
                    info[obj].append({valores_encontrados[i]: internal_object})

                    index += 1

                last_value_index = new_object[obj].index(valores_encontrados[index])
                last_value_key = new_object[obj][last_value_index:][0]
                self.__internal_array_via_attr = new_object[obj][last_value_index:]
                self.__internal_array_via_attr.pop(0)

                internal_object = self.__internal_attr_via(objects_via_key)
                info[obj].append({last_value_key: internal_object})

        return info

    def extract_names_assigned_to_significant_points(self, first_page, last_page):
        pages = str(first_page)
        if last_page:
            pages = f"{first_page}-{last_page}"

        tables = tabula.read_pdf(self.file, pages=str(pages), multiple_tables=True)
        new_object = {}
        # Iterar sobre as tabelas extraídas
        for df in tables:
            # Iterate over the extracted tables
            for index, row in df.iterrows():
                # Iterates over the columns of the DataFrame
                icao = ""
                latitude = ""
                longitude = ""
                routes = ""
                rmk = "-----"

                for column, value in row.items():
                    if isinstance(value, float):
                        value = "----"

                    if column == "Designador Nome-código":
                        if len(value) != 5:
                            break

                        icao = value

                    if column == "Coordenadas":
                        latitude = Converter(latitude=value.split(" ")[0]).coordinates_dms_to_dd()
                        longitude = Converter(longitude=value.split(" ")[-1]).coordinates_dms_to_dd()

                    if column == "Rota ATS ou outra rota":
                        routes = value

                    if column == "RMK" and value:
                        rmk = value

                if icao:
                    new_object[icao] = {"latitude": latitude,
                                        "longitude": longitude,
                                        "routes": routes,
                                        "RMK": rmk}

        return new_object
