import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Animated, Alert } from "react-native";
import { TextInput } from "react-native-paper";
import { Modal } from "../components/Modal";
import { launchImageLibrary } from 'react-native-image-picker';
import { append } from "express/lib/response";

function UserPage({route, navigation}){
    const id_user = route.params.id;
    const isSameUser = (global.userId == id_user);

    const [isLoadingUser, setLoadingUser] = useState(true);
    const [dataUser, setDataUser] = useState([]);

    const [isLoadingPostToday, setLoadingPostToday] = useState(true);
    const [dataPostToday, setdataPostToday] = useState([]);

    const [isLoadingPostNotToday, setLoadingPostNotToday] = useState(true);
    const [dataPostNotToday, setdataPostNotToday] = useState([]);

    const [newPost, setNewPost] = useState(false);
    const [imagesPost, setImagesPost] = useState([]);
    const [descriptionPost, setDescriptionPost] = useState('');

    const [imageSource, setImageSource] = useState(null);

    //Get the informations of the user
    useEffect(() => {
        fetch('http://localhost:8000/user?id='+id_user, {method:"GET"})
          .then((response) => 
            response.json())
          .then((json) => {
            setDataUser(json[0])
          })
          .catch((error) => console.error(error))
          .finally(() => setLoadingUser(false));
      }, []);

    //Get today's post and photos
    useEffect(() => {
        fetch('http://localhost:8000/posts?id='+id_user+'&date='+new Date().toLocaleDateString('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'), {method:"GET"})
          .then((response) => 
            {
            if(response.status == 404){
                setdataPostToday([[
                    {
                        _id_photo:'',
                        _id_post:'',
                        _link_photo:'addPostToday.png'
                    }
                ]])
                setLoadingPostToday(false)
                throw('no post today')
            }else{
                return response.json()
            }})
          .then((json) => {
            let photos = [];
            fetch('http://localhost:8000/photos?id='+json[0]._id_post, {method:"GET"})
            .then((response) => {
                if(response.status == 404){
                    throw('no photos')
                }else{
                    return response.json()
                }
            })
            .then((json) => {
                let list = [{
                    _id_photo:'',
                    _id_post:'',
                    _link_photo:'addPostToday.png'
                }]
                for(let i of json){
                    list.push(i)
                }
                photos.push(list)
            })
            .then(() => setdataPostToday(photos))
            .finally(() => setLoadingPostToday(false))
            .catch((e) => console.error(e))
          })
          .catch((error) => console.error(error))
          
      }, []);

    //Get previous days posts and photos
    useEffect(() => {
        fetch('http://localhost:8000/posts?id='+id_user, {method:"GET"})
          .then((responsePost) => 
            {
                if(responsePost.status == 404){
                    throw('no posts')
                }else{
                    return responsePost.json()
                }
            })
          .then((jsonPost) => { //json of all posts
            let photos = [];
            let urls = [];
            for(let i of jsonPost){ //Get all photos from the posts
                urls.push('http://localhost:8000/photos?id='+i._id_post)
            }
            Promise.all(urls.map(url => fetch(url)))
                .then((responses) => Promise.all(responses.map(res => res.status != '404' ? res.json() : null))
                    .then((json) => {
                        for(let j of json){ //For every post
                            if(j != null){
                                for(let k of j){ //For every photo
                                    photos.push(k)
                                }
                            }
                        }
                    })
                    .then(() => setdataPostNotToday(photos))
                    .finally(() => setLoadingPostNotToday(false))
                )
          })
          .catch((error) => console.error(error))
          
      }, []);

    function selectImages() {
        let options = {
          title: 'Choose your photos',
          maxWidth: 256,
          maxHeight: 256,
          storageOptions: {
            skipBackup: true
          },
          includeBase64: true,
          selectionLimit: 5,
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
                let source = [];
                if (response.assets) {
                    for(let i of response.assets){
                        source.push(i.uri);
                    }
                }else{
                    for(let i of response){
                        source.push(i.uri);
                    }
                }
                setImageSource(source);
            }
          });
      }

    return (
        <View style={{flex: 1, flexDirection: "column", backgroundColor: "#f8edeb"}}>

            {/* Header */}
            <View style={{alignItems: "center", height:50}}>
                <Image
                    style={styles.imageTop} 
                    source={require("../assets/log2.png")}
                />
            </View>

            {/* User infos */}
            <View style={styles.container_user}>
                <View style={{flexDirection:"row", alignItems:"center", margin: 10, justifyContent:"space-between"}}>
                    {isLoadingUser ? <Text>Loading profile picture</Text> : 
                    <Image 
                        source={{uri:'http://localhost:8000/'+dataUser._pseudo_user+'/'+dataUser._profile_picture_user}}
                        style={styles.profile_pic}
                    />}
                    <View style={styles.container_text_user}>
                        <Text style={styles.pseudo}>
                            {isLoadingUser ? "loading pseudo" : dataUser._pseudo_user}
                        </Text>
                        <Text style={styles.description}>
                            {isLoadingUser ? "Loading description" : dataUser._description_user}
                        </Text>
                    </View> 
                </View>
                
            </View>

            {/* Posts */}
            <View style={styles.container_photo}>
                {/* Line Today */}
                <View style={{flex:1.80, alignItems:'center', width:'100%'}}>
                    <Image
                        source={require('../assets/Today.png')}
                        style={styles.imageText}
                    />
                    {isLoadingPostToday ? <Text>Loading...</Text> : 
                    <FlatList
                        style={{width:'100%'}}
                        horizontal={false} 
                        numColumns={3}
                        showsHorizontalScrollIndicator={false}
                        data={dataPostToday[0]}
                        renderItem={({item, index, separators}) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setNewPost(showImageDetails(navigation, item, dataUser))
                                }}
                                style={styles.buttonImage}
                            >
                                <Animated.Image
                                    source={{uri:'http://localhost:8000/'+dataUser._pseudo_user+'/'+item._link_photo}}
                                    style={styles.image}
                                >{/*console.log(item)*/}</Animated.Image>
                            </TouchableOpacity>
                        )}
                    />}
                </View>

                {/* Line not today */}
                <View style={{flex:4, alignItems:'center', width:'100%'}}>
                    <Image
                        source={require('../assets/notToday.png')}
                        style={styles.imageText}
                    />
                    {isLoadingPostNotToday ? <Text>Loading...</Text> : 
                    <FlatList
                        style={{width:'100%'}}
                        horizontal={false} 
                        numColumns={3}
                        showsHorizontalScrollIndicator={false} 
                        data={dataPostNotToday}
                        renderItem={({item, index, separators}) => (
                            <TouchableOpacity
                                onPress={() => {
                                    showImageDetails(navigation, item, dataUser)
                                }}
                                style={styles.buttonImage}
                            >
                                <Image
                                    source={{uri:'http://localhost:8000/'+dataUser._pseudo_user+'/'+item._link_photo}}
                                    style={styles.image}
                                >{/*console.log(item)*/}</Image>
                            </TouchableOpacity>
                            
                        )}
                    />}
                </View>
            </View>

            {/* Modal add post */}
            <Modal
                isVisible={newPost}
                onRequestClose={() => {
                    setNewPost(false)
                }}
            >
                <Modal.Container>
                    <Modal.Header title='Create a daily post' />      
                    
                    <Modal.Body>
                        {/* Images picker */}
                        <TouchableOpacity
                            onPress={() => selectImages()}
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
                                        source={{uri:imageSource[0]}}
                                        style={styles.image}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                        <View>
                            <Text>Description of the day</Text>
                            <TextInput
                                placeholder='Today was a lovely day, i met whales as you can see.'
                                onChangeText={(description) => setDescriptionPost(description)}
                            />
                        </View>
                        
                    </Modal.Body>  

                    <Modal.Footer>
                        <TouchableOpacity
                            onPress={() => createPost(descriptionPost ,imageSource)}
                        >
                            <Text>Create</Text>
                        </TouchableOpacity>
                    </Modal.Footer>  
                </Modal.Container>      
            </Modal>
        </View>
    )
}

const showImageDetails = (navigation, photo, dataUser) => {
    if(photo._link_photo == 'addPostToday.png'){
        return true;
    }else{
        navigation.navigate('DetailPhoto', {data: photo, user: dataUser})
        return false;
    }
}

const createPost = (descriptionPost, imagesPost) => {

    var postInformations = new FormData();
    postInformations.append('description', descriptionPost)
    postInformations.append('id_user', global.userId)
    postInformations.append('localisation', "Dans le camion")

    var postId = new FormData();

    fetch("http://localhost:8000/post", {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: postInformations
    })
    .then((resp) => {
        if(resp.status == 401){
            throw('An error occured during the creation of the post')
        }else{
            return resp.json()
        }
    })
    .then((json) => {
        postId.append('id_post', json.id_post)
        let photos = []
        for(let i of imagesPost){
            let temp = {
                uri: i,
                type: 'image/'+i.split('.').pop(),
                name: 'photo.'+i.split('.').pop()
            }
            photos.push(temp)
        }
        Promise.all(photos.map(photo => {
            postId.append('photo', photo),
            fetch('http://localhost:8000/photo',{method:'POST',headers:{'Content-Type':'multipart/form-data'},body: postId})
        }))
            .then((responses) => Promise.all(responses.map(res => console.log(res))))
    })
}

const styles = StyleSheet.create({
    container_user:{
        flex: 1,
        flexDirection: "column",
        backgroundColor: "#f8edeb",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginLeft: 10
    },

    container_text_user:{
        margin: 30,
    },

    container_photo: {
        flex: 4,
        alignItems: 'center'
    },

    pseudo:{
        fontSize: 30,
        marginBottom: 5,
        color: "#ffb5a7"
    },

    description:{
        fontSize: 15,
        color: "#ffb5a7"
    },

    profile_pic:{
        marginTop: 0,
        height: 100,
        width: 100,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: "#ffb5a7",
        overflow: 'hidden'
    },

    buttonImage: {
        marginTop: 0,
        margin: 0,
        padding: 0,
        width: '33.333%',
        aspectRatio: 1/1
    },

    image:{
        marginTop: 0,
        margin: 0,
        padding: 0,
        width: '100%',
        aspectRatio: 1/1,
        /*
        transform: [
            {
                opacity: timerA.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0]
                })
            }
        ],
        */
       /*
        opacity: this.state.fadeAnim, // Binds directly
        transform: [{
        translateY: this.state.fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [150, 0]  // 0 : 150, 0.5 : 75, 1 : 0
        }),
        }],
        */
    },

    imageTop: {
        marginTop: 0,
        width: 50,
        height: 50,
    },

    imageText: {
        marginTop: 0,
        width: '100%',
        height: 30,
        aspectRatio: 2076/171
    },
})

export default UserPage;