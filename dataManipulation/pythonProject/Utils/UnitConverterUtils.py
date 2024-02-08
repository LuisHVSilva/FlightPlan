class Converter(object):
    def __init__(self, longitude=None, latitude=None):
        self.longitude = longitude
        self.latitude = latitude

    def coordinates_dms_to_dd(self):
        degrees, minutes, seconds, coordinate = 0, 0, 0, 0

        if self.latitude:
            coordinate = self.latitude[:-1]

        if self.longitude:
            coordinate = self.longitude[:-1]

        degrees = coordinate[0:2]
        minutes = coordinate[2:4]
        seconds = coordinate[4:6]

        # Ponto no segundo
        if "." in coordinate:
            if coordinate.index(".") == 6:
                second_fraction = coordinate.split(".")[1]
                seconds = f"{seconds}.{second_fraction}"

        try:
            return -(float(degrees) + (float(minutes) / 60.0) + (float(seconds) / 3600.0))
        except ValueError:
            return "----"
