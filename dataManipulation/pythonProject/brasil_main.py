"""
Lista de auxilio-radio à navegação -> 99
Conversão de medidas -> 106
Estação meteorologica -> 155
Classificação dos aerodromos -> 257
DCT -> 326
Regras planejamento de voo -> 328
Uso dos auxilios-radio à navegação aerea -> 1730
Espaços aereos condicionados -> 1816
Cartas de rotas -> 1888
Aeródromos e heliportos -> 1903
"""
"""
    Part 1 -> Creating the basic object of all brazilian airports based on "rotaer_completo.pdf":
        - state, 
        - ICAO, 
        - Airport Name 
        - City.

    This final python object (dictionary) will be the base to get all information to create the json. 
    
    Part 2 -> Creating the basic object of all brazilian ATC routes based on "AIRAC-Brasil.pdf"
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

from Brasil.brasil_information_roater import BrasilROTAER as Rotaer
from Brasil.brasil_information_airac import BrasilAirac as Airac
from Utils.JsonUtils import JsonUtils

# Rotaer
rotaer_file = './data/rotaer_completo.pdf'
new_json_rotaer_file = './json/rotaer_completo.json'

# Airac
airac_file = './data/AIRAC-Brasil.pdf'

# Airport Class
airport_class_first_page = 257
airport_class_last_page = 260

# ATC
new_json_atc_file = './json/atc-Brasil.json'
atc_first_page = 542
atc_last_page = 593

# RNAV
new_json_rnav_file = './json/rnav-Brasil.json'
rnav_first_page = 597
rnav_last_page = 1709

# Some waypoints Coordinate
new_json_some_waypoints_coordinates = "./json/some_waypoints_coordinates.json"
some_waypoints_coordinates_first_page = 1747
some_waypoints_coordinates_last_page = 1795


def add_class_in_object(obj, clss):
    for key in obj:
        for value in obj[key]:
            icao = next(iter(value))
            if icao in clss:
                value[icao]["airspace_class"] = clss[icao]

    return obj


""" 
    PART 1 
"""
brasil = Rotaer(rotaer_file)
initial_information = brasil.extract_information_rotaer()

brasil.array = initial_information
dictionary = brasil.create_dictionary()

# Getting class of any AIRAC brazilian airport information
airac = Airac(airac_file)
airport_class = airac.extract_airport_class(first_page=airport_class_first_page, last_page=airport_class_last_page)

# Setting class in dictionary
dictionary = add_class_in_object(dictionary, airport_class)
JsonUtils(new_json_rotaer_file, dictionary).create_json_file()

"""
    PART 2  
"""
# Getting ATC json
"""atc_routes = airac.extract_airway_routes("atc", atc_first_page, atc_last_page, 6)
JsonUtils(new_json_atc_file, atc_routes).create_json_file()

# Getting RNAV json
rnav_routes = airac.extract_airway_routes("rnav", rnav_first_page, rnav_last_page, 7)
JsonUtils(new_json_rnav_file, rnav_routes).create_json_file()

# Getting name code designators for significant points
some_waypoints_coordinates = airac.extract_names_assigned_to_significant_points(
    first_page=some_waypoints_coordinates_first_page,
    last_page=some_waypoints_coordinates_last_page
)

JsonUtils(new_json_some_waypoints_coordinates, some_waypoints_coordinates).create_json_file()
"""
