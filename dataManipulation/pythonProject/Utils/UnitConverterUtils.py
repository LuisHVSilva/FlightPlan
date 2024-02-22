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
