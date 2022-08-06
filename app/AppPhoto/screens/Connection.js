import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Modal } from "../components/Modal";
import { launchImageLibrary } from 'react-native-image-picker';

function ConnectionScreen({navigation}) {
    const [pseudo, setPseudo] = useState('');
    const [password, setPassword] = useState('');

    const [newUser, setNewUser] = useState(false);
    
    const [imageSource, setImageSource] = useState(null);

    function selectImage() {
        let options = {
          title: 'You can choose one image',
          maxWidth: 256,
          maxHeight: 256,
          storageOptions: {
            skipBackup: true
          }
        };
    
        launchImageLibrary(options, response => {
            if (response.didCancel) {
              console.log('User cancelled photo picker');
              Alert.alert('You did not select any image');
            } else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton);
            } else {
                let source;
                if (response.assets) {
                    source = { uri: response.assets[0].uri }
                }else{
                    source = { uri: response.uri };
                }
                setImageSource(source.uri);
                console.log(imageSource)
            }
          });
      }

    return (
        <View style={styles.container}>

            <Modal
                isVisible={newUser}
                onRequestClose={() => {
                setNewUser(!newUser);
                setImageSource(null)
                }}
            >
                <Modal.Container>
                    <Modal.Header title='Create an account'/>

                    <Modal.Body>
                        {/* Profile pic */}
                        
                        <TouchableOpacity
                            style={PopupStyles.buttonProfile}
                            onPress={() => selectImage()}
                        >
                            <View>
                                {
                                imageSource === null ? (
                                    <Text
                                        style={{textAlign:'center'}}
                                    >
                                        Pick {'\n'} an image
                                    </Text>
                                ) : (
                                    <Image
                                        source={{uri:imageSource}}
                                        style={PopupStyles.image}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                        {/* Mail */}
                        <TextInput
                            style={PopupStyles.inputText}
                            placeholder='Mail.'
                        />
                        {/* Pseudo */}
                        <TextInput
                            style={PopupStyles.inputText}
                            placeholder='Pseudo.'
                        />
                        {/* Password */}
                        <TextInput
                            style={PopupStyles.inputText}
                            placeholder='Password.'
                        />
                        {/* Confirm password */}
                        <TextInput
                            style={PopupStyles.inputText}
                            placeholder='Confirm password.'
                        />
                    </Modal.Body>

                    <Modal.Footer>
                        {/* Register button */}
                        <TouchableOpacity
                            style={PopupStyles.buttonRegister}
                            onPress={() => setNewUser(!newUser)}
                        >
                            <Text style={styles.loginText}>
                                Register
                            </Text>
                        </TouchableOpacity>
                        {/* Cancel */}
                        <TouchableOpacity>
                            <Text style={PopupStyles.cancel_button}
                            onPress={() => {setNewUser(!newUser)}}>Cancel</Text>
                        </TouchableOpacity>
                    </Modal.Footer>
                </Modal.Container>
            </Modal>

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

            <View style={{flexDirection:'row'}}>
                <TouchableOpacity 
                    style={{flexDirection:'row', width:'40%'}}
                    onPress={() => (setNewUser(!newUser))}>
                    <View style={styles.loginBtn}>
                        <Text style={styles.loginText}>Register</Text>
                    </View>
                    <View style={styles.triangleCornerLeft} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{flexDirection:'row', width:'40%'}}
                    onPress={() => (Connect(pseudo, password, navigation))}
                >
                    <View style={styles.triangleCornerRight} />
                    <View style={styles.registerBtn}>
                        <Text style={styles.loginText}>Login</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity>
                <Text style={styles.forgot_button}
                onPress={() => navigation.navigate("UserPage")}> Enter as visitor</Text>
            </TouchableOpacity>

            

        </View>
    )
}

const Connect = (pseudo, password, navigation) => {

    var userCredentials = new URLSearchParams();
    userCredentials.append('pseudo', pseudo);
    userCredentials.append('password', password);

    fetch("http://localhost:8000/connect", {
        method:'POST', 
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: userCredentials.toString() //Don't forget the toString()
    })
        .then((res) => {
            if(res.status != 401){
                return res.json();
            }else if(res.status == 401){
                setModalVisible(!modalVisible)
            }else{
                throw new Error(res.status);
            }
        })
        .then((data) => {
            if(data.id){
                navigation.navigate("UserPage", {id:data.id})
            }
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

      loginText: {
        color:'black'
      },    

      loginBtn: {
        width:'90%',
        borderBottomLeftRadius: 25,
        borderTopLeftRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        backgroundColor: "#ffb5a7",
        marginBottom: 20,
        color: '#f9dcc4'
      },

      triangleCornerLeft: {
        width: 0,
        height: 0,
        marginTop: 40,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderRightWidth: 10,
        borderTopWidth: 50,
        borderRightColor: "transparent",
        borderTopColor: "#ffb5a7",
      },

      triangleCornerRight: {
        width: 0,
        height: 0,
        marginTop: 40,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: 10,
        borderBottomWidth: 50,
        borderLeftColor: "transparent",
        borderBottomColor: "#ffb5a7",
      },

      registerBtn: {
        width:'90%',
        borderBottomRightRadius: 25,
        borderTopRightRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        backgroundColor: "#ffb5a7",
        marginBottom: 20,
        color: '#f9dcc4'
      },
})

const PopupStyles = StyleSheet.create({
    buttonRegister:{
        height:50,
        width:'80%',
        alignItems: "center",
        justifyContent: "center",
        borderRadius:25,
        marginTop: 40,
        marginBottom: 15,
        backgroundColor: "#ffb5a7"
    },

    buttonProfile: {
        width: 100,
        height: 100,
        backgroundColor: "#ffb5a7",
        borderRadius: 10,
        marginBottom: 20,
        alignItems:'center',
        justifyContent: 'center'
    },

    image:{
        width: 100,
        height: 100,
        borderRadius: 10,
    },

    inputText: {
        backgroundColor: "#ffb5a7",
        borderRadius: 30,
        width: "70%",
        height: 45,
        marginBottom: 20,
        paddingLeft: 20,
        textAlign:"left",
        alignItems: "center",
    },

    cancel_button:{
        height:30,
        color: '#f9dcc4'
    },
})

export default ConnectionScreen;