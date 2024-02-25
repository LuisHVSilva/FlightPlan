import json


class JsonUtils(object):
    def __init__(self, file, dictionary=None):
        self.file = file
        self.dictionary = dictionary

    def __can_be_json(self):
        try:
            json.dumps(self.dictionary)
            return True
        except (TypeError, ValueError):
            return False

    def create_json_file(self):
        if self.__can_be_json():
            with open(self.file, 'w', encoding="utf-8") as json_file:
                json.dump(self.dictionary, json_file, ensure_ascii=False, indent=2)
            print(f"Arquivo JSON '{self.file}' criado com sucesso.")
        else:
            print("O dicionário não pode ser transformado em JSON.")

    def read_json_file(self):
        with open(self.file, encoding="utf-8") as file:
            return json.load(file)
