import fitz
import tabula


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
                internal_object[attribute] = self.__internal_array_via_attr[i]

        return internal_object

    def extract_airport_class(self, first_page, last_page):
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
                if isinstance(line[0], str) and "CLASSE" in line[0]:
                    classification = line[0][-7:]

                if isinstance(line[1], str) and len(line[1]) == 4:
                    new_object[line[1]] = classification

        return new_object

    def extract_airway_routes(self, airway_type, first_page, last_page, number_columns):
        with fitz.open(self.file) as pdf_document:
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

                for i in array_info:
                    if self.__constant_airway_breakpoint_note in i:
                        airway_tag_name.append(i)

                    new_object[airway].append(i)

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
                    if column == "Designador Nome-código":
                        if len(value) != 5:
                            break

                        icao = value

                    if column == "Coordenadas":
                        latitude = value.split(" ")[0]
                        longitude = value.split(" ")[-1]

                    if column == "Rota ATS ou outra rota":
                        routes = value

                    if column == "RMK" and value:
                        rmk = value

                        if isinstance(value, float):
                            rmk = "----"

                if icao:
                    new_object[icao] = {"latitude": latitude,
                                        "longitude": longitude,
                                        "routes": routes,
                                        "RMK": rmk}

        return new_object
