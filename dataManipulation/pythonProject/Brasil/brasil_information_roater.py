import fitz
from Utils.UnitConverterUtils import Converter


class BrasilROTAER(object):
    def __init__(self, file):
        self.file = file
        self.__initial_information_attr = None
        self.__text_list_attr = []
        self.array_attr = None
        self.brazilian_states = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
                                 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

    @property
    def __initial_information(self):
        return self.__initial_information_attr

    @property
    def __text_list(self):
        return self.__text_list_attr

    @property
    def array(self):
        return self.array_attr

    @__initial_information.setter
    def __initial_information(self, value):
        self.__initial_information_attr.append(value)

    @__text_list.setter
    def __text_list(self, value):
        self.__text_list_attr.clear()
        self.__text_list_attr = value

    @array.setter
    def array(self, value):
        self.array_attr = value

    def __rotaer_page_information(self):
        new_list = []
        information = []

        for tl in self.__text_list:
            tl = tl.split("\n")

            if len(tl[0]) <= 10 or (len(tl[0]) > 74 and (not all(char in tl[0] for char in ['(', ')', '/']) or any(
                    char in tl[0] for char in ['[', ']', '@', '.com.br']))):
                tl.pop(0)

            new_list.append(tl)

        if not new_list[0]:
            new_list.pop(0)

        for n_l in new_list:
            temporary_string = ""
            for l in range(len(n_l)):
                if l - 1 == 0:
                    temporary_string = f" {n_l[0]} {n_l[1]} "

                if (l - 1 == 1 and ("(" in n_l[1] and ")" in n_l[1])
                        or l - 1 == 1 and "(" in n_l[0] and n_l[2][-1] == "W"):
                    temporary_string += f"{n_l[2]} "

            information.append(temporary_string)

        return information

    def create_dictionary(self):
        dictionary = {}

        for a in self.array:
            for airport in a:
                # Para separar os dados de aeroport é necessário ter '(', ')', '/' e ','
                if all(char in airport for char in ['(', ')', '/', ',']):

                    # Pegar o nome do estado que está presente nas posições 0 e 2
                    state = airport.split(",")[1][0:3].strip()

                    # Só pode continuar se for um estado válido do Brasil
                    if state in self.brazilian_states:

                        # Verifica se o estado está ou não presente no dicionário
                        if state not in dictionary:
                            dictionary[state] = []

                        # Divisão do array "airport"
                        new_array = airport.split(",")[0].split(") /")

                        # A divisão deve conter pelo menos um tamanho de dois
                        if len(new_array[0].split("(")) >= 2:
                            airport_icao = new_array[0].split("(")[1].strip()

                            if len(airport_icao) == 4:
                                airport_name = new_array[0].split("(")[0].strip()
                                airport_city = new_array[1].strip()

                                coordinate_index = airport.replace(" ", "").index(",")
                                coordinates = airport.replace(" ", "")[coordinate_index + 3:]

                                # Getting the index of West mark in coordinate
                                west_index = coordinates.index("W")

                                # Getting the part of array that correspond to coordinates
                                coordinates = coordinates[:west_index + 1]
                                airport_latitude = Converter(latitude=coordinates.split("/")[0]).coordinates_dms_to_dd()
                                airport_longitude = Converter(
                                    longitude=coordinates.split("/")[1]).coordinates_dms_to_dd()

                                object_array = {airport_icao: {
                                    "airport_name": airport_name,
                                    "city": airport_city,
                                    "latitude": airport_latitude,
                                    "longitude": airport_longitude
                                }
                                }

                                # Adicionar o objeto criado dentro do objeto dicionario
                                dictionary[state].append(object_array)

        return dictionary

    def extract_information_rotaer(self):
        with fitz.open(self.file) as pdf_document:
            number_of_pages = pdf_document.page_count

            airport_information = []

            for i in range(number_of_pages):
                pagina = pdf_document[i - 1]
                text = pagina.get_text()
                self.__text_list = text.split("D-AMDT")

                data = self.__rotaer_page_information()
                if not len(data[0]):
                    data.pop(0)

                airport_information.append(data)

        return airport_information
