import re


class Converter(object):
    def __init__(self, longitude=None, latitude=None):
        self.longitude = longitude
        self.latitude = latitude
        self.south = "S"
        self.west = "W"

    def coordinates_dms_to_dd(self):
        degrees, minutes, seconds = 0, 0, 0
        direction = ""

        if self.latitude:
            latitude = self.latitude.upper()
            if "S" in self.latitude.upper():
                latitude_direction_index = latitude.index("S")
            else:
                latitude_direction_index = latitude.index("N")

            coordinate = latitude[:latitude_direction_index]
            direction = latitude[latitude_direction_index]
            degrees = coordinate[0:2]
            minutes = coordinate[2:4]
            seconds = coordinate[4:]

        if self.longitude:
            longitude = self.longitude.upper()
            if "W" in self.longitude.upper():
                longitude_direction_index = longitude.index("W")
            else:
                longitude_direction_index = longitude.index("E")

            coordinate = longitude[:longitude_direction_index]
            direction = longitude[longitude_direction_index]
            degrees = coordinate[0:3]
            minutes = coordinate[3:5]
            seconds = coordinate[5:]

        # Convertendo os segundos decimais
        if "." in seconds:
            seconds, second_fraction = seconds.split(".")
            seconds = float(seconds) + float("0." + second_fraction)
        elif "," in seconds:
            seconds, second_fraction = seconds.split(",")
            seconds = float(seconds) + float("0." + second_fraction)
        else:
            seconds = float(seconds)

        try:
            dd = float(degrees) + (float(minutes) / 60.0) + (seconds / 3600.0)
            if direction in [self.south, self.west]:
                dd *= -1

            return dd
        except ValueError:
            return "----"

    def coordinates_dms_to_dd_v2(self):

        # Latitude
        latitude_direction = -1 if self.south in self.latitude[-1] else 1
        # latitude_parts = list(filter(lambda x: x.strip(), self.latitude[:-1].split(" ")))
        latitude = self.latitude.replace(" ", "")[:-1]
        longitude_direction = -1 if self.west in self.longitude[-1] else 1
        # longitude_parts = list(filter(lambda x: x.strip(), self.longitude[:-1].split(" ")))
        longitude = self.longitude.replace(" ", "")[:-1]

        try:
            latitude_degrees = float(latitude[:2].replace(",", "."))
            latitude_minutes = float(latitude[2:4].replace(",", ".")) / 60.0
            latitude_seconds = float(latitude[4:].replace(",", ".")) / 3600.0

            latitude_dd = latitude_direction * (latitude_degrees + latitude_minutes + latitude_seconds)

            longitude_degrees = float(longitude[:3].replace(",", "."))
            longitude_minutes = float(longitude[3:5].replace(",", ".")) / 60.0
            longitude_seconds = float(longitude[5:].replace(",", ".")) / 3600.0

            longitude_dd = longitude_direction * (longitude_degrees + longitude_minutes + longitude_seconds)

            return latitude_dd, longitude_dd

        except Exception as e:
            return False
