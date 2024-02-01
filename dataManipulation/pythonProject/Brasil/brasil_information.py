import fitz


class BrasilInformation(object):
    def __init__(self, file):
        self.file = file
        self._initial_information_attr = None
        self._text_list_attr = None

    @property
    def initial_information(self):
        return self._initial_information_attr

    @property
    def text_list(self):
        return self._text_list_attr

    @initial_information.setter
    def initial_information(self, value):
        self._initial_information_attr = value

    @text_list.setter
    def text_list(self, value):
        self._text_list_attr = value

    def __rotaer_page_information(self):
        new_list = []
        information = []

        for tl in self.text_list:
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

    def extract_information_rotaer(self):
        with fitz.open(self.file) as pdf_document:
            number_of_pages = pdf_document.page_count
            airport_information = []

            for i in range(number_of_pages):
                pagina = pdf_document[i - 1]
                text = pagina.get_text()
                self.text_list(text.split("D-AMDT"))

                airport_information.append(self.__rotaer_page_information())

            return airport_information
