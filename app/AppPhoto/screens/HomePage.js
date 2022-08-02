import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";


function HomePage({route, navigation}){
    const id_user = route.params.id;
    const [isLoading, setLoading] = useState(true);
    const [dataUser, setDataUser] = useState([]);

    useEffect(() => {
        fetch('http://192.168.8.125/user?id='+id_user, {method:"GET"})
          .then((response) => 
            response.json())
          .then((json) => {
            setDataUser(json[0])
          })
          .catch((error) => console.error(error))
          .finally(() => setLoading(false));
      }, []);

    return (
        <View style={{flex: 1, flexDirection: "column", backgroundColor: "#f8edeb"}}>
            <View style={{alignItems: "center", height:50}}>
                <Image
                    style={styles.image} 
                    source={require("../assets/log2.png")}
                />
            </View>
            <View style={styles.container}>
                <Text>
                    {isLoading ? "loading" : dataUser._pseudo_user}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 8,
        backgroundColor: "#f8edeb",
        alignItems: "center",
        justifyContent: "center",
    },

    image: {
        marginTop: 0,
        height: 50,
        width: 50
    },
})

export default HomePage;