"""
ICAO -> 94 OK
Lista de auxilio-radio à navegação -> 99
Conversão de medidas -> 106
Estação meteorologica -> 155
Classificação dos aerodromos -> 257
DCT -> 326
Regras planejamento de voo -> 328
Rotas ATS convencionais (aerovias) -> 542 - 593 OK
Rotas de navegação de area RNAV (aerovias) -> 597 - 1709 OK
Uso dos auxilios-radio à navegação aerea -> 1730
Pontos significativos -> 1747
Espaços aereos condicionados -> 1816
Cartas de rotas -> 1888
Aeródromos e heliportos -> 1903
"""

from Brasil.brasil_information_roater import BrasilROTAER as Rotaer
from Brasil.brasil_information_airac import BrasilAirac as Airac
from Brasil.JsonUtils import JsonUtils

# Rotaer
rotaer_file = './data/rotaer_completo.pdf'
new_json_rotaer_file = './json/rotaer_completo.json'

# Airac
airac_file = './data/AIRAC-Brasil.pdf'

# ATC
new_json_atc_file = './json/atc-Brasil.json'
atc_first_page = 542
atc_last_page = 593

# RNAV
new_json_rnav_file = './json/rnav-Brasil.json'
rnav_first_page = 597
rnav_last_page = 1709


def add_class_in_object(obj, clss):
    for key in obj:
        for value in obj[key]:
            icao = next(iter(value))
            if icao in clss:
                value[icao]["airspace_class"] = clss[icao]

    return obj


"""
    Creating the basic object of all brazilian airports based on "rotaer_completo.pdf":
        - state, 
        - ICAO, 
        - Airport Name 
        - City.
    
    This final python object (dictionary) will be the base to get all information to create the json. 
"""

brasil = Rotaer(rotaer_file)
initial_information = brasil.extract_information_rotaer()
brasil.array = initial_information
dictionary = brasil.create_dictionary()

# Getting class of any AIRAC brazilian airport information
airac = Airac(airac_file)
airport_class = airac.extract_airport_class(pages="257-260")

# Setting class in dictionary
dictionary = add_class_in_object(dictionary, airport_class)
JsonUtils(new_json_rotaer_file, dictionary).create_json_file()

"""
    Creating the basic object of all brazilian ATC routes based on "AIRAC-Brasil.pdf"
    The final python object (atc_routes) will give the information of how to connects the airports with ATC via with:
        - first_coordinate
        - second_coordinate
        - track_mag
        - rev_track_mag
        - length
        - upper_limit
        - lower_limit"
        - mea
        - airspace_class  
        
    Those attributes are for each waypoint within a given route, starting and ending with airports citys.
    (Verdinho nos mapas de baixa altitude)
"""
# Getting ATC json
atc_routes = airac.extract_airway_routes("atc", atc_first_page, atc_last_page, 6)
JsonUtils(new_json_atc_file, atc_routes).create_json_file()

# Getting RNAV json
rnav_routes = airac.extract_airway_routes("rnav", rnav_first_page, rnav_last_page, 7)
JsonUtils(new_json_rnav_file, rnav_routes).create_json_file()


