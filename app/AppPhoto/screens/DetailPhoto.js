import React, { useState, useEffect } from "react";
import { View, Image, Text} from "react-native";



const DetailPhoto = ({route, navigation}) => {
    const [photo, setPhoto] = useState(route.params.data);
    const [post, setPost] = useState(null)
    const [isPostLoading, setPostLoading] = useState(true)
    const dataUser = route.params.user;

    useEffect(() => {
        fetch('http://localhost:8000/post?id='+photo._id_post, {method:"GET"})
            .then((res) => res.json())
            .then((json) => setPost(json[0]))
            .finally(() => setPostLoading(false))
            .catch((e) => console.error(e))
    })

    return (
        <View>
            <Image
                source={{uri:'http://localhost:8000/'+dataUser._pseudo_user+'/'+photo._id_post+'/'+photo._link_photo}}
                style={{width:'100%', aspectRatio:1}}
            />
            <Text>
                {isPostLoading ? 'Loading...' : post._description_post}
                {isPostLoading ? 'Loading...' : post._localisation_post}
            </Text>
        </View>
    );
}

export default DetailPhoto;