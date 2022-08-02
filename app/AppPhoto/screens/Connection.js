import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

function ConnectionScreen({navigation}) {
    const [pseudo, setPseudo] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={styles.container}>

            <Image 
                style={styles.image} 
                source={require("../assets/log2.png")}
            />

            <TextInput 
                style={styles.inputText}
                placeholder="Pseudo."
                placeholderTextColor="#003f5c"
                secureTextEntry={false}
                onChangeText={(pseudo) => setPseudo(pseudo)}
            />

            <TextInput 
                style={styles.inputText}
                placeholder="Password."
                placeholderTextColor="#003f5c"
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
            />

            <TouchableOpacity>
                <Text style={styles.forgot_button}>Forgot Password?</Text>
            </TouchableOpacity>
    
            <TouchableOpacity 
                style={styles.loginBtn}
                onPress={() => (Connect(pseudo, password, navigation))}>
                <Text style={styles.loginText}>Login / Register</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text style={styles.forgot_button}
                onPress={() => navigation.navigate("HomePage")}> Enter as visitor</Text>
            </TouchableOpacity>

        </View>
    )
}

const Connect = (pseudo, password, navigation) => {

    var userCredentials = new URLSearchParams();
    userCredentials.append('pseudo', pseudo);
    userCredentials.append('password', password);

    fetch("http://192.168.8.125/connect", {
        method:'POST', 
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: userCredentials.toString() //Don't forget the toString()
    })
        .then((res) => {
            if(res.status != 401){
                return res.json();
            }else{
               throw new Error(res.status);
            }
        })
        .then((data) => {
            navigation.navigate("HomePage", {id:data.id})
        })
        .catch((error) => {
            console.log(error)})
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8edeb",
        alignItems: "center",
        justifyContent: "center",
      },

      image: {
        marginBottom: 80,
        height: 150,
        width: 150
      },

      inputText: {
        backgroundColor: "#ffb5a7",
        borderRadius: 30,
        width: "70%",
        height: 45,
        marginBottom: 20,
        textAlign:"center",
        alignItems: "center",
      },

      forgot_button: {
        height: 30,
        marginBottom: 30,
        color: '#f9dcc4'
      },

      loginBtn: {
        width: "80%",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        backgroundColor: "#ffb5a7",
        marginBottom: 20,
        color: '#f9dcc4'
      },
})

export default ConnectionScreen;