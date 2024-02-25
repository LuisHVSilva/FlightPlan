"""
Significado das siglas:
    1: POSSIBLES_FLIGHTS_RULES:
        - VFR: Visual Flight Rules
        - IFR: Instrument Flight Rules
        - HJ: Sunrise to sunset

    2: AIRPORT_PRIVACY_OPTIONS:
        - PRIV: Private
        - MIL: Military
        - PUB: Public
        - INTL: International
        - PUB/MIL: Public/Military
        - INTL/ALTN: International/Alternate

    3: AIRPORT_TYPE_OPTIONS
        - AD: Aerodrome
        - HP: Heliport
        - HD: Heliport Day
"""

import fitz
from Utils.UnitConverterUtils import Converter
import re


class BrasilROTAER(object):
    def __init__(self, file):
        self.file = file

        # Constantes
        # Options
        self.PDF_SPLIT = ["TEMP (0)", "TEMP (1)", "TEMP (2)"]
        self.BRAZILIAN_STATES = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
                                 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

        self.POSSIBLES_FLIGHT_RULES_OPTIONS = ["VFR", "IFR", "HJ"]
        self.AIRPORT_TYPE_OPTIONS = ["AD", "HP", "HD"]
        self.AIRPORT_PRIVACY_OPTIONS = ["PRIV", "MIL", "PUB", "INTL", "PUB/MIL", "INTL/ALTN"]

        # Texts
        self.HEADER_TEXT = "ROTAER COMPLETO - 01/02/2024 às 01:31:56 UTC A- Total de Páginas AE: 1481"
        self.D_AMDT = "D-AMDT"
        self.STATE = "state"
        self.TIME_ZONE = "UTC"
        self.NORTH = "N"
        self.SOUTH = "S"
        self.EAST = "E"
        self.WEST = "W"
        self.LEFT = "L"
        self.RIGHT = "R"
        self.HYPHEN = "-"
        self.DOT = ","
        self.NONE = None

        # Patterns
        self.TIME_ZONE_PATTERN = r'^UTC-[0-9]+$'
        self.TRACK_INFO_PATTERN = r"\s\((.*?)\)"
        self.FIELD_ELEVATION_PATTERN = r"\d+\s\(\d+\)"
        self.REGIONAL_ATC_PATTERN = re.compile(r'\b[A-Z]{4}\s+\(([^)]+)\)')

        # Object keys
        self.D_AMDT_KEY = "D-AMDT"
        self.CITY_KEY = "city"
        self.STATE_KEY = "state"
        self.AIRPORT_NAME_KEY = "airport_name"
        self.LATITUDE_KEY = "latitude"
        self.LONGITUDE_KEY = "longitude"
        self.AIRPORT_TYPE_KEY = "airport_type"
        self.AIRPORT_PRIVACY_KEY = "airport_privacy"
        self.TIME_ZONE_KEY = "time_zone"
        self.FLIGHT_RULES_KEY = "flight_rules"
        self.OWNER_KEY = "airport_owner"
        self.FIELD_ELEVATION_KEY = "field_elevation"
        self.REGIONAL_ATC_KEY = "regional_atc"
        self.FIRST_RUNWAY_KEY = "first_runway"
        self.SECOND_RUNWAY_KEY = "second_runway"
        self.THIRD_RUNWAY_KEY = "third_runway"
        self.RUNWAY_NUMBER_KEY = "runway_number"
        self.RUNWAY_LIGHTS_KEY = "runway_lights"
        self.LENGTH_KEY = "length"
        self.WIDTH_KEY = "width"
        self.SURFACE_KEY = "surface"
        self.STRENGTH_KEY = "strength"
        self.LIGHTS_DURATION_KEY = "lights_duration"
        self.OPPOSITE_RUNWAY_LIGHTS_KEY = "opposite_runway_lights"
        self.OPPOSITE_RUNWAY_KEY = "opposite_runway"

    def __get_airport_privacy(self, array):
        airport_privacy = []
        index = 0
        for i, element in enumerate(array):
            if element in self.AIRPORT_PRIVACY_OPTIONS:
                airport_privacy.append(element)
                index = i

        return index, airport_privacy

    def __get_airport_type(self, array):
        airport_type = []
        for element in array:
            if element in self.AIRPORT_TYPE_OPTIONS:
                airport_type.append(element)

        return airport_type

    def __get_airport_time_zone(self, array):
        for index, elemento in enumerate(array):
            if re.match(self.TIME_ZONE_PATTERN, elemento):
                return index, elemento

        return 0, self.NONE

    def __get_airport_flight_rules(self, array):
        flight_rules = []
        for element in array:
            if element in self.POSSIBLES_FLIGHT_RULES_OPTIONS:
                flight_rules.append(element)

        return flight_rules

    def __get_regional_atc(self, array):
        regional_atc = self.NONE
        index = 0

        for i, element in enumerate(array):
            if re.match(self.REGIONAL_ATC_PATTERN, element):
                return i, element

        return index, regional_atc

    def __get_coordinates(self, array):
        for i, string in enumerate(array):
            if (string[-1] == self.EAST or string[-1] == self.WEST in string[-1]) and "/" in string:
                pipe = string.index("/")

                latitude = string[0:pipe]
                longitude = string[pipe + 1:]

                coordinates = Converter(latitude=latitude, longitude=longitude).coordinates_dms_to_dd_v2()

                if coordinates:
                    latitude, longitude = coordinates

                    return i, latitude, longitude

        return False

    def __get_track_information(self, array):
        track_information_index = 0
        for index, elemento in enumerate(array):
            if re.search(self.TRACK_INFO_PATTERN, elemento):
                if elemento.strip().startswith('(') and elemento.strip().endswith(")"):
                    track_information_index = index

        track_information = array[track_information_index].translate(str.maketrans("", "", "()")).strip().split(" ")

        if "x" in track_information[0]:
            length = float(track_information[0].split("x")[0])
            width = float(track_information[0].split("x")[1])
            surface = track_information[1].strip()
            strength = " ".join(track_information[2:]).strip()
            strength_index = 2
        else:
            # Casos em que o tamanho da pista está como "CIRCULAR"
            length = track_information[0].strip()
            width = track_information[1][:-1].strip()
            surface = track_information[2].strip()
            strength = " ".join(track_information[3:]).strip()
            strength_index = 3

        lights_duration = self.NONE

        lights_index = next((i for i, elem in enumerate(track_information) if elem.strip().startswith(self.LEFT)), None)
        if lights_index:
            strength = " ".join(track_information[strength_index:lights_index]).strip().replace(" ", "")
            lights_duration = track_information[lights_index:]
            if self.DOT in lights_duration:
                lights_duration.remove(self.DOT)

        return track_information_index, length, width, surface, strength, lights_duration

    def __get_runway_information(self, text):
        # Initial declaration of information variables
        array = text.split(self.HYPHEN)
        array_length = len(array)

        track_information_index, length, width, surface, strength, lights_duration = self.__get_track_information(array)

        # Informações antes do parenteses, caso existam
        runway_number = self.NONE
        runway_lights = self.NONE
        if track_information_index > 0:
            if not array[0].startswith(self.LEFT):
                runway_number = array[0].strip()

                if track_information_index > 1:
                    runway_lights = array[1:track_information_index]

            else:
                runway_lights = array[:track_information_index]

        # Informações depois do parentes
        opposite_runway = self.NONE
        opposite_runway_lights = self.NONE
        if track_information_index + 1 < array_length:
            if not array[-1].startswith(self.LEFT):
                opposite_runway = array[-1].strip()

                if len(array[track_information_index:]) > 2:
                    opposite_runway_lights = " ".join(array[track_information_index + 1:-1]).replace(" ", "")

            else:
                opposite_runway_lights = " ".join(array[track_information_index:]).replace(" ", "")

        if runway_number and not runway_number.endswith(self.LEFT) and not runway_number.endswith(self.RIGHT):
            runway_number = f"{runway_number}{self.LEFT}"

            if opposite_runway:
                opposite_runway = f"{opposite_runway}{self.RIGHT}"

        runway_information = {
            self.RUNWAY_NUMBER_KEY: runway_number,
            self.RUNWAY_LIGHTS_KEY: runway_lights,
            self.LENGTH_KEY: length,
            self.WIDTH_KEY: width,
            self.SURFACE_KEY: surface,
            self.STRENGTH_KEY: strength,
            self.LIGHTS_DURATION_KEY: lights_duration,
            self.OPPOSITE_RUNWAY_LIGHTS_KEY: opposite_runway_lights,
            self.OPPOSITE_RUNWAY_KEY: opposite_runway,
        }

        return runway_information

    def __rotaer_page_information(self, text):
        airports = {}

        for tl in text:
            # Criando um array com separação de "enter" sem valores nulos ou espaços em branco
            array = list(filter(None, tl.split("\n")))
            # O termo D-AMDT, no pdf, indica um aeroporto/heliporto
            # Se existe D-AMDT, então é um array de um aeroporto/heliporto novo.
            header_index = next((i for i, elem in enumerate(array) if elem.startswith(self.HEADER_TEXT)), None)

            # Removendo o cabeçalho do array
            if header_index is not None:
                # Apagar o header
                del array[header_index]

                # Apagar o número da página
                del array[header_index]

            d_amdt_index = next((i for i, elem in enumerate(array) if elem.startswith(self.D_AMDT)), None)

            if d_amdt_index is not None:
                d_amdt = array[d_amdt_index].strip()
                del array[:d_amdt_index + 1]

                """
                    Casos especiais de problema com o pdf
                """
                if len(array) > 2:
                    # 1. O array 1 vem com as coordenadas de S em dobro
                    # Ex: array[1] = 00 06 07 SS/052 57 00W
                    if "SS" in array[1]:
                        array[1] = array[1].replace("SS", self.SOUTH)

                    # 2. O pdf ta com problema, as coordenadas se juntam com o array[0], dar um jeito de separar
                    # Ex: array[0] = Aeroclube de Aquidauana (SSHA) / AQUIDAUANA, MS 20 28 51S/055 46 10W
                    elif array[0][-1] == self.WEST:
                        dot_index = array[0].find(",")
                        coordinates_info = array[0][dot_index + 5:]
                        first_information_info = array[0][:dot_index + 5]
                        array[0] = first_information_info
                        array.insert(1, coordinates_info)

                    if self.__get_coordinates(array):
                        index_coordinates, latitude, longitude = self.__get_coordinates(array)

                        """
                            1. Dados básicos do aeroportos: 
                                - airport_name;
                                - icao;
                                - cidade;
                                - estado.
                        """
                        airport_basic_datas = ' '.join(array[: index_coordinates]).split(") /")

                        # Nome e ICAO no primeiro array
                        opening_paren_index = airport_basic_datas[0].find("(")
                        airport_name = airport_basic_datas[0][:opening_paren_index].strip()
                        icao = airport_basic_datas[0][opening_paren_index + 1:].strip()

                        # Cidade e estado no segundo array
                        city = airport_basic_datas[1].split(',')[0].strip()
                        state = airport_basic_datas[1].split(',')[1].strip()

                        """
                            2. Outras informações
                        """
                        # Informações complementares do aeroporto.
                        additional_information = array[index_coordinates + 1:]

                        """
                            2.1 Informações: 
                                - Tipo do aeroporto;
                                - privacidade
                                - time zone;
                                - regra de voo                             
                        """
                        # Possível quebra de linha das primeiras informações.
                        first_line_index = next((i for i, element in enumerate(additional_information) if
                                                 re.search(self.FIELD_ELEVATION_PATTERN, element)), 0)

                        field_elevation = additional_information[first_line_index]

                        # unindo os arrays em um só.
                        additional_information_first_element = (" ".join(additional_information[:first_line_index])
                                                                .split(" "))

                        airport_type = self.__get_airport_type(additional_information_first_element)
                        app_index, airport_privacy = self.__get_airport_privacy(additional_information_first_element)
                        tz_index, time_zone = self.__get_airport_time_zone(additional_information_first_element)
                        flight_rules = self.__get_airport_flight_rules(additional_information_first_element)

                        airport_owner = self.NONE
                        if tz_index - app_index > 2:
                            airport_owner = " ".join(
                                additional_information_first_element[app_index + 1: tz_index])

                        """
                            2.3 Informação do rádio ATC 
                        """
                        ra_index, regional_atc = self.__get_regional_atc(additional_information)

                        """
                            2.4 Informações de pista:
                                - "runway_number": numero de partida,
                                - "runway_lights": luzes presentes (array),
                                - "length": comprimento (metros),
                                - "width": largura (metros),
                                - "surface": tipo de piso,
                                - "strength": capacidade do piso,
                                - "lights_duration": tempo possível de duração das luzes acesas (minutos) (array),
                                - "opposite_runway_lights": luzes inversas presentes (array),
                                - "opposite_runway": numero de chegada,
                        """
                        all_airport_tracks = additional_information[first_line_index + 1: ra_index]
                        combined_tracks = []  # Lista para armazenar os tracks combinados

                        tf_len = len(all_airport_tracks)
                        skip_next = False  # Flag para pular o próximo elemento

                        for i in range(tf_len):
                            if skip_next:
                                skip_next = False
                                continue

                            if i + 1 < len(all_airport_tracks) and all_airport_tracks[i + 1]:
                                if (all_airport_tracks[i][-1].strip() == self.HYPHEN
                                        or all_airport_tracks[i + 1].strip().startswith(self.HYPHEN)
                                        or all_airport_tracks[i + 1].startswith("[")
                                        or all_airport_tracks[i + 1].strip().startswith(self.LEFT)):
                                    combined_tracks.append(" ".join(all_airport_tracks[i:i + 2]))
                                    skip_next = True
                                elif not skip_next:
                                    combined_tracks.append(all_airport_tracks[i])
                            else:
                                if not skip_next:
                                    combined_tracks.append(all_airport_tracks[i])

                        first_runway = self.NONE
                        second_runway = self.NONE
                        third_runway = self.NONE

                        runways = [first_runway, second_runway, third_runway]

                        for i in range(min(len(combined_tracks), 3)):
                            runways[i] = self.__get_runway_information(combined_tracks[i])

                        first_runway, second_runway, third_runway = runways

                        airports[icao] = {
                            self.D_AMDT_KEY: d_amdt,
                            self.CITY_KEY: city,
                            self.STATE_KEY: state,
                            self.AIRPORT_NAME_KEY: airport_name,
                            self.LATITUDE_KEY: latitude,
                            self.LONGITUDE_KEY: longitude,
                            self.AIRPORT_TYPE_KEY: airport_type if airport_type else self.NONE,
                            self.AIRPORT_PRIVACY_KEY: airport_privacy if airport_privacy else self.NONE,
                            self.TIME_ZONE_KEY: time_zone if time_zone else self.NONE,
                            self.FLIGHT_RULES_KEY: flight_rules if flight_rules else self.NONE,
                            self.OWNER_KEY: airport_owner,
                            self.FIELD_ELEVATION_KEY: field_elevation,
                            self.REGIONAL_ATC_KEY: regional_atc,
                            self.FIRST_RUNWAY_KEY: first_runway,
                            self.SECOND_RUNWAY_KEY: second_runway,
                            self.THIRD_RUNWAY_KEY: third_runway
                        }

        return airports

    def extract_information_rotaer(self):
        with fitz.open(self.file) as pdf_document:
            number_of_pages = pdf_document.page_count

            full_text = ""
            for i in range(number_of_pages):
                pagina = pdf_document[i - 1]

                text = pagina.get_text()
                full_text += text

            temp_parts = [full_text]
            for temp_pattern in self.PDF_SPLIT:
                new_parts = []
                for part in temp_parts:
                    split_parts = part.split(temp_pattern)
                    new_parts.extend(split_parts)
                temp_parts = new_parts

            text_split_by_airport = [part.strip() for part in temp_parts if part.strip()]
            airports_information = self.__rotaer_page_information(text_split_by_airport)

        return airports_information

    def organize_by_state(self, airports):
        airports_organized_by_state = {}

        # Certifique-se de que airports_organized_by_state é um dicionário antes de começar
        airports_organized_by_state = {}

        for icao in airports:
            if airports[icao][self.STATE] not in self.BRAZILIAN_STATES:
                raise ValueError("O estado do aeroporto não é um estado brasileiro válido.")

            # Verifica se o estado já está no dicionário
            if airports[icao][self.STATE] not in airports_organized_by_state:
                # Se não estiver, cria um novo dicionário vazio para o estado
                airports_organized_by_state[airports[icao][self.STATE]] = {}

            # Agora você pode adicionar o aeroporto ao dicionário do estado
            airports_organized_by_state[airports[icao][self.STATE]][icao] = airports[icao]

        return airports_organized_by_state
