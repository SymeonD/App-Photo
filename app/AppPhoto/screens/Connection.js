import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

const [isLoading, setLoading] = useState(true);

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
                onPress={() => {
                    isLoading ? (Connect(pseudo, password) ? navigation.goBack() : "") : ""}}
                >
                <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>

        </View>
    )
}

const Connect = (pseudo, password) => {

    var userCredentials = new URLSearchParams();
    userCredentials.append('pseudo', pseudo);
    userCredentials.append('password', password);

    fetch("http://192.168.1.196/connect", {
        method:'POST', 
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: userCredentials.toString() //Don't forget the toString()
    })
        .then((response) => {
            if(response.status == 201){
                return true
            }else{
                return false
            }})
        .catch((error) => {
            console.log(error)
            return false})
        .finally(() => setLoading(false))
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
      },

      image: {
        marginBottom: 40,
        height: 100,
        width: 100
      },

      inputText: {
        backgroundColor: "#FFC0CB",
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
      },

      loginBtn: {
        width: "80%",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        backgroundColor: "#FF1493",
      },
})

export default ConnectionScreen;