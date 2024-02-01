import fitz


class BrasilROTAER(object):
    def __init__(self, file):
        self.file = file
        self.__initial_information_attr = None
        self.__text_list_attr = []
        self.array_attr = None

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
            tl.pop(0)
            new_list.append(tl)

        new_list.pop(0)

        for n_l in new_list:
            temporary_string = ""
            for l in range(len(n_l)):
                if l - 1 == 0:
                    temporary_string = n_l[0]

                if l - 1 == 1 and ("(" in n_l[1] and ")" in n_l[1]):
                    temporary_string += f" {n_l[1]}"

                if l - 1 == 1 and "(" in n_l[0] and n_l[2][-1] == "W":
                    temporary_string += f" {n_l[1]}"

            information.append(temporary_string)

        return information

    def create_dictionary(self):
        dictionary = {}
        for a in self.array:
            for airport in a:
                # Tirar o cabeçalho
                if "ROTAER" not in airport:
                    state = airport.split(",")[1][0:3].strip()

                    # Adicionar o estado nas chaves do dicionário se ele não existir
                    if state not in dictionary:
                        dictionary[state] = []

                    new_array = airport.split(",")[0].split(") /")

                    object_array = {new_array[0].split("(")[1].strip(): {
                        "airport_name": new_array[0].split("(")[0].strip(),
                        "city": new_array[1].strip()}
                    }

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

                airport_information.append(self.__rotaer_page_information())

            return airport_information
