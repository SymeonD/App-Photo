import React, {useState, useEffect} from 'react';
import { View, Vibration, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, KeyboardAvoidingView } from 'react-native';
import { Modal } from "../components/Modal";
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage'
//import { TextInput } from 'react-native-paper';
//import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function ConnectionScreen({navigation}) {
    const [pseudoConnect, setPseudoConnect] = useState('');
    const [passwordConnect, setPasswordConnect] = useState('');

    const [pseudo, setPseudo] = useState('');
    const [password, setPassword] = useState('');

    const [mail, setMail] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const [newUser, setNewUser] = useState(false);
    
    const [imageSource, setImageSource] = useState(null);

    const [isPasswordHidden, setPasswordHidden] = useState(true);

    //Validation connect
    const [isUserExisting, setUserExisting] = useState(null);
    const [justStarted, setJustStarted] = useState([true, true]);

    //Validation register
    const [isFieldValid, setFieldValid] = useState([true, true, true, true, true]) //User fields

    useEffect(() => {
        AsyncStorage.getItem('loggedUser')
            .then((resUser) => {
                if(resUser){
                    global.userId = resUser;
                    //navigation.navigate('UserPage', {id:resUser})
                }
            })
    })

    function selectImage() {
        let options = {
          title: 'You can choose one image',
          maxWidth: 256,
          maxHeight: 256,
          storageOptions: {
            skipBackup: true
          },
          includeBase64: true
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
            }
          });
      }

    function Connect(pseudo, password, navigation) {
        var userCredentials = new URLSearchParams();
        userCredentials.append('pseudo', pseudo);
        userCredentials.append('password', password);

        fetch(global.urlAPI+"connect", {
            method:'POST', 
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: userCredentials.toString() //Don't forget the toString()
        })
            .then((res) => {
                if(res.status != 404){
                    setUserExisting(true)
                    return res.json();
                }else{
                    setUserExisting(false)
                    Vibration.vibrate([50, 50, 50, 50])
                    throw new Error(res.status);
                }
            })
            .then((data) => {
                if(data.id){
                    global.userId = data.id;
                    AsyncStorage.setItem('loggedUser', data.id)
                        .then(() => {Vibration.vibrate(100); navigation.navigate("UserPage", {id:data.id})})
                }
            })
            .catch((error) => {
                console.log(error)})
    }

    function Register(profile_pic, mail, pseudo, password, navigation) {
        var profile_pic_file = {
            uri: profile_pic,
            type: 'image/jpeg',
            name: 'profile_pic.jpg'
        }
        var userInformations = new FormData();
        userInformations.append('profile_picture', profile_pic_file);
        userInformations.append('mail', mail);
        userInformations.append('pseudo', pseudo);
        userInformations.append('password', password);
    
        fetch(global.urlAPI+'user', {
            method: 'POST',
            body: userInformations,
        })
            .then((res) => {
                if(res.status != 401){
                    setUserExisting(true)
                    return res.json();
                }else{
                    throw new Error(res.status);
                }
            })
            .then((data) => {
                if(data.id){
                    global.userId = data.id;
                    AsyncStorage.setItem('loggedUser', data.id)
                        .then(() => navigation.navigate("UserPage", {id:data.id}))
                }
            })
            .catch((error) => {
                console.log(error)})
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
                            style={[PopupStyles.buttonProfile, {borderColor: 'red', borderWidth: (imageSource === null || isFieldValid[0]) ? 0 : 1}]}
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
                            style={[PopupStyles.inputText, {borderColor: 'red', borderWidth: (mail.length != 0 || isFieldValid[1]) ? 0 : 1}]}
                            autoCapitalize='none'
                            keyboardType='email-address'
                            caretHidden={false}
                            placeholder='Mail.'
                            onChangeText={(mail) => {
                                setMail(mail)
                                isFieldValid[1] ? setFieldValid([isFieldValid[0], false, isFieldValid[2], isFieldValid[3], isFieldValid[4]]) : null
                            }}
                            defaultValue={mail}
                        />
                        {/* Pseudo */}
                        <TextInput
                            style={[PopupStyles.inputText, {borderColor: 'red', borderWidth: (pseudo.length != 0 || isFieldValid[2]) ? 0 : 1}]}
                            autoCapitalize='none'
                            placeholder='Pseudo.'
                            onChangeText={(pseudo) => {
                                setPseudo(pseudo)
                                isFieldValid[2] ? setFieldValid([isFieldValid[0], isFieldValid[1], false, isFieldValid[3], isFieldValid[4]]) : null
                            }}
                            defaultValue={pseudo}
                        />
                        {/* Password */}
                        <TextInput
                            style={[PopupStyles.inputText, {borderColor: 'red', borderWidth: (password.length != 0 || isFieldValid[3]) ? 0 : 1}]}
                            autoCapitalize='none'
                            placeholder='Password.'
                            secureTextEntry={true}
                            onChangeText={(password) => {
                                setPassword(password)
                                isFieldValid[3] ? setFieldValid([isFieldValid[0], isFieldValid[1], isFieldValid[2], false, isFieldValid[4]]) : null
                            }}
                            defaultValue={password}
                        />
                        {/* Confirm password */}
                        <TextInput
                            style={[PopupStyles.inputText, {/* For password validation*/ marginBottom:0, borderColor: 'red', borderWidth: (passwordConfirm.length != 0 || isFieldValid[4]) ? 0 : 1}]}
                            autoCapitalize='none'
                            placeholder='Confirm password.'
                            secureTextEntry={true}
                            onChangeText={(passwordConfirm) => {
                                isFieldValid[4] ? setFieldValid([isFieldValid[0], isFieldValid[1], isFieldValid[2], isFieldValid[3], false]) : null
                                setPasswordConfirm(passwordConfirm)
                            }}
                            defaultValue={passwordConfirm}
                        />
                    </Modal.Body>

                    <Modal.Footer>
                        {/* Password validation */}
                        {
                            password === passwordConfirm ? 
                            <Text style={{color: 'red'}}>
                                
                            </Text> 
                             :
                            <Text style={{color: 'red'}}>
                                Passwords do not match
                            </Text> 
                        }
                        
                        {/* Register button */}
                        <TouchableOpacity
                            style={[PopupStyles.buttonRegister, {opacity: imageSource == null || mail.length == 0 || pseudo.length == 0 || password.length == 0 || passwordConfirm.length == 0 || password !== passwordConfirm ? 0.5 : 1}]}
                            onPress={() => {
                                Register(imageSource, mail, pseudo, password, navigation)
                                setNewUser(!newUser)

                            }}
                            disabled={imageSource == null || mail.length == 0 || pseudo.length == 0 || password.length == 0 || passwordConfirm.length == 0 || password !== passwordConfirm}
                        >
                            <Text style={styles.loginText}>
                                Register
                            </Text>
                        </TouchableOpacity>
                        {/* Cancel */}
                        <TouchableOpacity>
                            <Text style={PopupStyles.cancel_button}
                            onPress={() => {
                                setNewUser(!newUser)
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </Modal.Footer>
                </Modal.Container>
            </Modal>

            <Image 
                style={styles.image} 
                source={require("../assets/log2.png")}
            />
            
            {isUserExisting != false ? 
            <Text style={{color:'#ed2f2f', marginBottom: 5}}>
            
            </Text>
            :
            <Text style={{color:'#ed2f2f', marginBottom: 5}}>
                No users with these credentials
            </Text>}

            <TextInput 
                style={[styles.inputText, {borderColor: 'red', borderWidth: isUserExisting != false && (pseudoConnect.length != 0 || justStarted[0]) ? 0 : 1}]}
                placeholder="Pseudo."
                placeholderTextColor="#003f5c"
                secureTextEntry={false}
                autoCapitalize='none'
                onChangeText={(pseudoConnect) => {
                    justStarted[0] ? setJustStarted([false, justStarted[1]]) : null
                    setPseudoConnect(pseudoConnect)
                }}
            />

            <TextInput 
                style={[styles.inputText, {borderColor: 'red', borderWidth: isUserExisting != false && (passwordConnect.length != 0 || justStarted[1]) ? 0 : 1}]}
                placeholder="Password."
                placeholderTextColor="#003f5c"
                secureTextEntry={isPasswordHidden}
                autoCapitalize='none'
                //right={
                //    <TextInput.Icon
                //      name={() => <MaterialCommunityIcons name={isPasswordHidden ? "eye-off" : "eye"} size={28} color={'black'} />} // where <Icon /> is any component from vector-icons or anything else
                //      onPress={() => { isPasswordHidden ? setPasswordHidden(false) : setPasswordHidden(true) }}
                //    />
                //  }
                //right={<TextInput.Icon name="eye" />}                
                onChangeText={(passwordConnect) => {
                    justStarted[1] ? setJustStarted([justStarted[0], false]) : null
                    setPasswordConnect(passwordConnect)
                }}
            />

            <TouchableOpacity>
                <Text style={styles.forgot_button}>Forgot Password?</Text>
            </TouchableOpacity>

            <KeyboardAvoidingView 
                style={{flexDirection:'row'}}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={500}
            >
                <TouchableOpacity 
                    style={{flexDirection:'row', width:'40%'}}
                    onPress={() => (setNewUser(!newUser))}>
                    <View style={styles.registerBtn}>
                        <Text style={styles.loginText}>Register</Text>
                    </View>
                    <View style={styles.triangleCornerLeft} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[{flexDirection:'row', width:'40%', opacity: pseudoConnect.length == 0 || passwordConnect.length == 0 ? 0.5 : 1}]}
                    onPress={() => (Connect(pseudoConnect, passwordConnect, navigation))}
                    disabled={pseudoConnect.length == 0 || passwordConnect.length == 0}
                >
                    <View style={styles.triangleCornerRight} />
                    <View style={styles.loginBtn}>
                        <Text style={styles.loginText}>Login</Text>
                    </View>
                </TouchableOpacity>
            </KeyboardAvoidingView>

            <TouchableOpacity>
                <Text 
                    style={styles.forgot_button}
                    onPress={() => {Vibration.vibrate(100); 
                        navigation.navigate("VisitorPage")
                    }}
                > 
                    Enter as visitor
                </Text>
            </TouchableOpacity>

            

        </View>
    )
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

      registerBtn: {
        width:'90%',
        borderBottomLeftRadius: 25,
        borderTopLeftRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        backgroundColor: "#ffb5a7",
        marginBottom: 20,
        marginLeft: 5,
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
        marginLeft: -5,
      },

      loginBtn: {
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