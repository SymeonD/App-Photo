import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Image, Vibration, FlatList, TouchableOpacity, Animated, Alert, ScrollView, RefreshControl, Dimensions, KeyboardAvoidingView, Button, PermissionsAndroid } from "react-native";
//import { TextInput } from "react-native-paper";
import { Modal } from "../components/Modal";
import { launchImageLibrary } from 'react-native-image-picker';

import SearchButton from './modules/SearchButton.js';

import AsyncStorage from "@react-native-async-storage/async-storage";

import Geolocation from 'react-native-geolocation-service';

function UserPage({route, navigation}){

    //HERE API KEY for geocoding
    const HERE_API_KEY="7s-KY9LUN6upBN2-XZVY75QNwlV0p6fvj-Pi8Wcvvgs"

    const [userCoordinates, setUserCoordinates] = useState({latitude: 0, longitude: 0});

    const [userLocationState, setUserLocationState] = useState();

    const id_user = route.params.id; //User of the page showing != global user (user logged)
    
    const isSameUser = (global.userId == id_user); //For editing profile

    const [isLoadingUser, setLoadingUser] = useState(true);
    const [dataUser, setDataUser] = useState([]);

    const [isLoadingPostToday, setLoadingPostToday] = useState(true);
    const [dataPostToday, setdataPostToday] = useState([]);

    const [isLoadingPostNotToday, setLoadingPostNotToday] = useState(true);
    const [dataPostNotToday, setdataPostNotToday] = useState([]);

    const [newPost, setNewPost] = useState(false);
    const [imagesPost, setImagesPost] = useState(null);
    const [descriptionPost, setDescriptionPost] = useState('');

    const [flatListLayout, setFlatListLayout] = useState(null);

    //Location used in createPost
    const locationPost = '';
    const [isLoadingLocation, setLoadingLocation] = useState(false);

    //Profile Pic change
    const [imageReload, setImageReload] = useState(false);

    //Scroll to refresh
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        getUserInformations();
        getTodaysPosts();
        getNotTodaysPosts();
        setTimeout(() => {setRefreshing(false)}, 2000)
    }, []);

    //Search button options

    const [searching, setSearching] = useState(false)

    const [pageOffset, setPageOffset] = useState(0);

    const {height: fullHeight} = Dimensions.get('window');
    


    //Get the informations of the user
    //Get today's posts and photos
    //Get previous days posts and photos
    useEffect(() => {
        getUserInformations();
        getTodaysPosts();
        getNotTodaysPosts();
      }, []);

    function selectImages(op) {
        Vibration.vibrate(100);
        let options = {
          title: 'Choose your photos',
          //maxWidth: 256,
          //maxHeight: 256,
          storageOptions: {
            skipBackup: true
          },
          includeBase64: true,
          selectionLimit: 5,
        };
    
        launchImageLibrary(options, response => {
            if (response.didCancel) {
              console.log('User cancelled photo picker');
              setTimeout(() => {
                Alert.alert('You did not select any image',
                {cancelable:true})
              }, 100)
              //Alert.alert('You did not select any image');
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
                if(op == 'profile_pic'){
                    changeProfilePic(source[0])
                }else{
                    setImagesPost(source);
                }
            }
          });
      }

    async function getUserInformations() {
        fetch(global.urlAPI+'user?id='+id_user, {method:"GET"})
          .then((response) => 
            response.json())
          .then((json) => {
            setDataUser(json[0])
          })
          .catch((error) => console.error(error))
          .finally(() => {setLoadingUser(false)});
    }

    async function getTodaysPosts() {
        let today = new Date();
        fetch(global.urlAPI+'posts?id='+id_user+'&date='+today.toLocaleDateString('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'), {method:"GET"})
          .then((response) => 
            {
            if(response.status == 404){
                setdataPostToday([])
                setLoadingPostToday(false)
                return null
            }else{
                return response.json()
            }})
          .then((jsonPost) => {
            if(jsonPost){ //If there is posts
                let posts = [];
                let urls = [];
                for(let i of jsonPost){
                    urls.push(global.urlAPI+'photos?id='+i._id_post)
                    posts.push({post: i, photos: null})
                }
                Promise.all(urls.map(url => fetch(url)))
                    .then((responses) => Promise.all(responses.map(res => res.status != '404' ? res.json() : null))
                        .then((json) => {
                            let numPost = 0
                            for(let j of json){ //For every post
                                let photosPost = []
                                if(j != null){
                                    for(let k of j){ //For every photo
                                        photosPost.push(k)
                                    }
                                }
                                posts[numPost].photos = photosPost
                                numPost += 1;
                            }
                        })
                        .then(() => setdataPostToday(posts))
                        .finally(() => setLoadingPostToday(false))
                    )
            }
          })
          .catch((error) => console.error(error))
    }

    async function getNotTodaysPosts() {
        let today = new Date();
        fetch(global.urlAPI+'posts?id='+id_user+"&opt=before"+'&date='+today.toLocaleDateString('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'), {method:"GET"}) // get photos from before today
          .then((responsePost) => 
            {
                if(responsePost.status == 404){
                    setdataPostNotToday([])
                    setLoadingPostNotToday(false)
                    return null
                }else{
                    return responsePost.json()
                }
            })
          .then((jsonPost) => { //json of all posts
            if(jsonPost){ //If there is posts
                let urls = [];
                let posts = [];
                for(let i of jsonPost){ //Get all photos from the posts
                    urls.push(global.urlAPI+'photos?id='+i._id_post)
                    posts.push({post: i, photos: null})
                }
                Promise.all(urls.map(url => fetch(url)))
                    .then((responses) => Promise.all(responses.map(res => res.status != '404' ? res.json() : null))
                        .then((json) => {
                            let numPost = 0
                            for(let j of json){ //For every post
                                let photosPost = []
                                if(j != null){
                                    for(let k of j){ //For every photo
                                        photosPost.push(k)
                                    }
                                }
                                posts[numPost].photos = photosPost
                                numPost += 1;
                            }
                        })
                        .then(() => setdataPostNotToday(posts))
                        .finally(() => setLoadingPostNotToday(false))
                    )
            }
          })
          .catch((error) => console.error(error))
    }

    function createPost(descriptionPost, user_pseudo){
        let today = new Date()
        var postInformations = new FormData();
        let userLocationCity = userLocationState.city
        postInformations.append('description', descriptionPost)
        postInformations.append('id_user', dataUser._id_user)
        postInformations.append('localisation', userLocationCity)
        postInformations.append('date', today.toLocaleDateString('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'))

        fetch(global.urlAPI+"post", {
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
            let photos = []
            let success = true
            for(let i of imagesPost){
                let temp = {
                    uri: i,
                    type: 'image/'+((i.split('.').pop()) == 'jpg' ? 'jpeg' : i.split('.').pop()),
                    name: 'photo.'+i.split('.').pop()
                }
                photos.push(temp)
            }
            //Post every photos
            Promise.all(photos.map(photo => {
                var postId = new FormData();
                postId.append('photo', photo),
                postId.append('id_post', json.id_post)
                postId.append('pseudo', user_pseudo)
                postId.append('date', today.toLocaleDateString('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'))
                fetch(global.urlAPI+'photo',{method:'POST',headers:{'Content-Type':'multipart/form-data'},body: postId})
            }))
                .then((responses) => Promise.all(responses.map(res => res.status == 201 ? null : success = false)))
                .then(() => {
                    if(!success){
                        throw('Error during photo post')
                    }
                })
                .catch((e) => {setNewPost(!newPost)})
            setNewPost(!newPost)
            onRefresh()
        })
        .catch((e) => {setNewPost(!newPost)})
    }

    function changeProfilePic(image) {
        var profile_pic_file = {
            uri: image,
            type: 'image/'+((image.split('.').pop()) == 'jpg' ? 'jpeg' : image.split('.').pop()),
            name: 'profile_pic.'+image.split('.').pop()
        }
        let userInformations = new FormData();
        userInformations.append('profile_picture', profile_pic_file)
        userInformations.append('id', dataUser._id_user)
        userInformations.append('pseudo', dataUser._pseudo_user)

        fetch(global.urlAPI+'user', {
            method:'PATCH', 
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            body: userInformations
        })
            .then((res) => {
                if(res.status == 500){
                    console.log('An error occured during the patch')
                }else{
                    setImageReload(true)
                    //onRefresh()
                }
            })
            .catch((e) => {
                setImageReload(true)
                console.log('The patch issued an error : '+e)})
    }

    //patch user description
    function patchUser(description) {
        let userInformations = new FormData();
        userInformations.append('description', description);
        userInformations.append('id', dataUser._id_user) //Need this for patch
        userInformations.append('pseudo', dataUser._pseudo_user) //Need this for patch

        fetch(global.urlAPI+'user', {
            method:'PATCH', 
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            body: userInformations
        })
            .then((res) => {
                if(res.status == 500){
                    console.log('An error occured during the patch')
                }else{
                    console.log('The user was patched')
                }
            })
            .catch((e) => {
                console.log('The patch issued an error : '+e)})
    }

    function setLocation(){
        PermissionsAndroid.check('android.permission.ACCESS_COARSE_LOCATION')
            .then((responseCoarse) => {
                if(responseCoarse !== true){
                    //Get location permission
                    PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                        {
                            title: "Location access",
                            message:
                            "In order to auto fill location we need" +
                            "your approbation.",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
                        }
                    ).then((succcess) => {
                        if(succcess === 'granted'){
                            setLocation()
                        }
                    })
                }else{
                    PermissionsAndroid.check('android.permission.ACCESS_FINE_LOCATION')
                    .then((responseFine) => {
                        if(responseFine !== true){             
                            //Get location permission               
                            PermissionsAndroid.request(
                                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                                {
                                    title: "Location access",
                                    message:
                                    "In order to auto fill location we need" +
                                    "your approbation.",
                                    buttonNeutral: "Ask Me Later",
                                    buttonNegative: "Cancel",
                                    buttonPositive: "OK"
                                }
                            ).then((succcess) => {
                                if(succcess === 'granted'){
                                    setLocation()
                                }
                            })
                        }else{
                            //Get location
                            setLoadingLocation(true)
                            Geolocation.getCurrentPosition((position) => {
                                let latitudeUser = position.coords.latitude
                                let longitudeUser = position.coords.longitude
                                setUserCoordinates({latitude: latitudeUser, longitude: longitudeUser})
                                setLoadingLocation(false)
                            })

                            isLoadingLocation ? '' : 
                                fetch(`https://revgeocode.search.hereapi.com/v1/revgeocode?apiKey=${HERE_API_KEY}&at=${userCoordinates.latitude},${userCoordinates.longitude}`, {method:'GET'})
                                    .then((res) => res.json())
                                    .then((resJson) => {
                                        if (resJson
                                            && resJson.items
                                            && resJson.items.length > 0
                                            && resJson.items[0].address
                                            && resJson.items[0].address.city) {
                                            setUserLocationState(resJson.items[0].address)
                                        } else {
                                            setUserLocationState({city: 'not found'})
                                            console.log('not found')
                                        }
                                    })
                        }
                    })
                }
            })
    }

    return (
        <View 
            style={{flex: 1, flexDirection: "column", backgroundColor: "#f8edeb"}}
            onLayout = {({
                nativeEvent: {
                  layout: {height},
                },
              }) => {
                setPageOffset(fullHeight - height)
              }}
        >
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
                    <TouchableOpacity
                        onPress={() => isSameUser ? selectImages('profile_pic') : null}
                        activeOpacity={isSameUser ? 0.5 : 1}
                    >
                        {imageReload ? 
                            <Image 
                                source={{uri:global.urlAPI+''+dataUser._pseudo_user+'/'+dataUser._profile_picture_user + '?' + new Date()}} //Add a new date if needed
                                style={styles.profile_pic}
                            />
                        :
                            <Image 
                                source={{uri:global.urlAPI+''+dataUser._pseudo_user+'/'+dataUser._profile_picture_user}} //Add a new date if needed
                                style={styles.profile_pic}
                            />
                        }
                        
                    </TouchableOpacity>
                    }
                    <View style={styles.container_text_user}>
                        <Text style={styles.pseudo}>
                            {isLoadingUser ? "loading pseudo" : dataUser._pseudo_user}
                        </Text>

                        <TextInput 
                            style={styles.description}
                            onEndEditing={(resEdit) => {
                                patchUser(resEdit.nativeEvent.text)
                            }}   
                            editable={isSameUser ? true : false} 
                        >
                            {isLoadingUser ? "Loading description" : dataUser._description_user}
                        </TextInput>
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
                        {...getPhotosFromPost(dataPostToday, true, isSameUser).length <= 1 && !isSameUser ? <View style={{justifyContent:'center', flex:1}}><Text style ={styles.noPost}>No posts for now</Text></View> : 
                            <FlatList
                                style={{width:'100%'}}
                                horizontal={false} 
                                numColumns={3}
                                showsHorizontalScrollIndicator={false}
                                data={getPhotosFromPost(dataPostToday, true, isSameUser)}
                                renderItem={({item, index, separators}) => (
                                    
                                    <TouchableOpacity
                                        onPress={() => {
                                            setNewPost(showImageDetails(navigation, dataUser, index, getPhotosFromPost(dataPostToday, true, isSameUser)))
                                        }}
                                        style={styles.buttonImage}
                                    >
                                        <Animated.Image
                                            source={{uri:global.urlAPI+dataUser._pseudo_user+'/'+item._id_post+'/'+item._link_photo}}
                                            style={styles.image}
                                        ></Animated.Image>
                                    </TouchableOpacity>
                                        
                                )}
                            />
                        }
                    }
                </View>

                {/* Line not today */}
                <View style={{flex:4, alignItems:'center', width:'100%'}}>
                    <Image
                        source={require('../assets/notToday.png')}
                        style={styles.imageText}
                    />
                    {isLoadingPostNotToday ? <Text>Loading...</Text> : 
                        {...getPhotosFromPost(dataPostNotToday, false, isSameUser).length <= 1 && !isSameUser ? <View style={{justifyContent:'center', flex:1}}><Text style ={styles.noPost}>No posts for now</Text></View> : 
                            <FlatList
                                refreshControl={
                                    <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    />
                                }
                                style={{width:'100%'}}
                                horizontal={false} 
                                numColumns={3}
                                showsHorizontalScrollIndicator={false} 
                                data={getPhotosFromPost(dataPostNotToday, false, isSameUser)} //Paraeters: PostList, isNewPost, isSameUser
                                renderItem={({item, index, separators}) => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setNewPost(showImageDetails(navigation, dataUser, index, getPhotosFromPost(dataPostNotToday, false, isSameUser)))
                                        }}
                                        style={styles.buttonImage}
                                    >
                                        <Image
                                            source={{uri:global.urlAPI+dataUser._pseudo_user+'/'+item._id_post+'/'+item._link_photo}}
                                            style={styles.image}
                                        >{/*console.log(item)*/}</Image>
                                    </TouchableOpacity>
                                    
                                )}
                            />
                        }
                    }
                </View>
            </View>

            {/* Modal add post */}
            <Modal
                isVisible={newPost}
                onRequestClose={() => {
                    setNewPost(false)
                    setImagesPost(null)
                }}
            >
                <Modal.Container>
                    <Modal.Header title='Create a daily post' />  

                    <ScrollView
                        style={PopupStyles.scrollPost}
                    >
                        <Modal.Body>
                            {/* Images picker */}
                            {imagesPost == null ? 
                            (
                                <TouchableOpacity
                                style={PopupStyles.btnPhotos}
                                onPress={() => selectImages()}
                                >
                                    <View
                                        style={{marginBottom: 0}}
                                    >
                                        <Text
                                            style={{textAlign:'center', fontSize: 15}}
                                        >
                                            Pick {'\n'} your images
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                style={PopupStyles.btnPhotos}
                                onLongPress={() => selectImages()}
                                activeOpacity={1}
                                >
                                    <FlatList
                                        style={{width:'110%',aspectRatio:1}}
                                        horizontal={true}
                                        pagingEnabled={true}
                                        data={imagesPost}
                                        showsHorizontalScrollIndicator={false}
                                        keyExtractor={(item) => item.split('/').pop()}
                                        ItemSeparatorComponent={null}
                                        onLayout={(event) => {
                                            setFlatListLayout(event.nativeEvent.layout)
                                        }}
                                        renderItem={({item, index, separators}) => (
                                                {...flatListLayout == null ?
                                                    (
                                                        <Text>
                                                            Loading
                                                        </Text>
                                                    ) : (
                                                        <Image
                                                            source={{uri:item}}
                                                            style={{width:flatListLayout.width, aspectRatio: 1}}
                                                        />
                                                    )
                                                }
                                        )} 
                                    />
                                </TouchableOpacity>
                            )}

                            {/* Description */}
                            <View
                                style={PopupStyles.viewDescription}
                            >
                                <Text
                                    style={{marginTop:10, alignSelf:'center', fontSize:20, marginBottom:10}}
                                >
                                    Description of the day
                                </Text>
                                <TextInput
                                    placeholder='Today was a lovely day, i met whales as you can see.'
                                    onChangeText={(description) => setDescriptionPost(description)}
                                    style={PopupStyles.textDescription}
                                    maxLength={222}
                                    multiline={true}
                                />
                            </View>

                            {/* Location */}
                            <View
                                style={PopupStyles.viewLocation}
                            >
                                <Text
                                    style={{marginTop:10, alignSelf:'center', fontSize:20, marginBottom:10}}
                                >
                                    Location
                                </Text>

                                <TouchableOpacity
                                    onPress={() => setLocation()}
                                    style={PopupStyles.btnQuickLocation}
                                >
                                    <Text>Quick location {userLocationState == null ? (isLoadingLocation ? 'Loading' : null) : ': '+userLocationState.city} </Text>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Text
                                        style={PopupStyles.btnMapLocation}
                                    >Open location map</Text>
                                </TouchableOpacity>
                            </View>
                            
                        </Modal.Body>  
                    </ScrollView>

                    <Modal.Footer>
                        {/* Create */}
                        <TouchableOpacity
                            onPress={() => {
                                createPost(descriptionPost, dataUser._pseudo_user) //Images in ImagePost
                                setImagesPost(null)
                            }}
                            style={PopupStyles.btnPost}
                        >
                            <Text>Create</Text>
                        </TouchableOpacity>
                        {/* Cancel */}
                        <TouchableOpacity>
                            <Text style={PopupStyles.cancel_button}
                            onPress={() => {
                                setNewPost(!newPost)
                                setImagesPost(null)
                            }}>Cancel</Text>
                        </TouchableOpacity>
                    </Modal.Footer>  
                </Modal.Container>      
            </Modal>

            <SearchButton navigationProps={navigation}/>
        </View>
    )
}

const showImageDetails = (navigation, dataUser, index, photosList) => {
    if(photosList[index]._link_photo == 'addPostToday.png'){
        return true;
    }else{
        if(photosList[0]._link_photo == 'addPostToday.png'){ //Remove the photo adding post if exists
            photosList.shift()
            index--
        }
        navigation.navigate('DetailPhoto', {user: dataUser, index: index, photos: photosList})
        return false;
    }
}

const getPhotosFromPost = (posts, newPost, isSameUser) => {
    let photos = []
    if(posts.length == 0){
        if(newPost && isSameUser){
            photos.push({
                _id_photo:'',
                _id_post:'resources',
                _link_photo:'addPostToday.png'
            })
        }
        return(photos)
    }else{
        if(newPost && isSameUser){
            photos.push({
                _id_photo:'',
                _id_post:'resources',
                _link_photo:'addPostToday.png'
            })
        }
        for(let i of posts){
            for(let j of i.photos){
                photos.push(j)
            }
        }
        return(photos)
    }
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
        marginBottom: 0,
        color: "#ffb5a7"
    },

    description:{
        fontSize: 15,
        color: "#ffb5a7",
        paddingTop: 0
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
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
        height: 30,
        aspectRatio: 2076/171
    },

    noPost:{
        fontSize: 20,
        opacity: 0.7,
        
        alignSelf: 'center'
    },  
})

const PopupStyles = StyleSheet.create({
    image: {
        width: '70%',
        aspectRatio: 1,
        borderColor: '#ffffff'
    },

    btnQuickLocation: {
        height:50,
        width:'80%',
        alignItems: "center",
        justifyContent: "center",
        borderRadius:25,
        marginTop: 20,
        marginBottom: 15,
        backgroundColor: "#ffb5a7"
    },

    btnMapLocation: {
        height:30,
        color: '#f9dcc4'
    },

    btnPost:{
        height:50,
        width:'80%',
        alignItems: "center",
        justifyContent: "center",
        borderRadius:25,
        marginTop: 40,
        marginBottom: 15,
        backgroundColor: "#ffb5a7"
    },

    btnPhotos: {
        width: '110%',
        aspectRatio: 1,
        backgroundColor: "#ffb5a7",
        marginBottom: 20,
        alignItems:'center',
        justifyContent: 'center'
    },

    viewDescription: {
        width: '80%',
        height: 200,
    },

    viewLocation: {
        width: '100%',
        height: 200,
        alignItems: 'center',
    },

    scrollPost: {
        height: '50%'
    },

    textDescription: {
        backgroundColor: "#ffb5a7",
        fontSize: 15,
        borderRadius: 10,
        width: "120%",
        padding: 10,
        paddingLeft: 15,
        textAlign:"left",
        textAlignVertical: "top",
        minHeight: 100,
        marginLeft: '-10%',
        marginTop: 10,
        marginBottom: 10
    },

    cancel_button:{
        height:30,
        color: '#f9dcc4'
    },
})

const SearchStyle = StyleSheet.create({
    ButtonSearch:{
        borderRadius: 100, 
        height: '15%', 
        aspectRatio: 1, 
        backgroundColor: '#f9dcc4',
        justifyContent: 'center',
        marginTop: '-33%',
        alignSelf: 'flex-end',
        flexDirection: 'row'
    }, 

    InputSearch:{
        height: '100%',
        width: '80%',
        marginLeft: 10,
        fontSize: 15
    },  

    ImageSearch:{
        height: '70%', 
        aspectRatio: 842/936, 
        alignSelf: 'center'
    }
})

export default UserPage;