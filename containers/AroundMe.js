import React, { useState, useEffect, useCallback } from "react";
import { Text } from "react-native";
import MapView, { Callout } from "react-native-maps";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import axios from "axios";
import { useNavigation } from "@react-navigation/core";

import styles from "./components/style";

function AroundMe() {
  const [location, setLocation] = useState();
  const [rooms, setRooms] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  // ask for location permission and store in state
  const getLocationAsync = useCallback(async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      alert("Permission refused");
    } else {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      // get location of rooms
      const response = await axios.get(
        `https://airbnb-api.herokuapp.com/api/room/around?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`
      );
      setRooms(response.data);
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (Platform.OS === "android" && !Constants.isDevice) {
      alert(
        "Geolocation does not work on Android simulator, please use your device"
      );
    } else {
      getLocationAsync();
    }
  }, []);

  // show pins
  return (
    <>
      {isLoading === false ? (
        <MapView
          style={{ flex: 1 }}
          showsUserLocation={true}
          followUserLocation={true}
          zoomEnabled={true}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2
          }}
        >
          {rooms.map(room => {
            return (
              <MapView.Marker
                key={room._id}
                coordinate={{
                  latitude: room.loc[1],
                  longitude: room.loc[0]
                }}
              >
                <Callout
                  onPress={() =>
                    navigation.navigate("Room", { roomId: room._id })
                  }
                >
                  <Text>{room.title}</Text>
                </Callout>
              </MapView.Marker>
            );
          })}
        </MapView>
      ) : null}
    </>
  );
}

export default AroundMe;
